// server/index.js — Neon Gold UX+ Backends
// Node 20+ (global fetch); ESM; robust CORS, Helmet, Compression.
// Routes:
//   - POST /api/claude-sse   (SSE Streaming via Anthropic)
//   - POST /api/claude-json  (non-stream)
//   - GET  /api/news         (Tavily, 12h Cache, Stand: HH:MM)
//   - GET  /api/prompts/top  (Top-5 Prompts, 12h Cache)
//   - GET  /api/daily        (Daily Spotlight, 12h Cache)
//   - GET  /healthz          (Health)

import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, "..");

const app  = express();
const PORT = process.env.PORT || 8080;

// ───────────────────────────────────────────────────────────────────────────────
// ENV
const ALLOWED_ORIGINS   = (process.env.ALLOWED_ORIGINS || "").split(",").map(s=>s.trim()).filter(Boolean);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "";
const TAVILY_API_KEY    = process.env.TAVILY_API_KEY || "";
const MODEL_PRIMARY     = (process.env.CLAUDE_MODEL || "").trim();
const MODEL_FALLBACKS   = ["claude-3-5-sonnet-latest", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]
  .filter(m => !MODEL_PRIMARY || m !== MODEL_PRIMARY);
const MODELS_TO_TRY     = [MODEL_PRIMARY, ...MODEL_FALLBACKS].filter(Boolean);

const NEWS_TTL_MS   = 12 * 60 * 60 * 1000;
const TOP_TTL_MS    = 12 * 60 * 60 * 1000;
const DAILY_TTL_MS  = 12 * 60 * 60 * 1000;

