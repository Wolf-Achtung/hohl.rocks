// server/index.js — Neon Gold UX+ API (Gold‑Standard+)
// Express + Helmet + Compression + CORS + robust SSE to Anthropic
// Routes:
//   POST /api/claude-json   -> one-shot completion
//   POST /api/claude-sse    -> streamed completion (Server‑Sent Events)
//   GET  /api/news          -> curated news (Tavily, 12h cache; static fallback)
//   GET  /api/prompts/top   -> top prompts (12h cache; static fallback)
//   GET  /api/daily         -> one daily spotlight bubble (12h cache; static fallback)
//   GET  /healthz
//
// Requirements: Node >= 20 (global fetch). package.json has "type":"module".
//
// Environment:
//   PORT
//   ALLOWED_ORIGINS   (comma separated, optional)
//   ANTHROPIC_API_KEY (or CLAUDE_API_KEY)
//   CLAUDE_MODEL      (default: claude-3-5-sonnet-20241022)
//   TAVILY_API_KEY    (optional)
//
// Static files are served from project root (index.html).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.join(__dirname, '..');

const PORT              = process.env.PORT || 8080;
const ALLOWED_ORIGINS   = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
const DEFAULT_MODEL     = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
const FALLBACK_MODELS   = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307'
];
const TAVILY_API_KEY    = process.env.TAVILY_API_KEY || '';
const NEWS_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PROMPT_CACHE_TTL  = 12 * 60 * 60 * 1000;
const DAILY_CACHE_TTL   = 12 * 60 * 60 * 1000;

const CACHE = {
  news:       { time: 0, data: null },
  topPrompts: { time: 0, data: null },
  daily:      { time: 0, data: null }
};

// ───────────────────────────────────────────────────────────────────────────────
// App
const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow explicit list or all (for static hosting)
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

// Static
app.use(express.static(ROOT));

// Helpers
const anthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01'
});
const modelsToTry = () => [DEFAULT_MODEL, ...FALLBACK_MODELS];
const fmtHHmm = (d = new Date()) => new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(d);

function withTimeout(ms = 60_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new Error(`fetch timeout after ${ms}ms`)), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(id) };
}

