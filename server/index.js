// server/index.js
// Neon Gold UX+ — API-Backends für Claude (SSE + JSON), Tavily-News, Top-5-Prompts
// ESM (type: module) erwartet. Node 20+.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// ───────────────────────────────────────────────────────────────────────────────
// Env & Konfiguration
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.join(__dirname, "..");     // statische Dateien (index.html liegt im Projekt-Root)

const PORT               = process.env.PORT || 8080;
const ALLOWED_ORIGINS    = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const ANTHROPIC_API_KEY  = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "";
const DEFAULT_MODEL      = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
const FALLBACK_MODELS    = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307"
];
const TAVILY_API_KEY     = process.env.TAVILY_API_KEY || "";
const NEWS_CACHE_TTL_MS  = 12 * 60 * 60 * 1000; // 12h
const PROMPT_CACHE_TTL   = 12 * 60 * 60 * 1000; // 12h

// In-Memory-Cache (optional kannst du später Redis/Mongo anschließen)
const CACHE = {
  news: { time: 0, data: null },
  topPrompts: { time: 0, data: null }
};

// ───────────────────────────────────────────────────────────────────────────────
// Server-Setup
const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (ALLOWED_ORIGINS.length) {
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    }
  }));
} else {
  app.use(cors());
}

// Statische Dateien (index.html etc.)
app.use(express.static(ROOT));

// ───────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
function pickFirstModelYouHaveAccess(models) {
  // Wir probieren nacheinander; 404 bei Anthropic → nächstes Modell
  return models;
}
function anthHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01"
  };
}
function asHHmm(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(date);
}

// ───────────────────────────────────────────────────────────────────────────────
// Claude JSON (nicht-streamend)
app.post("/api/claude-json", async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY fehlt" });
    }
    const { prompt, system, thread, max_tokens = 800, temperature = 0.2 } = req.body || {};
    const modelsToTry = pickFirstModelYouHaveAccess([DEFAULT_MODEL, ...FALLBACK_MODELS]);

    let lastErr = null;
    for (const model of modelsToTry) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: anthHeaders(),
          body: JSON.stringify({
            model,
            max_tokens,
            temperature,
            system: system || undefined,
            messages: [{ role: "user", content: prompt || "" }]
          })
        });

        if (!r.ok) {
          const txt = await r.text();
          lastErr = new Error(`Claude JSON ${r.status}: ${txt}`);
          if (r.status === 404) continue;  // anderes Modell probieren
          throw lastErr;
        }
        const json = await r.json();
        const text = (json?.content?.map?.(c => c.text).join("") || "").trim();
        return res.json({ model, text });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Claude JSON fehlgeschlagen");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Claude SSE (streamend → an Frontend weitergereicht)
