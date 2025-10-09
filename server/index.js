// File: server/index.js
// server/index.js — hohl.rocks Backend (Gold‑Standard+)
// Complete, cleaned and enhanced version
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Feature routers
import { router as claudeRouter } from './routes/claude.js';
import { router as newsRouter } from './routes/news.js';            // optional, keeps parity
import { router as dailyIdeaRouter } from './routes/daily-idea.js'; // optional, keeps parity
import { router as researchRouter } from './routes/research-agent.js'; // optional

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const ENV = process.env.NODE_ENV || 'production';
const PORT = Number(process.env.PORT || 8080);

// ---- Small in‑memory TTL cache -------------------------------------------------
const TTL_MS = 12 * 60 * 60 * 1000; // 12h
const CACHE = new Map(); // key -> {data, exp}

const now = () => Date.now();
const hhmm = (d = new Date()) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function setCache(key, data, ttl = TTL_MS){
  CACHE.set(key, { data, exp: now() + ttl });
}
function getCache(key){
  const v = CACHE.get(key);
  if (!v) return null;
  if (now() > v.exp){ CACHE.delete(key); return null; }
  return v.data;
}

// ---- App ----------------------------------------------------------------------
const app = express();

// Basic hardening
app.use(helmet({ contentSecurityPolicy: false })); // CSP handled statically
app.disable('x-powered-by');

// CORS (allow list via env CORS_ORIGINS=a.com,b.com)
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb){
    if (!origin) return cb(null, true);
    if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

// Request ID + access log
app.use((req, res, next) => {
  const rid = req.headers['x-request-id'] || randomUUID();
  req.id = rid;
  res.setHeader('x-request-id', rid);
  next();
});
morgan.token('rid', (req) => req.id);
app.use(morgan(ENV === 'production'
  ? ':date[iso] :rid :method :url :status :response-time ms'
  : 'dev'
));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression (never for SSE)
const compressionFilter = (req, res) => {
  const accept = req.headers['accept'] || '';
  if (typeof accept === 'string' && accept.includes('text/event-stream')) return false;
  return compression.filter(req, res);
};
app.use(compression({ filter: compressionFilter }));

// Static hosting
app.use(express.static(ROOT, { etag: true, maxAge: ENV === 'production' ? '1h' : 0 }));

// ------------------ Health & diagnostics ---------------------------------------
app.get('/healthz', async (_req, res) => {
  const mem = process.memoryUsage();
  const details = {
    ok: true,
    env: ENV,
    now: new Date().toISOString(),
    uptime_s: Math.round(process.uptime()),
    port: PORT,
    node: process.version,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null,
    features: {
      tavily: Boolean(process.env.TAVILY_API_KEY || ''),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '')
    },
    cache: {
      size: CACHE.size,
      keys: Array.from(CACHE.keys()).slice(0, 10),
    },
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external
    }
  };
  res.set('Cache-Control', 'no-store');
  res.json(details);
});
app.head('/healthz', (_req, res) => res.status(200).end());

// SSE ping helper (for proxies / smoke-tests)
app.get('/__sse/ping', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write(`event: hello\ndata: ok\n\n`);
  const hb = setInterval(() => res.write(`:hb ${Date.now()}\n\n`), 15000);
  req.on('close', () => { clearInterval(hb); try { res.end(); } catch {} });
});

// ------------------ API routes --------------------------------------------------
// Claude SSE/JSON
app.use('/api', claudeRouter);

// Optional additional routers (no harm if endpoints overlap are unused)
app.use('/api', newsRouter);
app.use('/api', dailyIdeaRouter);
app.use('/api', researchRouter);

// Lightweight news (Tavily) with 12h cache and local fallback
app.get('/api/news', async (_req, res) => {
  const hit = getCache('news'); if (hit) return res.json(hit);
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error('TAVILY_API_KEY fehlt');
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: '("AI" OR "KI" OR "LLM") (EU OR Deutschland OR Europe) last 24 hours',
        search_depth: 'advanced',
        max_results: 8,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}`);
    const j = await r.json();
    const items = (j?.results || []).slice(0, 8).map(v => ({
      title: v.title,
      url: v.url,
      source: (v.url || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    }));
    const payload = { items, stand: hhmm() };
    setCache('news', payload);
    res.json(payload);
  } catch (e) {
    try {
      const local = JSON.parse(await fs.readFile(join(ROOT, 'api', 'news.json'), 'utf-8'));
      res.json(local);
    } catch {
      res.status(503).json({ error: 'news_unavailable', message: String(e?.message || e) });
    }
  }
});

// Top prompts (local file → 12h cache)
app.get('/api/prompts/top', async (_req, res) => {
  const hit = getCache('top-prompts'); if (hit) return res.json(hit);
  try {
    const local = JSON.parse(await fs.readFile(join(ROOT, 'wolf-picks.json'), 'utf-8'));
    const items = (local.topPrompts || local.dailyPrompts || []).slice(0, 12);
    const payload = { items };
    setCache('top-prompts', payload);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: 'prompts_unavailable', message: String(e?.message || e) });
  }
});

// Daily spotlight (Tavily → 12h cache, fallback local)
app.get('/api/daily', async (_req, res) => {
  const hit = getCache('daily'); if (hit) return res.json(hit);
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error('TAVILY_API_KEY fehlt');
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: 'generative AI OR LLM OR EU AI Act last 48 hours',
        search_depth: 'advanced',
        max_results: 5,
        include_answer: false,
        include_images: false
      })
    });
    if (!r.ok) throw new Error(`Tavily ${r.status}`);
    const j = await r.json();
    const first = (j?.results || [])[0] || {};
    const payload = {
      title: first.title || 'KI‑Notiz',
      body: `${first?.title || ''}\n${first?.url || ''}`.trim(),
      stand: hhmm()
    };
    setCache('daily', payload);
    res.json(payload);
  } catch (e) {
    try {
      const local = JSON.parse(await fs.readFile(join(ROOT, 'api', 'daily.json'), 'utf-8'));
      res.json(local);
    } catch {
      res.json({ title: 'KI‑Notiz', body: '(Daily nicht verfügbar)', stand: hhmm() });
    }
  }
});

// ------------------ SPA fallback -----------------------------------------------
app.get('/', (_req, res) => res.sendFile(join(ROOT, 'index.html')));
app.get('*', (_req, res) => res.sendFile(join(ROOT, 'index.html')));

// ------------------ Start & graceful shutdown ----------------------------------
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[info] server up on ${PORT} (env=${ENV})`);
});
server.keepAliveTimeout = 75_000;
server.headersTimeout = 76_000;
server.requestTimeout = 0;

function graceful(signal){
  const start = Date.now();
  console.log(`[info] received ${signal}, starting graceful shutdown…`);
  server.close((err) => {
    if (err){
      console.error('[error] server.close:', err);
      process.exit(1);
    }
    console.log(`[info] http server closed in ${Date.now() - start}ms`);
    process.exit(0);
  });
  // Fallback: hard exit after 10s
  setTimeout(() => {
    console.warn('[warn] forced shutdown after 10s');
    process.exit(0);
  }, 10_000).unref();
}
['SIGTERM','SIGINT'].forEach(s => process.on(s, () => graceful(s)));
process.on('unhandledRejection', (r) => console.error('[error] unhandledRejection', r));
process.on('uncaughtException', (e) => console.error('[error] uncaughtException', e));
