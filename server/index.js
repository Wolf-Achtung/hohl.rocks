// server/index.js — Node 18+, ESM
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Neue/aktualisierte Router (Claude, News, Daily-Idea)
import { router as claude }     from './routes/claude.js';
import { router as newsLive }   from './routes/news-live.js';
import { router as dailyIdea }  from './routes/daily-idea.js';

// Deine bestehenden Router (falls im Projekt vorhanden)
import { router as research }   from './routes/research-agent.js';
import { router as visual }     from './routes/visual-lab.js';
import { router as compare }    from './routes/llm-compare.js';
import { router as modelsLive } from './routes/models-live.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

// Static: Projekt-Root & /api
app.use(express.static(path.join(__dirname, '..')));
app.use('/api', express.static(path.join(__dirname, '..', 'api')));

// === Routen registrieren (APIs vor Fallback) ===
app.use(claude);       // /claude-sse, /claude, /claude-json  (Stateful Sessions je Bubble)
app.use(newsLive);     // /news/today  (12h Cache, cachedAt für "Stand: HH:MM")
app.use(dailyIdea);    // /daily/idea  (Auto-Rotation "Heute neu", 12h Cache)

// Bestehende Module
app.use(research);
app.use(visual);
app.use(compare);
app.use(modelsLive);

// Healthcheck
app.get('/healthz', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// === SPA-Fallback: unbekannte GETs -> index.html ===
app.use((req, res, next) => {
  const p = req.path || '';
  if (
    req.method === 'GET' &&
    !p.startsWith('/api') &&
    !p.startsWith('/claude') &&
    !p.startsWith('/news') &&
    !p.startsWith('/daily') &&
    !p.startsWith('/videos') &&
    !p.match(/\.(?:js|css|svg|png|jpg|jpeg|gif|ico|webm|mp4|map)$/i)
  ) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Fehlerfänger
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', detail: String(err) });
});

app.listen(PORT, () => console.log('server up on', PORT));
