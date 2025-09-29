// server/index.js — Neon Gold UX+ API
// Express + Helmet + Compression + CORS
// Routen: /api/claude-sse, /api/claude-json, /api/news (Tavily, 12h Cache), /api/prompts/top (12h), /api/daily (Spotlight)
// Node 20+ (fetch global), ESM (package.json: "type":"module")

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

// ───────────────────────────────────────────────────────────────────────────────
// Environment
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.join(__dirname, "..");

const PORT              = process.env.PORT || 8080;
const ALLOWED_ORIGINS   = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "";
const DEFAULT_MODEL     = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
const FALLBACK_MODELS   = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307"
];

const TAVILY_API_KEY    = process.env.TAVILY_API_KEY || "";
const NEWS_CACHE_TTL_MS = 12 * 60 * 60 * 1000;  // 12h
const PROMPT_CACHE_TTL  = 12 * 60 * 60 * 1000;  // 12h
const DAILY_CACHE_TTL   = 12 * 60 * 60 * 1000;  // 12h

const CACHE = {
  news:        { time: 0, data: null },
  topPrompts:  { time: 0, data: null },
  daily:       { time: 0, data: null }
};

// ───────────────────────────────────────────────────────────────────────────────
// App-Setup
const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (ALLOWED_ORIGINS.length) {
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      cb(null, ALLOWED_ORIGINS.includes(origin));
    }
  }));
} else {
  app.use(cors());
}

// Statische Dateien (index.html liegt im Projekt-Root)
app.use(express.static(ROOT));

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
const anthHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01"
});

const fmtHHmm = (d = new Date()) =>
  new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(d);

// Fallback-Modellstrategie: wir versuchen nacheinander
const modelsToTry = () => [DEFAULT_MODEL, ...FALLBACK_MODELS];

