import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve the built React app
app.use(express.static(path.join(__dirname, "dist")));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
