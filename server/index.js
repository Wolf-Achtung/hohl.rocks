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
app.use(compression());
app.use(express.json({ limit:'12mb' }));

// CORS
const allowed = (process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin:(origin,cb)=>{ if(!origin) return cb(null,true); if(!allowed.length||allowed.includes(origin)) return cb(null,true); cb(new Error('CORS'),false);} }));

// Static (vor SPA-Fallback, aber nach API-Mounts ist auch ok)
app.use(express.static(path.join(__dirname,'..')));

// APIs mounten (vor Fallback!)
import { router as claude } from './routes/claude.js';
import { router as news }   from './routes/news.js';
app.use(claude);
app.use('/api', claude);
app.use('/news', news);
app.use('/api/news', news);

// Aliasse für alte Clients
app.post('/chat', (req,res,next)=> (req.url='/claude', next()));
app.get('/chat-sse', (req,res,next)=> (req.url='/claude-sse', next()));

// Health & Root
app.get('/healthz', (_req,res)=> res.json({ok:true, ts:Date.now()}));
app.get('/', (_req,res)=> res.send('ok'));

// SPA-Fallback
app.use((req,res,next)=>{
  const p=req.path||'';
  if(req.method==='GET' && !p.startsWith('/api') && !p.startsWith('/claude') && !p.startsWith('/chat') && !p.startsWith('/news') &&
     !/\.(?:js|css|svg|png|jpg|jpeg|gif|ico|webm|mp4|map)$/i.test(p)){
    return res.sendFile(path.join(__dirname,'..','index.html'));
  }
  next();
});

// Fehler
app.use((err,_req,res,_next)=>{ console.error('Unhandled:',err); res.status(500).json({error:'Internal Error', detail:String(err)}); });

const server = app.listen(PORT,'0.0.0.0', ()=> console.log('server up on', PORT));
process.on('SIGTERM',()=> server.close(()=>process.exit(0)));
process.on('SIGINT', ()=> server.close(()=>process.exit(0)));
