// server/index.js — Node 18+, ESM ok
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Routers (must export `router`)
import { router as research }  from './routes/research-agent.js';
import { router as newsLive }  from './routes/news-live.js';
import { router as visual }    from './routes/visual-lab.js';
import { router as compare }   from './routes/llm-compare.js';
import { router as modelsLive }from './routes/models-live.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));

// Static: serve project root and /api jsons
app.use(express.static(path.join(__dirname, '..')));
app.use('/api', express.static(path.join(__dirname, '..', 'api')));

// Routes
app.use(research);
app.use(newsLive);
app.use(visual);
app.use(compare);
app.use(modelsLive);

app.get('/healthz', (_,res)=>res.json({ok:true, ts: Date.now()}));

app.listen(PORT, ()=> console.log('server up on', PORT));