// ───────────────────────────────────────────────────────────────────────────────
// Claude — JSON (non‑streaming)
app.post('/api/claude-json', async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY fehlt' });
    const { prompt = '', system, max_tokens = 900, temperature = 0.25 } = req.body || {};

    let lastErr;
    for (const model of modelsToTry()) {
      const { signal, cancel } = withTimeout(90_000);
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: anthHeaders(),
          body: JSON.stringify({ model, max_tokens, temperature, system: system || undefined, messages: [{ role: 'user', content: prompt }] }),
          signal
        });
        cancel();
        if (!r.ok) {
          const txt = await r.text();
          if (r.status === 404) { lastErr = new Error(`Model not found: ${model}`); continue; }
          throw new Error(`Claude ${r.status}: ${txt}`);
        }
        const j = await r.json();
        const text = (j?.content?.map?.(c => c.text).join('') || '').trim();
        return res.json({ model, text });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('Claude JSON fehlgeschlagen');
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Claude — SSE (streaming)
app.post('/api/claude-sse', async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'text/event-stream' });
      res.write(`event: error\ndata: {"error":"ANTHROPIC_API_KEY fehlt"}\n\n`);
      return res.end();
    }
    const { prompt = '', system, max_tokens = 900, temperature = 0.25 } = req.body || {};

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    let sent = false;
    for (const model of modelsToTry()) {
      const { signal, cancel } = withTimeout(120_000);
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { ...anthHeaders(), Accept: 'text/event-stream' },
        body: JSON.stringify({ model, max_tokens, temperature, system: system || undefined, stream: true, messages: [{ role: 'user', content: prompt }] }),
        signal
      }).catch(e => ({ ok: false, status: 0, text: async () => String(e) }));

      cancel();
      if (!upstream.ok) {
        const txt = await upstream.text();
        if (upstream.status === 404) { continue; } // try next model
        res.write(`event: error\ndata: ${JSON.stringify({ status: upstream.status, message: txt })}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        buf += decoder.decode(value || new Uint8Array(), { stream: !done });
        let idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === 'message_start' || payload.type === 'message_delta') continue;
            if (payload.type === 'content_block_delta' && payload.delta?.type === 'text_delta') {
              const text = payload.delta?.text || '';
              if (text) {
                res.write(`event: delta\ndata: ${JSON.stringify({ text })}\n\n`);
                sent = true;
              }
            }
          } catch {}
        }
      }
      break;
    }

    if (!sent) {
      res.write(`event: error\ndata: {"error":"No models available or no data streamed"}\n\n`);
    }
    res.write(`event: done\ndata: [DONE]\n\n`);
    res.end();
  } catch (e) {
    console.error(e);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: String(e.message || e) })}\n\n`);
      res.end();
    } catch {}
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Tavily News (12h cache) → /api/news
app.get('/api/news', async (_req, res) => {
  try {
    const now = Date.now();
    if (CACHE.news.data && now - CACHE.news.time < NEWS_CACHE_TTL_MS) {
      return res.json(CACHE.news.data);
    }
    // If no API key, serve static fallback
    if (!TAVILY_API_KEY) {
      const fallbackPath = path.join(ROOT, 'api', 'news.json');
      const data = JSON.parse(await fs.readFile(fallbackPath, 'utf8'));
      CACHE.news = { time: now, data };
      return res.json(data);
    }

    const { signal, cancel } = withTimeout(30_000);
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'KI News Deutschland Recht Tools last 24 hours',
        search_depth: 'advanced',
        max_results: 10,
        include_answer: false,
        include_images: false
      }),
      signal
    });
    cancel();
    if (!r.ok) throw new Error(`Tavily ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const items = (j?.results || []).map(it => ({ title: it.title, url: it.url, snippet: it.content?.slice(0, 200) || it.snippet || '' }));
    const data = { stand: fmtHHmm(), items };
    CACHE.news = { time: now, data };
    res.json(data);
  } catch (e) {
    console.error(e);
    // Static fallback on error
    try {
      const fallbackPath = path.join(ROOT, 'api', 'news.json');
      const data = JSON.parse(await fs.readFile(fallbackPath, 'utf8'));
      CACHE.news = { time: Date.now(), data };
      res.json(data);
    } catch {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Top prompts (12h cache) → /api/prompts/top
app.get('/api/prompts/top', async (_req, res) => {
  try {
    const now = Date.now();
    if (CACHE.topPrompts.data && now - CACHE.topPrompts.time < PROMPT_CACHE_TTL) {
      return res.json(CACHE.topPrompts.data);
    }
    // static fallback
    const fallbackPath = path.join(ROOT, 'api', 'prompt.json');
    let top = JSON.parse(await fs.readFile(fallbackPath, 'utf8')).items || [];

    // If we have Claude, let it condense to the top 5
    if (ANTHROPIC_API_KEY && top.length) {
      const prompt = 'Verdichte die folgenden Prompt‑Ideen auf 5 herausragende Titel mit je 1‑Satz Beschreibung. ' +
                     'Formatiere als JSON‑Array von Objekten {title, prompt}.\n\n' +
                     top.slice(0, 20).map((t,i)=>`${i+1}. ${t.title}: ${t.prompt}`).join('\n');
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: anthHeaders(),
        body: JSON.stringify({ model: DEFAULT_MODEL, max_tokens: 600, temperature: 0.2, messages: [{ role: 'user', content: prompt }] })
      });
      if (r.ok) {
        const j = await r.json();
        const text = (j?.content?.map?.(c => c.text).join('') || '').trim();
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) top = parsed.slice(0, 5);
        } catch { /* leave top as is */ }
      }
    }

    const data = { stand: fmtHHmm(), items: top };
    CACHE.topPrompts = { time: Date.now(), data };
    res.json(data);
  } catch (e) {
    console.error(e);
    // static fallback
    try {
      const fallbackPath = path.join(ROOT, 'api', 'prompt.json');
      const data = JSON.parse(await fs.readFile(fallbackPath, 'utf8'));
      res.json(data);
    } catch {
      res.status(500).json({ error: String(e.message || e) });
    }
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Daily spotlight bubble (12h cache) → /api/daily
app.get('/api/daily', async (_req, res) => {
  try {
    const now = Date.now();
    if (CACHE.daily.data && now - CACHE.daily.time < DAILY_CACHE_TTL) {
      return res.json(CACHE.daily.data);
    }

    let best = { title: 'Praktischer KI‑Tipp', url: 'https://example.com', snippet: '' };
    if (TAVILY_API_KEY) {
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: 'generative AI news OR LLM update OR EU AI Act guidance last 48 hours',
          search_depth: 'advanced', max_results: 5, include_answer: false, include_images: false
        })
      });
      if (r.ok) {
        const js = await r.json();
        const first = (js?.results || [])[0];
        if (first) best = { title: first.title, url: first.url, snippet: first.content?.slice(0, 200) || first.snippet || '' };
      }
    }

    // Synthesize the bubble with Claude (or fallback text)
    let item = {
      label: 'Heute neu',
      hint: 'Täglich frisches Micro‑Topic',
      explain: 'Kurzformat: 1 Nutzenidee + 1 sofort anwendbarer Schritt.',
      action: 'claude',
      prompt: `Fasse in 6–9 Zeilen ein Micro‑Topic:
- 1 Zeile Kontext (heutiges KI‑Update)
- 3 praktische Takeaways (Anwendung)
- 1 Mini‑Aufgabe für heute (sofort testen)
Zielgruppe: beruflich Neugierige ohne Spezialwissen.
Nutze nüchternen, klaren Ton. Quelle (kurz): ${best.title} ${best.url}`
    };

    if (ANTHROPIC_API_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: anthHeaders(),
        body: JSON.stringify({
          model: DEFAULT_MODEL, max_tokens: 420, temperature: 0.3,
          messages: [{ role: 'user', content: `Baue eine kurze, nützliche Spotlight‑Box aus dieser Quelle: ${best.title} ${best.url}.` }]
        })
      });
      if (r.ok) {
        const j = await r.json();
        const text = (j?.content?.map?.(c => c.text).join('') || '').trim();
        if (text) item.prompt = text;
      }
    }

    const data = { stand: fmtHHmm(), item };
    CACHE.daily = { time: Date.now(), data };
    res.json(data);
  } catch (e) {
    console.error(e);
    // static fallback
    res.json({
      stand: fmtHHmm(),
      item: {
        label: 'Heute neu',
        hint: 'Micro‑Tipp (Fallback)',
        explain: 'Sofort umsetzbarer 1‑Minuten‑Impuls.',
        action: 'claude',
        prompt: 'Nenne 3 konkrete Mikroschritte, wie ich heute mit KI 10 Minuten spare – mit Beispielprompts.'
      }
    });
  }
});

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`server up on ${PORT}`));
