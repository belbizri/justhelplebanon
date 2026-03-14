import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { isIP } from 'net';
import { fileURLToPath } from 'url';

console.log('Starting server with configuration:');

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.dirname(__filename);

/*
  IMPORTANT:
  Your React app builds into /dist.
  That is what the server must serve in production.
*/
const STATIC_ROOT = path.join(ROOT, 'dist');

const ANALYTICS_DIR = path.join(ROOT, 'data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'analytics.json');
const ANALYTICS_KEY = process.env.ANALYTICS_KEY || '';

console.log('ROOT:', ROOT);
console.log('STATIC_ROOT:', STATIC_ROOT);
console.log('PORT:', PORT);

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};



const rawLogLevel = String(
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
).toLowerCase();
const LOG_LEVEL = Object.prototype.hasOwnProperty.call(LOG_LEVELS, rawLogLevel) ? rawLogLevel : 'info';
const LOG_REQUESTS = !['0', 'false', 'off', 'no'].includes(String(process.env.LOG_REQUESTS || 'true').toLowerCase());

function log(level, message, details) {
  if (LOG_LEVELS[level] > LOG_LEVELS[LOG_LEVEL]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (details !== undefined) {
    console.log(prefix, message, details);
    return;
  }

  console.log(prefix, message);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

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
        log('warn', 'Static file not found', { filePath });
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      log('error', 'Failed reading static file', { filePath, error: err.message });
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    log('debug', 'Served static file', { filePath, contentType });
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
        log('warn', 'Rejected oversized request body', { path: req.url, size: body.length });
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
        log('warn', 'Rejected invalid JSON payload', { path: req.url });
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (err) => {
      log('error', 'Request stream error', { path: req.url, error: err.message });
      reject(err);
    });
  });
}

function requireAnalyticsKey(req, res) {
  if (!ANALYTICS_KEY) {
    return true;
  }

  const provided = req.headers['x-analytics-key'];
  if (provided !== ANALYTICS_KEY) {
    log('warn', 'Unauthorized analytics access attempt', {
      path: req.url,
      ip: getClientIp(req)
    });
    sendJson(res, 401, { ok: false, error: 'Unauthorized' });
    return false;
  }

  return true;
}

function recordEvent(payload) {
  const name = String(payload.event || '').trim();
  if (!name) {
    log('warn', 'Event rejected: missing event name', { payload });
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

  log('info', 'Tracked analytics event', {
    event: name,
    amount,
    path: String(payload.path || '/'),
    totals: analytics.totals
  });

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
  const startedAt = Date.now();
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

  if (LOG_REQUESTS) {
    log('info', `[${requestId}] Incoming request`, {
      method,
      path: urlPath,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || ''
    });
  }

  res.on('finish', () => {
    if (!LOG_REQUESTS) {
      return;
    }

    log('info', `[${requestId}] Request completed`, {
      method,
      path: urlPath,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });

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
        log('warn', 'Failed tracking request', {
          path: urlPath,
          error: err.message,
          statusCode: isPayloadError ? 413 : 400
        });
        sendJson(res, isPayloadError ? 413 : 400, { ok: false, error: err.message });
      });
    return;
  }

  if (method === 'GET' && urlPath === '/api/analytics') {
    if (!requireAnalyticsKey(req, res)) {
      return;
    }

    const analytics = readAnalytics();
    log('debug', 'Analytics summary requested', {
      ip: getClientIp(req),
      totals: analytics.totals,
      eventsByName: analytics.eventsByName
    });
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

  if (method === 'GET' && urlPath === '/api/ping') {
    sendJson(res, 200, {
      ok: true,
      message: 'Node server is alive',
      time: new Date().toISOString(),
      port: PORT
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

const DEFAULT_HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const rawHost = process.env.HOST || '';
const hostIsValid = rawHost === '' || rawHost === 'localhost' || isIP(rawHost) !== 0;
const host = hostIsValid ? (rawHost || DEFAULT_HOST) : DEFAULT_HOST;

if (!hostIsValid) {
  log('warn', 'Invalid HOST value detected. Falling back to default host.', {
    providedHost: rawHost,
    fallbackHost: DEFAULT_HOST
  });
}

server.listen(PORT, host, () => {
  log('info', `Server listening on ${host}:${PORT}`);
  log('info', `Serving static files from: ${STATIC_ROOT}`);
  log('info', 'Logging configuration', { LOG_LEVEL, LOG_REQUESTS });
});
