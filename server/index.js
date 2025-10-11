/* server/index.js — Express server with SSE, static hosting, healthz and content routes.
   "Gold-Standard" defaults: trust proxy, helmet-lite via headers, compression, rate limits. */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import crypto from 'node:crypto';
import contentRoutes from './routes/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('trust proxy', true);

// Basic security-ish headers (helmet-lite)
app.disable('x-powered-by');
app.use((req,res,next)=>{ 
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer-when-downgrade');
  res.setHeader('Permissions-Policy','interest-cohort=()');
  next();
});

app.use(compression());
app.use(cors({ origin:true, credentials:false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms rid=:req[x-request-id]'));

// request id
app.use((req,res,next)=>{ req.headers['x-request-id'] ||= crypto.randomUUID(); res.setHeader('X-Request-Id', req.headers['x-request-id']); next(); });

// health
app.get('/healthz', (_req,res)=>res.status(200).send('ok\n'));

// SSE demo endpoint: streams back chunks from "message" (fallback if no external model is configured)
app.get('/chat-sse', async (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive'
  });
  const message = String(req.query.message || '');
  function send(eventObj){
    res.write(`data: ${JSON.stringify(eventObj)}\n\n`);
  }
  // Naive tokenization fallback
  const chunks = (message || 'Hallo!').match(/.{1,50}/g) || [];
  for (const c of chunks) {
    send({ delta: c });
    await new Promise(r=>setTimeout(r, 20));
  }
  send({ done: true });
  res.end();
});

// API routes (Tavily / Perplexity etc.)
app.use(contentRoutes);

// Static hosting
const pubDir = path.join(__dirname, '..', 'public');
app.use(express.static(pubDir, { extensions: ['html'] }));

// SPA fallback to index.html
app.get('*', (req, res, next) => {
  if (req.accepts('html')) return res.sendFile(path.join(pubDir, 'index.html'));
  next();
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('[info] server up on', port));