app.post("/api/claude-sse", async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { "Content-Type": "text/event-stream" });
      res.write(`event: error\ndata: {"error":"ANTHROPIC_API_KEY fehlt"}\n\n`);
      return res.end();
    }

    const { prompt, system, thread, max_tokens = 800, temperature = 0.2 } = req.body || {};
    const modelsToTry = pickFirstModelYouHaveAccess([DEFAULT_MODEL, ...FALLBACK_MODELS]);

    // SSE-Header zum Client
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    let sentAnything = false;
    let success = false;

    for (const model of modelsToTry) {
      try {
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            ...anthHeaders(),
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({
            model,
            max_tokens,
            temperature,
            system: system || undefined,
            stream: true,
            messages: [{ role: "user", content: prompt || "" }]
          })
        });

        if (!upstream.ok) {
          const txt = await upstream.text();
          if (upstream.status === 404) {
            // anderes Modell probieren
            continue;
          }
          // nicht 404 → harter Fehler
          res.write(`event: error\ndata: ${JSON.stringify({ status: upstream.status, message: txt })}\n\n`);
          return res.end();
        }

        // Stream parsen: Anthropic sendet JSON-Zeilen mit "data: { ... }"
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const evt = JSON.parse(payload);
              // Interessant sind content_block_delta { delta: { text } }
              if (evt.type === "content_block_delta" && evt.delta?.text) {
                sentAnything = true;
                res.write(`event: delta\ndata: ${JSON.stringify({ text: evt.delta.text })}\n\n`);
              }
              if (evt.type === "message_stop") {
                success = true;
              }
            } catch {
              // ignorieren
            }
          }
        }
        break; // Modell hat funktioniert → aus Schleife
      } catch (e) {
        // nächstes Modell versuchen
      }
    }

    if (!success) {
      if (!sentAnything) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "Kein zugelassenes Claude-Modell. Bitte anderes Modell in CLAUDE_MODEL setzen." })}\n\n`);
      }
    }
    res.write(`event: done\ndata: {}\n\n`);
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
app.get("/api/news", async (req, res) => {
  try {
    const now = Date.now();
    if (CACHE.news.data && (now - CACHE.news.time) < NEWS_CACHE_TTL_MS) {
      return res.json(CACHE.news.data);
    }
    if (!TAVILY_API_KEY) {
      // Fallback: statische Beispiele
      const data = {
        stand: asHHmm(),
        items: [
          { title: "KI-Update: Lokale Modelle werden leichter", url: "https://example.com/ki-lokale-modelle", snippet: "Kompakte LLMs laufen jetzt auf Consumer-GPUs mit besserem Kontextfenster." },
          { title: "EU: AI-Act Leitfäden konkretisiert", url: "https://example.com/eu-ai-act", snippet: "Neue Auslegungshilfen für Anbieter und Betreiber – Fokus auf Risikoanalyse." }
        ]
      };
      CACHE.news = { time: now, data };
      return res.json(data);
    }

    const query = "tagesaktuelle KI News Deutschland Recht Tools last 24 hours";
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        max_results: 10,
        include_answer: false,
        include_images: false
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Tavily ${r.status}: ${txt}`);
    }
    const json = await r.json();
    const items = (json?.results || []).map(it => ({
      title: it.title,
      url: it.url,
      snippet: it.content?.slice(0, 200) || it.snippet || ""
    }));

    const data = { stand: asHHmm(), items };
    CACHE.news = { time: now, data };
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Top-5 Prompts der Woche (12h Cache) → /api/prompts/top
app.get("/api/prompts/top", async (req, res) => {
  const now = Date.now();
  if (CACHE.topPrompts.data && (now - CACHE.topPrompts.time) < PROMPT_CACHE_TTL) {
    return res.json(CACHE.topPrompts.data);
  }

  // Basis-Liste (falls kein Research erlaubt)
  let top = [
    {
      title: "RAG-Diagnose in 90 Sekunden",
      prompt: "Analysiere ein bestehendes RAG-Setup: Index, Retriever, Chunking, Ranking. Liefere konkrete Messpunkte (Recall@k, Latency), 3 Quick-Wins und 1 Langfrist-Maßnahme."
    },
    {
      title: "Agent-Orchestrierung (SOP‑Generator)",
      prompt: "Erzeuge eine SOP (Standard Operating Procedure) für ein mehrstufiges Agentensystem (Research → Synthese → Review → Publishing)."
    },
    {
      title: "Meeting‑Destillation (Mitigation‑Plan)",
      prompt: "Fasse das Meeting in GIST→FACT→CITE zusammen. Erzeuge Risiken + Gegenmaßnahmen als Tabelle mit Owner & Due‑Date."
    },
    {
      title: "Eval‑Set‑Builder",
      prompt: "Baue ein kleines Eval‑Set (10 Fälle) für meinen Use‑Case. Mische Edge‑Cases, Ambiguitäten, Hallu‑Trigger. Liefere auch Scoring‑Rubrik."
    },
    {
      title: "„One‑Minute‑Plan“",
      prompt: "Zerlege mein Ziel in 5 sofortige Schritte (<60 s) mit Micro‑Ergebnissen, damit Momentum entsteht."
    }
  ];

  // Optional: Wenn ANTHROPIC_API_KEY gesetzt → einmal/12h via Claude verdichten/aktualisieren
  try {
    if (ANTHROPIC_API_KEY) {
      const prompt = `Verdichte folgende Liste zu 5 herausragenden, sofort einsetzbaren KI-Prompts (deutsch, prägnante Titel + 1 präziser Prompt-Text):\n\n${top.map((t,i)=>`${i+1}. ${t.title}: ${t.prompt}`).join("\n")}`;
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
        // Grobe Extraktion (Titel: Prompt)
        const lines = text.split(/\n+/).filter(Boolean).slice(0, 20);
        const parsed = [];
        for (const ln of lines) {
          const m = ln.match(/^\d+\.?\s*(.+?):\s*(.+)$/);
          if (m) parsed.push({ title: m[1].trim(), prompt: m[2].trim() });
        }
        if (parsed.length >= 3) top = parsed.slice(0, 5);
      }
    }
  } catch {
    // Fallback auf Basis-Liste
  }

  const data = { stand: asHHmm(), items: top };
  CACHE.topPrompts = { time: now, data };
  res.json(data);
});

// ───────────────────────────────────────────────────────────────────────────────
// SPA-Fallback (optional) – hier nicht nötig, da Index im Root liegt

// Start
app.listen(PORT, () => {
  console.log(`server up on ${PORT}`);
});
