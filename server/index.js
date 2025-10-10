// File: server/index.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'node:path';
import fs from 'node:fs/promises';

import claudeRouter from './routes/claude.js';
import contentRouter from './routes/content.js';
import configRouter from './routes/config.js';
import searchRouter from './routes/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

const app = express();

// Proxy trust (Railway/Render)
if ((process.env.TRUST_PROXY || '').toLowerCase() === 'true') app.set('trust proxy', true);

// Security
const CSP_ENABLE = (process.env.CSP_ENABLE || 'true').toLowerCase() === 'true';
app.use(helmet({
  contentSecurityPolicy: CSP_ENABLE ? {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://us.umami.is"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": ["'self'", "https://api.anthropic.com", "https://api.tavily.com", "https://hohlrocks-production.up.railway.app", "https://hohl.rocks"],
      "media-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false
}));

// CORS allow-list
const ALLOWED = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || "https://hohl.rocks,https://hohlrocks-production.up.railway.app")
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb){
    if (!origin) return cb(null, true);
    if (!ALLOWED.length || ALLOWED.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Request-ID + access log
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', id);
  req.id = id;
  next();
});
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms rid=:req[id]'));
 
// Basic rate limit (in-memory)
const BUCKET_MS = 60_000;
const BUCKET_MAX = Number(process.env.RATE_LIMIT_PER_MIN || 180);
const buckets = new Map();
setInterval(() => buckets.clear(), BUCKET_MS).unref();
app.use((req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const n = (buckets.get(ip) || 0) + 1;
  buckets.set(ip, n);
  if (n > BUCKET_MAX) return res.status(429).json({ error: 'Too Many Requests' });
  next();
});

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Static
app.use('/public', express.static(join(projectRoot, 'public'), { index: false }));
app.use(express.static(projectRoot, { index: false }));

// API routers
app.use(claudeRouter);
app.use(contentRouter);
app.use(configRouter);
app.use(searchRouter);

// Root -> SPA
app.get('/', async (_req, res, next) => {
  try {
    const html = await fs.readFile(join(projectRoot, 'public', 'index.html'), 'utf8');
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) { next(e); }
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

// Error
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => console.log(`[info] up on ${PORT}`));

// Graceful shutdown
function bye(signal){
  console.log(`[info] ${signal} received, closing…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
}
for (const s of ['SIGTERM','SIGINT']) process.on(s, () => bye(s));
