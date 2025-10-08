// server/index.js — hohl.rocks Backends (Gold‑Standard+)
// Node 20+ (global fetch), ESM. Robust: Helmet, Compression (SSE‑safe),
// CORS, Morgan, Healthz, TTL‑Cache, Graceful Shutdown, SSE Ping.
// Endpunkte (ohne Frontend-Build): /healthz, /api/claude[-json|-sse], /api/news,
// /api/prompts/top, /api/daily, /__sse/ping

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

import { router as claudeRouter } from './routes/claude.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const ENV = process.env.NODE_ENV || 'production';
const PORT = Number(process.env.PORT || 8080);

// CORS: Whitelist per Env; no‑origin (curl/health) erlauben
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// TTL Cache (News/Daily/Top) — 12h
const TTL_MS = 12 * 60 * 60 * 1000;
const CACHE = new Map();
const now = () => Date.now();
const hhmm = (d = new Date()) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const setCache = (k, data, ttl = TTL_MS) => CACHE.set(k, { data, exp: now() + ttl });
const getCache = k => {
  const v = CACHE.get(k);
  if (!v) return null;
  if (now() > v.exp) {
    CACHE.delete(k);
    return null;
  }
  return v.data;
};

// App
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Disable compression for SSE
const compressionFilter = (req, res) => {
  if ((req.headers.accept || '').includes('text/event-stream')) return false;
  return compression.filter(req, res);
};
app.use(compression({ filter: compressionFilter }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

// Logging
if (ENV !== 'test') app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));

// Static root (liefert index.html, /public/*, /api/*.json Fallbacks)
app.use(express.static(ROOT));

// --- Healthz (GET/HEAD)
app.get('/healthz', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    env: ENV,
    uptime_s: Math.round(process.uptime()),
    port: PORT,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || null
  });
});
app.head('/healthz', (_req, res) => res.status(200).end());

// --- SSE Ping (manueller Test)
app.get('/__sse/ping', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write(`event: hello\ndata: {"msg":"sse online"}\n\n`);
  const hb = setInterval(() => res.write(`:hb ${Date.now()}\n\n`), 15000);
  req.on('close', () => { clearInterval(hb); try { res.end(); } catch {} });
});

// --- API: mount Claude routes under /api/*
app.use('/api', claudeRouter);

// --- API: News (Tavily → Fallback lokale JSON, TTL 12h)
app.get('/api/news', async (_req, res) => {
  const hit = getCache('news');
  if (hit) return res.json(hit);

  const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
  try {
    if (!TAVILY_API_KEY) throw new Error('TAVILY_API_KEY fehlt');

    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'AI LLM EU AI Act DSGVO Recht Tools last 24 hours',
        search_depth: 'advanced',
        max_results: 10,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const items = (j?.results || []).slice(0, 8).map(v => ({
      title: v.title,
      url: v.url,
      source: (v.url || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    }));
    const payload = { items, stand: hhmm() };
    setCache('news', payload);
    return res.json(payload);
  } catch {
    // Fallback
    try {
      const local = JSON.parse(await fs.readFile(join(ROOT, 'api', 'news.json'), 'utf-8'));
      return res.json(local);
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }
});

// --- API: Top‑Prompts (statisch → TTL 12h, falls später dynamisch)
app.get('/api/prompts/top', async (_req, res) => {
  const hit = getCache('top-prompts');
  if (hit) return res.json(hit);

  try {
    const local = JSON.parse(await fs.readFile(join(ROOT, 'api', 'prompt.json'), 'utf-8'));
    setCache('top-prompts', local);
    return res.json(local);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

// --- API: Daily Spotlight (Tavily → Fallback)
app.get('/api/daily', async (_req, res) => {
  const hit = getCache('daily');
  if (hit) return res.json(hit);

  const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
  try {
    if (!TAVILY_API_KEY) throw new Error('TAVILY_API_KEY fehlt');
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'generative AI update OR LLM release OR EU AI Act guidance last 48 hours',
        search_depth: 'advanced',
        max_results: 5,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}`);
    const j = await r.json();
    const first = (j?.results || [])[0];
    const payload = {
      title: first?.title || 'KI‑Notiz',
      body: `${first?.title || ''}\n${first?.url || ''}`.trim(),
      stand: hhmm()
    };
    setCache('daily', payload);
    return res.json(payload);
  } catch {
    try {
      const local = JSON.parse(await fs.readFile(join(ROOT, 'api', 'daily.json'), 'utf-8'));
      return res.json(local);
    } catch (e) {
      return res.status(200).json({ title: 'KI‑Notiz', body: '(Daily nicht verfügbar)', stand: hhmm() });
    }
  }
});

// --- SPA Fallback (liefert index.html)
app.get('*', (_req, res) => res.sendFile(join(ROOT, 'index.html')));

// --- Server Start + Timeouts + Graceful Shutdown
const server = app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`server up on ${PORT} (env=${ENV})`);
});
server.keepAliveTimeout = 75_000; // > 60s (LBs)
server.headersTimeout = 76_000;
server.requestTimeout = 0;

const sseClients = new Set(); // (optional) nutzbar, falls später globales SSE nötig

const graceful = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`received ${signal}, shutting down gracefully…`);
  for (const res of sseClients) {
    try { res.write('event: server\ndata: "shutting down"\n\n'); res.end(); } catch {}
  }
  server.close((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error on server.close:', err);
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
};

process.on('SIGTERM', () => graceful('SIGTERM'));
process.on('SIGINT', () => graceful('SIGINT'));
process.on('unhandledRejection', (r) => console.error('unhandledRejection', r));
process.on('uncaughtException', (e) => console.error('uncaughtException', e));
