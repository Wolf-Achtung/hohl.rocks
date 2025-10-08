// server/index.js (ESM)
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({contentSecurityPolicy:false}));
app.use(compression());
app.use(cors({origin: true, credentials:false}));
app.use(express.json({limit:'1mb'}));

// Static
app.use(express.static(join(__dirname, '..')));

// Simple in-memory cache with TTL
const cache = new Map();
function setCache(key, data, ttlMs){ cache.set(key, {data, exp: Date.now()+ttlMs}); }
function getCache(key){
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) { cache.delete(key); return null; }
  return hit.data;
}

// Health
app.get('/healthz', (_,res)=> res.json({ok:true}));

// ---------- Anthropic (Claude) ----------
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || ''; // optional override

const MODEL_CHAIN = [
  CLAUDE_MODEL,
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
  'claude-3-5-haiku-20241022'
].filter(Boolean);

function pickModel(){ return MODEL_CHAIN[0]; }

// SSE forwarder
app.post('/api/claude-sse', async (req,res)=>{
  if (!ANTHROPIC_API_KEY) return res.status(500).end('Anthropic key missing');

  const {prompt='', system='hohl.rocks', threadId=''} = req.body || {};
  const model = pickModel();

  res.writeHead(200, {
    'Content-Type':'text/event-stream',
    'Cache-Control':'no-cache, no-transform',
    'Connection':'keep-alive',
    'X-Accel-Buffering':'no'
  });

  try{
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'content-type':'application/json',
        'anthropic-version':'2023-06-01',
        'x-api-key': ANTHROPIC_API_KEY,
        'accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        stream: true,
        system,
        messages: [{role:'user', content: prompt}],
        metadata: threadId ? {thread_id: threadId} : undefined
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(()=> '');
      res.write(`data: ${JSON.stringify({delta:`[Fehler Claude] HTTP ${r.status} ${text}`})}\n\n`);
      return res.end('data: [DONE]\n\n');
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      buf += decoder.decode(value, {stream:true});
      // forward raw server-sent chunks from Anthropic
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const part of parts) {
        // Extract deltas
        const line = part.split('\n').find(l=> l.startsWith('data: '));
        if (!line) continue;
        const data = line.slice(6);
        try{
          const j = JSON.parse(data);
          // Combine known event types
          if (j.type === 'content_block_delta' && j.delta?.text) {
            res.write(`data: ${JSON.stringify({delta:j.delta.text})}\n\n`);
          } else if (j.type === 'message_delta' && j.delta?.stop_reason) {
            // ignore
          }
        }catch{/* ignore */}
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }catch(err){
    res.write(`data: ${JSON.stringify({delta:`[Fehler] ${err?.message||err}`})}\n\n`);
    res.write('data: [DONE]\n\n'); res.end();
  }
});

app.post('/api/claude-json', async (req,res)=>{
  if (!ANTHROPIC_API_KEY) return res.status(500).json({error:'Anthropic key missing'});
  const {prompt='', system='hohl.rocks', threadId=''} = req.body || {};
  const model = pickModel();
  try{
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'content-type':'application/json',
        'anthropic-version':'2023-06-01',
        'x-api-key': ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model, max_tokens: 1024, system,
        messages: [{role:'user', content: prompt}],
        metadata: threadId ? {thread_id: threadId} : undefined
      })
    });
    if (!r.ok) {
      const t = await r.text().catch(()=> '');
      return res.status(r.status).json({error:t || `HTTP ${r.status}`});
    }
    const j = await r.json();
    const text = j?.content?.map(c=> c.text || '').join('') || '';
    res.json({text});
  }catch(err){
    res.status(500).json({error:String(err)});
  }
});

// ---------- Tavily News / Top Prompts / Daily ----------
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

async function tavilySearch(q){
  const r = await fetch('https://api.tavily.com/search', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({api_key: TAVILY_API_KEY, query:q, search_depth:'advanced', max_results:6})
  });
  if (!r.ok) throw new Error(`Tavily HTTP ${r.status}`);
  return r.json();
}

function hhmm(d=new Date()){
  return d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
}

app.get('/api/news', async (_req,res)=>{
  const key = 'news';
  const hit = getCache(key);
  if (hit) return res.json(hit);
  if (!TAVILY_API_KEY) return res.status(500).json({error:'Tavily key missing'});

  try{
    const topic = 'KI Recht Tools Trends EU AI Act DSGVO';
    const j = await tavilySearch(`Aktuelle Nachrichten ${topic} deutsch seriöse Quellen`);
    const items = (j?.results||[]).map(r=> ({
      title: r.title, url: r.url, source: (r?.metadata?.source || r.url || '').replace(/^https?:\/\/(www\.)?/,'').split('/')[0]
    })).slice(0,6);
    const payload = {items, cachedAt: hhmm()};
    setCache(key, payload, 12*60*60*1000);
    res.json(payload);
  }catch(err){
    res.status(500).json({error:String(err)});
  }
});

// Dummy „Top Prompts der Woche“ – hier exemplarisch (du kannst eine echte Aggregation anbinden)
app.get('/api/top-prompts', async (_req,res)=>{
  const key='top-prompts';
  const hit = getCache(key); if (hit) return res.json(hit);
  const items = [
    {title:'Kontrast-Paar', body:'Zeige 2 Wege zum Ziel (Lean vs. Deluxe) als Tabelle …'},
    {title:'GIST → FACT → CITE', body:'1 Satz Essenz → 3–5 Fakten → 2–3 Quellen …'},
    {title:'Prompt-Linter', body:'Diagnose von Ziel/Format/Constraints/Negativliste …'},
    {title:'One‑Minute‑Plan', body:'5 konkrete nächste Schritte …'},
    {title:'Research-Agent', body:'Kurze Web-Recherche mit Quellen …'}
  ];
  const payload={items, cachedAt: hhmm()};
  setCache(key, payload, 7*24*60*60*1000);
  res.json(payload);
});

app.get('/api/daily', async (_req,res)=>{
  const key='daily';
  const hit = getCache(key); if (hit) return res.json(hit);
  if (!TAVILY_API_KEY) return res.json({title:'KI‑Notiz', body:'(Tavily API nicht konfiguriert)'});

  try{
    const j = await tavilySearch('neue kurze KI Meldung deutsch komprimiert');
    const best = (j?.results||[])[0];
    const title = best?.title?.slice(0,80) || 'KI‑Notiz';
    const body  = `${best?.title || 'Heute neu'}\n${best?.url || ''}`;
    const payload = {title, body};
    setCache(key, payload, 24*60*60*1000);
    res.json(payload);
  }catch(err){
    res.json({title:'KI‑Notiz', body:'(Fehler bei Tavily)'}); // weich
  }
});

// Fallback SPA
app.get('*', (req,res)=>{
  res.sendFile(join(__dirname,'..','index.html'));
});

app.listen(PORT, ()=> console.log('server up on', PORT));
