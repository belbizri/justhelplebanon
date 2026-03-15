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
      "https://api.reliefweb.int/v1/reports?appname=justhelplebanon&filter[field]=country.name&filter[value]=Lebanon&limit=6&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=source&fields[include][]=url_alias&fields[include][]=body"
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "ReliefWeb upstream error" });
  }
});

app.get("/api/crisis/unhcr", async (req, res) => {
  try {
    const r = await fetch(
      "https://data.unhcr.org/api/population/?limit=20&country_of_asylum=LBN&year=2024"
    );
    const text = await r.text();
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch {
      res.json({ items: [] });
    }
  } catch (e) {
    res.status(502).json({ error: "UNHCR upstream error" });
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
