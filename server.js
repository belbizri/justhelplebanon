import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const ROOT = path.dirname(__filename);
const HOSTINGER_PUBLIC_ROOT = path.resolve(ROOT, '../public_html');
const STATIC_ROOT = process.env.STATIC_ROOT || (fs.existsSync(HOSTINGER_PUBLIC_ROOT) ? HOSTINGER_PUBLIC_ROOT : ROOT);
const ANALYTICS_DIR = path.join(ROOT, 'data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'analytics.json');
const ANALYTICS_KEY = process.env.ANALYTICS_KEY || '';

const defaultAnalytics = {
  generatedAt: new Date().toISOString(),
  totals: {
    pageViews: 0,
    donationClicks: 0,
    amountSelections: 0,
    allEvents: 0
  },
  amountSelections: {},
  eventsByName: {},
  events: []
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function ensureAnalyticsStore() {
  if (!fs.existsSync(ANALYTICS_DIR)) {
    fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2), 'utf8');
  }
}

function readAnalytics() {
  ensureAnalyticsStore();

  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      ...defaultAnalytics,
      ...parsed,
      totals: {
        ...defaultAnalytics.totals,
        ...(parsed.totals || {})
      },
      amountSelections: parsed.amountSelections || {},
      eventsByName: parsed.eventsByName || {},
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return { ...defaultAnalytics };
  }
}

function writeAnalytics(state) {
  fs.writeFileSync(
    ANALYTICS_FILE,
    JSON.stringify({ ...state, generatedAt: new Date().toISOString() }, null, 2),
    'utf8'
  );
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;

      if (body.length > 100_000) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

function requireAnalyticsKey(req, res) {
  if (!ANALYTICS_KEY) {
    return true;
  }

  const provided = req.headers['x-analytics-key'];
  if (provided !== ANALYTICS_KEY) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized' });
    return false;
  }

  return true;
}

function recordEvent(payload) {
  const name = String(payload.event || '').trim();
  if (!name) {
    return { ok: false, error: 'Missing event name' };
  }

  const analytics = readAnalytics();
  const amount = payload.amount != null ? String(payload.amount) : null;

  analytics.totals.allEvents += 1;
  analytics.eventsByName[name] = (analytics.eventsByName[name] || 0) + 1;

  if (name === 'page_view') {
    analytics.totals.pageViews += 1;
  }

  if (name === 'donation_click') {
    analytics.totals.donationClicks += 1;
  }

  if (name === 'amount_selected' && amount) {
    analytics.totals.amountSelections += 1;
    analytics.amountSelections[amount] = (analytics.amountSelections[amount] || 0) + 1;
  }

  analytics.events.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    event: name,
    amount,
    path: String(payload.path || '/'),
    referrer: String(payload.referrer || ''),
    userAgent: String(payload.userAgent || ''),
    createdAt: new Date().toISOString()
  });

  // Keep storage bounded for a small file-based deployment.
  if (analytics.events.length > 1000) {
    analytics.events = analytics.events.slice(-1000);
  }

  writeAnalytics(analytics);

  return { ok: true };
}

function resolveStaticPath(urlPath) {
  const normalizedPath = path.posix.normalize(urlPath || '/');
  const relativePath = normalizedPath.replace(/^\/+/, '').replace(/^(\.\.\/)+/, '');

  return relativePath || 'index.html';
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (method === 'POST' && urlPath === '/api/track') {
    parseBody(req)
      .then((payload) => {
        const result = recordEvent(payload);

        if (!result.ok) {
          sendJson(res, 400, result);
          return;
        }

        sendJson(res, 200, { ok: true });
      })
      .catch((err) => {
        const isPayloadError = err.message === 'Payload too large';
        sendJson(res, isPayloadError ? 413 : 400, { ok: false, error: err.message });
      });
    return;
  }

  if (method === 'GET' && urlPath === '/api/analytics') {
    if (!requireAnalyticsKey(req, res)) {
      return;
    }

    const analytics = readAnalytics();
    sendJson(res, 200, {
      ok: true,
      summary: {
        generatedAt: analytics.generatedAt,
        totals: analytics.totals,
        amountSelections: analytics.amountSelections,
        eventsByName: analytics.eventsByName
      },
      recentEvents: analytics.events.slice(-25).reverse()
    });
    return;
  }

  let filePath = path.join(STATIC_ROOT, resolveStaticPath(urlPath));

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Fallback to index for unknown routes so future client-side routing works.
    if (err && err.code === 'ENOENT' && !path.extname(filePath)) {
      sendFile(path.join(STATIC_ROOT, 'index.html'), res);
      return;
    }

    sendFile(filePath, res);
  });
});

server.listen(PORT, () => {
  const host = process.env.HOST || '0.0.0.0';
  console.log(`Server listening on ${host}:${PORT}`);
  console.log(`Serving static files from: ${STATIC_ROOT}`);
});