// ───────────────────────────────────────────────────────────────────────────────
// Claude – JSON (nicht streamend)
app.post("/api/claude-json", async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY fehlt" });
    const { prompt = "", system, max_tokens = 900, temperature = 0.25 } = req.body || {};

    let lastErr;
    for (const model of modelsToTry()) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: anthHeaders(),
        body: JSON.stringify({
          model, max_tokens, temperature,
          system: system || undefined,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!r.ok) {
        const txt = await r.text();
        lastErr = new Error(`Claude JSON ${r.status}: ${txt}`);
        if (r.status === 404) continue; // anderes Modell probieren
        throw lastErr;
      }
      const j = await r.json();
      const text = (j?.content?.map?.(c => c.text).join("") || "").trim();
      return res.json({ model, text });
    }
    throw lastErr || new Error("Claude JSON fehlgeschlagen");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Claude – SSE (streamend)
app.post("/api/claude-sse", async (resReq, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { "Content-Type": "text/event-stream" });
      res.write(`event: error\ndata: {"error":"ANTHROPIC_API_KEY fehlt"}\n\n`);
      return res.end();
    }

    const { prompt = "", system, max_tokens = 900, temperature = 0.25 } = resReq.body || {};

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    let sent = false;
    for (const model of modelsToTry()) {
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { ...anthHeaders(), Accept: "text/event-stream" },
        body: JSON.stringify({
          model, max_tokens, temperature,
          system: system || undefined,
          stream: true,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!upstream.ok) {
        const txt = await upstream.text();
        if (upstream.status === 404) continue; // nächstes Modell
        res.write(`event: error\ndata: ${JSON.stringify({ status: upstream.status, message: txt })}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const chunks = buf.split("\n\n");
        buf = chunks.pop() || "";
        for (const c of chunks) {
          const line = c.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const evt = JSON.parse(payload);
            if (evt.type === "content_block_delta" && evt.delta?.text) {
              sent = true;
              res.write(`event: delta\ndata: ${JSON.stringify({ text: evt.delta.text })}\n\n`);
            }
            if (evt.type === "message_stop") {
              res.write(`event: done\ndata: {}\n\n`);
              return res.end();
            }
          } catch { /* ignore parse */ }
        }
      }
      break; // Erfolg → raus
    }

    if (!sent) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Kein zugängliches Claude‑Modell. Bitte CLAUDE_MODEL anpassen." })}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
    }
    res.end();
  } catch (e) {
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: String(e.message || e) })}\n\n`);
      res.end();
    } catch { /* noop */ }
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Tavily News (12h Cache) → /api/news
app.get("/api/news", async (_req, res) => {
  try {
    const now = Date.now();
    if (CACHE.news.data && now - CACHE.news.time < NEWS_CACHE_TTL_MS) {
      return res.json(CACHE.news.data);
    }
    if (!TAVILY_API_KEY) {
      const data = {
        stand: fmtHHmm(),
        items: [
          { title: "KI-Update: Kompaktere LLMs, längere Kontexte", url: "https://example.com/ki", snippet: "Kleinere Modelle mit 128k+ Kontext erreichen respektable Qualität." },
          { title: "EU: Auslegungshilfen zum AI Act", url: "https://example.com/ai-act", snippet: "Hinweise für Anbieter/Betreiber – Fokus Risikoanalyse & Doku." }
        ]
      };
      CACHE.news = { time: now, data };
      return res.json(data);
    }

    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: "KI News Deutschland Recht Tools last 24 hours",
        search_depth: "advanced",
        max_results: 10,
        include_answer: false,
        include_images: false
      })
    });

    if (!r.ok) throw new Error(`Tavily ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const items = (j?.results || []).map(it => ({
      title: it.title, url: it.url, snippet: it.content?.slice(0, 200) || it.snippet || ""
    }));
    const data = { stand: fmtHHmm(), items };
    CACHE.news = { time: now, data };
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Top‑5 Prompts der Woche (12h Cache) → /api/prompts/top
app.get("/api/prompts/top", async (_req, res) => {
  const now = Date.now();
  if (CACHE.topPrompts.data && now - CACHE.topPrompts.time < PROMPT_CACHE_TTL) {
    return res.json(CACHE.topPrompts.data);
  }

  // Basis (Fallback)
  let top = [
    { title: "RAG‑Diagnose in 90s", prompt: "Analysiere ein RAG‑Setup (Index, Retriever, Chunking, Ranking). Liefere Messpunkte (Recall@k, Latenz), 3 Quick‑Wins, 1 Langfristschritt." },
    { title: "Agent‑Orchestrierung SOP", prompt: "Erzeuge eine SOP für ein Agentensystem (Research→Synthese→Review→Publish) inkl. Übergaben & Abbruchkriterien." },
    { title: "GIST→FACT→CITE für Meetings", prompt: "Fasse ein Meeting in GIST/FACT/CITE zusammen. Ergänze Risiken + Gegenmaßnahmen als Tabelle (Owner, Due)." },
    { title: "Eval‑Set‑Builder", prompt: "Baue 10 Tests mit Edge‑Cases & Hallu‑Trigger. Füge Score‑Rubrik hinzu." },
    { title: "One‑Minute‑Plan", prompt: "Zerlege mein Ziel in 5 Schritte (<60 s) mit Micro‑Ergebnissen." }
  ];

  try {
    if (ANTHROPIC_API_KEY) {
      const prompt = `Verdichte folgende Liste zu 5 herausragenden, sofort einsetzbaren KI-Prompts (deutsch, Titel + präziser Prompt):\n\n${top.map((t,i)=>`${i+1}. ${t.title}: ${t.prompt}`).join("\n")}`;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: anthHeaders(),
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 600,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (r.ok) {
        const j = await r.json();
        const text = (j?.content?.map?.(c => c.text).join("") || "").trim();
        const lines = text.split(/\n+/).filter(Boolean).slice(0, 20);
        const parsed = [];
        for (const ln of lines) {
          const m = ln.match(/^\d+\.?\s*(.+?):\s*(.+)$/);
          if (m) parsed.push({ title: m[1].trim(), prompt: m[2].trim() });
        }
        if (parsed.length >= 3) top = parsed.slice(0, 5);
      }
    }
  } catch {/* keep fallback */}

  const data = { stand: fmtHHmm(), items: top };
  CACHE.topPrompts = { time: now, data };
  res.json(data);
});

// ───────────────────────────────────────────────────────────────────────────────
// Daily Spotlight (12h Cache) → /api/daily
// Tavily → Claude erzeugt ein kurzes, „Bubble‑fertiges“ Thema (label/hint/explain/action/prompt)
app.get("/api/daily", async (_req, res) => {
  try {
    const now = Date.now();
    if (CACHE.daily.data && now - CACHE.daily.time < DAILY_CACHE_TTL) {
      return res.json(CACHE.daily.data);
    }

    // 1) Tavily: KI‑Thema der letzten 24–48h holen (ohne Bilder/Antworttexte)
    let best = { title: "Heute neu", url: "", snippet: "" };
    if (TAVILY_API_KEY) {
      const r = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: "generative AI news OR LLM update OR EU AI Act guidance last 48 hours",
          search_depth: "advanced",
          max_results: 5,
          include_answer: false,
          include_images: false
        })
      });
      if (r.ok) {
        const js = await r.json();
        const first = (js?.results || [])[0];
        if (first) best = { title: first.title, url: first.url, snippet: first.content?.slice(0, 200) || first.snippet || "" };
      }
    }

    // 2) Claude: Bubble‑Objekt erzeugen
    let item = {
      label: "Heute neu",
      hint: "Täglich frisches Micro‑Topic",
      explain: "Kurzformat: 1 Nutzenidee + 1 sofort anwendbarer Schritt.",
      action: "claude",
      prompt: `Fasse in 6–9 Zeilen ein Micro‑Topic:
- 1 Zeile Kontext (heutiges KI‑Update)
- 3 praktische Takeaways (Anwendung)
- 1 Mini‑Aufgabe für heute (sofort testen)
Zielgruppe: beruflich Neugierige ohne Spezialwissen.
Nutze nüchternen, klaren Ton. Quelle (kurz): ${best.title} ${best.url}`
    };

    if (ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: anthHeaders(),
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 500,
          temperature: 0.2,
          messages: [{
            role: "user",
            content:
`Erzeuge ein JSON für eine UI‑Bubble zum KI‑Tagesupdate auf Deutsch mit Feldern:
{ "label": "Heute neu", "hint": "<kurzer Hinweis>", "explain": "<1 Zeile Nutzen>", "action": "claude", "prompt": "<Kurzformat für LLM>" }
Nutze als Quelle: ${best.title} (${best.url})
Nur gültiges JSON antworten.`
          }]
        })
      });
      if (r.ok) {
        const j = await r.json();
        const text = (j?.content?.map?.(c => c.text).join("") || "").trim();
        try {
          const obj = JSON.parse(text);
          if (obj && obj.label && obj.prompt) item = obj;
        } catch {/* keep fallback */}
      }
    }

    const data = { stand: fmtHHmm(), item };
    CACHE.daily = { time: Date.now(), data };
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Health
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Start
app.listen(PORT, () => console.log(`server up on ${PORT}`));