// ───────────────────────────────────────────────────────────────────────────────
// APP SETUP
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, cb)=>{
    if (!origin) return cb(null, true);
    if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

// Static
app.use(express.static(ROOT));

// Simple in-mem Cache
const CACHE = new Map();
const now = () => Date.now();
const setCache = (k, data, ttl) => CACHE.set(k, { data, exp: now() + ttl });
const getCache = (k) => {
  const v = CACHE.get(k);
  if (!v) return null;
  if (now() > v.exp) { CACHE.delete(k); return null; }
  return v.data;
};
const hhmm = (d=new Date()) => d.toLocaleTimeString("de-DE", {hour:"2-digit",minute:"2-digit"});

// ───────────────────────────────────────────────────────────────────────────────
// Anthropic helpers
function anthHeaders() {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY fehlt");
  return { "content-type":"application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" };
}
function* modelChain() {
  for (const m of (MODELS_TO_TRY.length? MODELS_TO_TRY : ["claude-3-5-sonnet-20241022","claude-3-haiku-20240307"])) yield m;
}

// ── JSON (non-stream) ─────────────────────────────────────────────────────────
app.post("/api/claude-json", async (req, res) => {
  try {
    const { prompt="", system="hohl.rocks", max_tokens=900, temperature=0.25 } = req.body || {};
    let lastErr = null;

    for (const model of modelChain()) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: anthHeaders(),
          body: JSON.stringify({ model, max_tokens, temperature, system, messages: [{role:"user", content: prompt}] })
        });
        if (!r.ok) {
          const txt = await r.text();
          lastErr = new Error(`Claude JSON ${r.status}: ${txt}`);
          if (r.status === 404) continue;
          throw lastErr;
        }
        const j = await r.json();
        const text = (j?.content || []).map(c => c?.text || "").join("");
        return res.json({ model, text });
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Claude JSON fehlgeschlagen");
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ── SSE (stream) ───────────────────────────────────────────────────────────────
app.post("/api/claude-sse", async (req, res) => {
  try {
    const { prompt="", system="hohl.rocks", max_tokens=900, temperature=0.25 } = req.body || {};

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });

    let sent = false;
    for (const model of modelChain()) {
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { ...anthHeaders(), "accept":"text/event-stream" },
        body: JSON.stringify({ model, max_tokens, temperature, system, stream: true, messages: [{role:"user", content: prompt}] })
      });

      if (!upstream.ok) {
        const txt = await upstream.text().catch(()=> "");
        if (upstream.status === 404) continue;
        res.write(`event: error\ndata: ${JSON.stringify({status: upstream.status, message: txt})}\n\n`);
        res.write(`event: done\ndata: {}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, {stream:true});

        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const p of parts) {
          const dline = p.split("\n").find(l=> l.startsWith("data:"));
          if (!dline) continue;
          const data = dline.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt?.type === "content_block_delta" && evt?.delta?.text) {
              sent = true;
              res.write(`event: delta\ndata: ${JSON.stringify({text:evt.delta.text})}\n\n`);
            }
            if (evt?.type === "message_stop") {
              res.write(`event: done\ndata: {}\n\n`);
              return res.end();
            }
          } catch {/* ignore parsing issues */}
        }
      }
      break; // worked
    }

    if (!sent) {
      res.write(`event: error\ndata: ${JSON.stringify({error:"Kein zugängliches Modell. Bitte CLAUDE_MODEL anpassen."})}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
    }
    res.end();
  } catch (e) {
    try {
      res.write(`event: error\ndata: ${JSON.stringify({error:String(e.message||e)})}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    } catch {}
  }
});

// ── Tavily News (12h Cache) ───────────────────────────────────────────────────
app.get("/api/news", async (_req, res) => {
  const key = "news";
  const hit = getCache(key);
  if (hit) return res.json(hit);
  try {
    if (!TAVILY_API_KEY) throw new Error("TAVILY_API_KEY fehlt");
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: "KI News Deutschland Recht Tools EU AI Act DSGVO last 24 hours",
        search_depth: "advanced",
        max_results: 10,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const items = (j?.results || []).slice(0,8).map(it => ({
      title: it.title,
      url: it.url,
      source: (it.url || "").replace(/^https?:\/\/(www\.)?/,"").split("/")[0]
    }));
    const payload = { items, stand: hhmm() };
    setCache(key, payload, NEWS_TTL_MS);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ── Top-5 Prompts (12h Cache) ────────────────────────────────────────────────
app.get("/api/prompts/top", async (_req, res) => {
  const key = "top-prompts";
  const hit = getCache(key); if (hit) return res.json(hit);
  const items = [
    { title:"RAG-Diagnose in 90s", prompt:"Analysiere ein RAG-Setup (Index/Retriever/Chunking/Ranking). Liefere Messpunkte, 3 Quick-Wins & 1 Langfristmaßnahme."},
    { title:"Agent-SOP", prompt:"SOP für Agenten-Pipeline (Research→Synthese→Review→Publish) inkl. Handoffs & Stop-Rules."},
    { title:"GIST→FACT→CITE (Meeting)", prompt:"Meeting destillieren + Risiken/Mitigation als Tabelle (Owner, Due)."},
    { title:"Eval-Set-Builder", prompt:"10 Testfälle inkl. Edge-Cases & Hallu-Trigger; Score-Rubrik dazu."},
    { title:"One-Minute-Plan", prompt:"Ziel in 5 Mikro-Schritte (< 60 s) mit Micro-Ergebnis."}
  ];
  const payload = { items, stand: hhmm() };
  setCache(key, payload, TOP_TTL_MS);
  res.json(payload);
});

// ── Daily Spotlight (12h Cache) ──────────────────────────────────────────────
app.get("/api/daily", async (_req, res) => {
  const key = "daily";
  const hit = getCache(key); if (hit) return res.json(hit);
  try {
    if (!TAVILY_API_KEY) throw new Error("TAVILY_API_KEY fehlt");
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: "generative AI update OR LLM release OR EU AI Act guidance last 48 hours",
        search_depth: "advanced",
        max_results: 5,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}`);
    const j = await r.json();
    const first = (j?.results || [])[0];
    const title = first?.title || "KI-Notiz";
    const body  = `${first?.title || ""}\n${first?.url || ""}`;
    const payload = { title, body };
    setCache(key, payload, DAILY_TTL_MS);
    res.json(payload);
  } catch (e) {
    res.json({ title: "KI-Notiz", body: "(Daily nicht verfügbar)" });
  }
});

// Health
app.get("/healthz", (_req,res)=> res.json({ok:true, env:process.env.NODE_ENV||'development'}));

// SPA fallback (optional)
app.get("*", (req,res) => res.sendFile(join(ROOT,"index.html")));

app.listen(PORT, ()=> console.log(`server up on ${PORT} (env=${process.env.NODE_ENV||'development'})`));
