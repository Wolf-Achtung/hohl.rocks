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

import claudeRouter from './routes/claude.js';
import contentRouter from './routes/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// WICHTIG: /app (nicht "/")
const projectRoot = join(__dirname, '..'); // /app

const app = express();

// Proxy-Setup (Railway)
if ((process.env.TRUST_PROXY || '').toLowerCase() === 'true') {
  app.set('trust proxy', true);
}

// Security: Helmet + optionale CSP (für hohl.rocks/Railway/Anthropic/Tavily/Umami)
const CSP_ENABLE = (process.env.CSP_ENABLE || 'true').toLowerCase() === 'true';
app.use(helmet({
  contentSecurityPolicy: CSP_ENABLE ? {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://us.umami.is"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": [
        "'self'",
        "https://api.anthropic.com",
        "https://api.tavily.com",
        "https://hohlrocks-production.up.railway.app",
        "https://hohl.rocks"
      ],
      "media-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false
}));

// CORS: hohl.rocks + Railway (erweiterbar via ENV)
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

// Request-ID + Access Log
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', id);
  // @ts-ignore
  req.id = id;
  next();
});
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms rid=:req[id]'));

// Basic Rate-Limit
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

// Health
app.get('/healthz', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Static
app.use(express.static(join(projectRoot, 'public'), { index: false, fallthrough: true }));
app.use(express.static(projectRoot, { index: false, fallthrough: true }));

// API
app.use(claudeRouter);
app.use(contentRouter);

// Root -> index.html (robust per sendFile)
app.get('/', (req, res) => {
  const fp = join(projectRoot, 'public', 'index.html');
  res.sendFile(fp, err => {
    if (err) {
      console.error('[error] sendFile(/public/index.html)', err);
      res.status(500).json({ error: 'index.html not found', path: fp });
    }
  });
});

// 404 + Error
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Server error' });
});

// Start + graceful shutdown
const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => {
  console.log(`[info] server up on ${PORT} (env=${process.env.NODE_ENV || 'development'})`);
});
function graceful(signal){
  console.log(`[info] ${signal} received — closing http server…`);
  server.close((e) => {
    if (e) { console.error('[error] server.close', e); process.exit(1); }
    process.exit(0);
  });
  setTimeout(() => { console.warn('[warn] forced exit after 10s'); process.exit(0); }, 10_000).unref();
}
['SIGTERM','SIGINT'].forEach(s => process.on(s, () => graceful(s)));
process.on('unhandledRejection', (r) => console.error('[error] unhandledRejection', r));
process.on('uncaughtException', (e) => console.error('[error] uncaughtException', e));
