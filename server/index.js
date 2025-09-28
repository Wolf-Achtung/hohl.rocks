// server/index.js – Express + Claude (Anthropic) – Dual-Routen & SSE-freundliche Kompression
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config } from 'dotenv';
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);

// ──────────────────────────────────────────────────────────────────────────────
// Kompression: SSE ausschließen (sonst bricht Streaming)
const compressFilter = (req, res) => {
  // Wenn wir EventStream liefern (Claude-SSE, Chat-SSE), Kompression deaktivieren
  const ssePath = req.path === '/claude-sse' || req.path === '/chat-sse';
  if (ssePath) return false;

  // Fallback: Express-Standard-Filter
  return compression.filter(req, res);
};
app.use(compression({ filter: compressFilter }));

app.use(express.json({ limit: '12mb' }));

// CORS
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);               // curl/healthz etc.
      if (!allowed.length || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'), false);
    }
  })
);

// ──────────────────────────────────────────────────────────────────────────────
// APIs mounten (vor SPA-Fallback). Wir bedienen /claude* UND /chat* (Kompatibilität)
import { router as claude } from './routes/claude.js';
import { router as news }   from './routes/news.js';     // enthält /news/today und /daily/idea

// ohne Prefix
app.use(claude);
app.use('/news', news);

// mit /api Prefix (Netlify-Proxy/Meta-Base)
app.use('/api', claude);
app.use('/api/news', news);

// Aliasse für alte Clients
app.post('/chat',     (req, res, next) => ((req.url = '/claude'), next()));
app.get('/chat-sse',  (req, res, next) => ((req.url = '/claude-sse'), next()));

// Health & Root (Railway Healthcheck nie 404 liefern lassen)
app.get('/healthz', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/', (_req, res) => res.send('ok'));

// Statische Dateien (nach APIs, vor SPA-Fallback ist auch ok)
app.use(express.static(path.join(__dirname, '..')));

// SPA-Fallback: Unbekannte GETs auf index.html
app.use((req, res, next) => {
  const p = req.path || '';
  if (
    req.method === 'GET' &&
    !p.startsWith('/api') &&
    !p.startsWith('/claude') &&
    !p.startsWith('/chat') &&
    !p.startsWith('/news') &&
    !/\.(?:js|css|svg|png|jpg|jpeg|gif|ico|webm|mp4|map)$/i.test(p)
  ) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Fehlerfänger
app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ error: 'Internal Error', detail: String(err) });
});

// Unhandled rejections nicht stumm enden lassen
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
process.on('uncaughtException',  (e) => console.error('uncaughtException:', e));

// Start & Graceful Shutdown
const server = app.listen(PORT, '0.0.0.0', () => console.log('server up on', PORT));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
