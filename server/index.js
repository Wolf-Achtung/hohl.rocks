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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..'); // /app

const app = express();

if ((process.env.TRUST_PROXY || '').toLowerCase() === 'true') {
  app.set('trust proxy', true);
}

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

app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', id);
  // @ts-ignore
  req.id = id;
  next();
});
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms rid=:req[id]'));

const BUCKET_MS = 60_000;
const BUCKET_MAX = Number(process.env.RATE_LIMIT_PER_MIN || 120);
const buckets = new Map();
setInterval(() => buckets.clear(), BUCKET_MS).unref();
app.use((req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const n = (buckets.get(ip) || 0) + 1;
  buckets.set(ip, n);
  if (n > BUCKET_MAX) return res.status(429).json({ error: 'Too Many Requests' });
  next();
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.use(express.static(join(projectRoot, 'public'), { index: false, fallthrough: true }));
app.use(express.static(projectRoot, { index: false, fallthrough: true }));

app.use(claudeRouter);
app.use(contentRouter);

app.get('/', async (_req, res) => {
  const fp = join(projectRoot, 'public', 'index.html');
  res.sendFile(fp, err => {
    if (err) {
      console.error('[error] sendFile(/public/index.html)', err);
      res.status(500).json({ error: 'index.html not found', path: fp });
    }
  });
});

app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => {
  console.log(`[info] server up on ${PORT}`);
});

function graceful(signal){
  console.log(`[info] ${signal} received — closing http server…`);
  server.close((err) => {
    if (err) { console.error('[error] server.close', err); process.exit(1); }
    process.exit(0);
  });
  setTimeout(() => { console.warn('[warn] forced exit after 10s'); process.exit(0); }, 10_000).unref();
}
['SIGTERM','SIGINT'].forEach(s => process.on(s, () => graceful(s)));
