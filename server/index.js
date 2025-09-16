// server/index.js — ESM, Node >= 18
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import routers (all must export `router`)
import { router as research }  from './routes/research-agent.js';
import { router as newsLive }  from './routes/news-live.js';
import { router as visual }    from './routes/visual-lab.js';
import { router as compare }   from './routes/llm-compare.js';
import { router as modelsLive }from './routes/models-live.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Body parser
app.use(express.json({ limit: '10mb' }));

// Static assets (serve project root and /api JSONs)
app.use(express.static(path.join(__dirname, '..')));
app.use('/api', express.static(path.join(__dirname, '..', 'api')));

// Attach routes
app.use(research);
app.use(newsLive);
app.use(visual);
app.use(compare);
app.use(modelsLive);

// Health check
app.get('/healthz', (_,res)=>res.json({ok:true, ts: Date.now()}));

app.listen(PORT, ()=> console.log('server up on', PORT));
