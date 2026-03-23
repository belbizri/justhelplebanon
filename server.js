import express from "express";
import "dotenv/config";
import { promises as fs } from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getVideoUrl, getOrgVideoUrl } from "./services/r2.js";
import dbConnection from "./db/database.js";
import apiRoutes from "./db/routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ── Org-media key map (friendly key → real R2 key) ── */
let orgMediaMap = {};
const mapPath = path.join(__dirname, "data", "orgmedia-map.json");
try {
  orgMediaMap = JSON.parse(await fs.readFile(mapPath, "utf-8"));
} catch { /* file missing or invalid — start empty */ }

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const PUBLIC_VIDEOS_DIR = path.join(PUBLIC_DIR, "videos");
const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, "data");
const VIDEOS_MANIFEST_PATH = path.join(PUBLIC_DATA_DIR, "videos.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

const sanitizeVideoSlug = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "video";
};

const readVideosManifest = async () => {
  try {
    const raw = await fs.readFile(VIDEOS_MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const writeVideosManifest = async (videos) => {
  await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  await fs.writeFile(VIDEOS_MANIFEST_PATH, `${JSON.stringify(videos, null, 2)}\n`, "utf8");
};

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(PUBLIC_VIDEOS_DIR, { recursive: true });
        cb(null, PUBLIC_VIDEOS_DIR);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const basename = path.basename(file.originalname, ext);
      const slug = sanitizeVideoSlug(basename);
      cb(null, `${slug}-${Date.now()}${ext}`);
    },
  }),
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedType = ALLOWED_VIDEO_EXTENSIONS.has(ext) || ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype);

    if (!isAllowedType) {
      cb(new Error("Only MP4, MOV, WEBM, and M4V videos are supported."));
      return;
    }

    cb(null, true);
  },
});

// --- Donation stats (logic hidden server-side) ---
const CAMPAIGN_START = new Date("2024-10-01T00:00:00Z");
const BASE_AMOUNT = 12480;
const BASE_COUNT = 312;
const HOURLY_INCREMENT = 10;
const AVG_DONATION = 40;
const GOAL = 200000;

app.get("/api/donation-stats", (req, res) => {
  const now = Date.now();
  const elapsed = Math.max(0, now - CAMPAIGN_START.getTime());
  const hours = Math.floor(elapsed / 3_600_000);
  const raised = BASE_AMOUNT + hours * HOURLY_INCREMENT;
  const count = BASE_COUNT + Math.floor((hours * HOURLY_INCREMENT) / AVG_DONATION);
  res.json({ raised, count, goal: GOAL, updated: new Date(now).toISOString() });
});

// --- Crisis data proxy endpoints (avoids CORS) ---

app.get("/api/crisis/hdx", async (req, res) => {
  try {
    const r = await fetch(
      "https://data.humdata.org/api/3/action/package_search?q=lebanon+idp&rows=6"
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "HDX upstream error" });
  }
});

app.get("/api/crisis/reliefweb", async (req, res) => {
  try {
    const r = await fetch(
      "https://reliefweb.int/updates/rss.xml?search=Lebanon&format=rss"
    );
    const xml = await r.text();
    // Parse RSS XML into simple JSON array
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
      };
      items.push({
        title: get("title"),
        link: get("link"),
        pubDate: get("pubDate"),
        description: get("description").slice(0, 200),
      });
    }
    res.json({ data: items });
  } catch (e) {
    res.status(502).json({ error: "ReliefWeb upstream error" });
  }
});

app.get("/api/crisis/unhcr", async (req, res) => {
  try {
    const r = await fetch(
      "https://api.unhcr.org/population/v1/population/?limit=100&year=2023&coa=LEB&coo_all=true",
      { headers: { Accept: "application/json" } }
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "UNHCR upstream error" });
  }
});

// --- MoPH ArcGIS proxy endpoints ---

app.get("/api/moph/attacks", async (req, res) => {
  try {
    const r = await fetch(
      "https://maps.moph.gov.lb/server/rest/services/Hosted/Attacks_on_hospitals/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000"
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "MoPH upstream error" });
  }
});

app.get("/api/moph/attacks2024", async (req, res) => {
  try {
    const r = await fetch(
      "https://maps.moph.gov.lb/server/rest/services/Hosted/Hospitals_Attacks2024/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000"
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "MoPH upstream error" });
  }
});

app.post("/api/videos/upload", upload.single("video"), async (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ error: "Select a video file to upload." });
    return;
  }

  try {
    const title = String(req.body?.title || "").trim();
    const videoEntry = {
      src: `/videos/${req.file.filename}`,
      title,
    };

    const videos = await readVideosManifest();
    videos.push(videoEntry);
    await writeVideosManifest(videos);

    res.status(201).json({ video: videoEntry, videos });
  } catch (error) {
    next(error);
  }
});

app.use("/videos", express.static(PUBLIC_VIDEOS_DIR));
app.use("/data", express.static(PUBLIC_DATA_DIR));

// Serve the built React app
app.use(express.static(path.join(__dirname, "dist")));

app.get("/api/videos/signed-url", async (req, res) => {
  const key = String(req.query.key || "").trim();

  if (!key) {
    res.status(400).json({ error: "Query parameter 'key' is required." });
    return;
  }

  try {
    const url = await getVideoUrl(key);
    res.json({ key, url, expiresIn: 3600 });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not generate signed URL." });
  }
});

app.get("/api/orgvideos/signed-url", async (req, res) => {
  const alias = String(req.query.key || "").trim();

  if (!alias) {
    res.status(400).json({ error: "Query parameter 'key' is required." });
    return;
  }

  const realKey = orgMediaMap[alias];
  if (!realKey) {
    res.status(404).json({ error: "Unknown media key." });
    return;
  }

  try {
    const url = await getOrgVideoUrl(realKey);
    res.json({ key: alias, url, expiresIn: 3600 });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not generate signed URL." });
  }
});

app.get("/api", (req, res) => {
  res.json({
    message: "API working",
    timestamp: new Date()
  });
});

// SPA fallback — serve index.html for all non-API routes
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "Video exceeds the 250 MB upload limit." });
      return;
    }

    res.status(400).json({ error: error.message });
    return;
  }

  if (error) {
    res.status(500).json({ error: error.message || "Unexpected server error." });
    return;
  }

  next();
});

/* ── MongoDB API Routes ── */
app.use('/api', apiRoutes);

/* ── Start Server ── */
const startServer = async () => {
  try {
    /* Initialize MongoDB connection */
    await dbConnection.connect();
    
    /* Check database health */
    const health = await dbConnection.healthCheck();
    if (health.healthy) {
      console.log('✓ Database connectivity verified');
    } else {
      console.warn('⚠️ Database health check:', health.message);
    }

    /* Start Express server */
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Status: ${dbConnection.getStatus().isConnected ? 'Connected to MongoDB' : 'Not connected to MongoDB'}\n`);
    });

    /* Graceful shutdown */
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await dbConnection.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
