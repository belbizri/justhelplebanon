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
