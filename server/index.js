// server/index.js — hardened express server for Railway (Gold-Standard+)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Import the Claude routes. These expose JSON and SSE endpoints for
// interacting with the Anthropic Claude API. Without mounting this
// router the frontend will receive 404s for `/api/claude-sse` and
// `/api/claude-json`, which leads to cryptic error messages in the UI.
import { router as claudeRouter } from "./routes/claude.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// ── Config
const PORT = Number(process.env.PORT || 8080);        // Railway setzt normalerweise PORT
const NODE_ENV = process.env.NODE_ENV || "production";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// ── App
const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
if (ALLOWED_ORIGINS.length) {
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        cb(null, ALLOWED_ORIGINS.includes(origin));
      },
    })
  );
} else {
  app.use(cors());
}

// Static (liefert index.html etc., falls vorhanden)
app.use(express.static(ROOT));

// -----------------------------------------------------------------------------
// API routes
//
// Mount all Claude-related routes under `/api`. The `claudeRouter` exports
// handlers for POST `/claude` (classic JSON completion), GET `/claude-sse` (SSE
// streaming) and POST `/claude-json` (structured JSON responses).  Mounting
// under `/api` results in URLs like `/api/claude-sse`.  Without this
// registration the frontend falls back to the JSON endpoint and raises
// `Error: Claude JSON 404`, as seen in the user screenshots.
app.use("/api", claudeRouter);

// ── Minimal-API (damit Healthchecks was Sinnvolles haben)
app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    env: NODE_ENV,
    port: PORT,
    time: new Date().toISOString(),
  });
});

// Fallback-Files (statisch), falls du kein echtes Backend nutzt
app.get("/api/daily", async (_req, res) => {
  try {
    const p = path.join(ROOT, "api", "daily.json");
    const j = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.get("/api/prompts/top", async (_req, res) => {
  try {
    const p = path.join(ROOT, "api", "prompt.json");
    const j = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.get("/api/news", async (_req, res) => {
  try {
    const p = path.join(ROOT, "api", "news.json");
    const j = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// ── Start
const server = app.listen(PORT, "0.0.0.0", () => {
  // Früh loggen, damit Railway-Healthchecks schnell anfangen können
  console.log(`server up on ${PORT} (env=${NODE_ENV})`);
});

// ── Graceful shutdown (wichtig gegen SIGTERM-Kills)
function shutdown(signal) {
  console.log(`[${signal}] received → graceful shutdown…`);
  server.close(err => {
    if (err) {
      console.error("Error during close:", err);
      process.exit(1);
    }
    console.log("HTTP server closed. Bye.");
    process.exit(0);
  });
  // Safety timer
  setTimeout(() => {
    console.warn("Force exit after 10s");
    process.exit(0);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
