// server/index.js – Express + Claude (Anthropic) – Dual-Routen & SSE-Normalisierung
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);
app.use(express.json({ limit: '12mb' }));

// ----- CORS -----
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'), false);
  }
}));

// ----- Static -----
app.use(express.static(path.join(__dirname, '..')));
app.use('/api', express.static(path.join(__dirname, '..', 'api')));

// ----- Claude Basics -----
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL      = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

// Mini Thread-Store
const threads = new Map(); const MAX_THREADS = 500;
function addToThread(id, role, content){ if(!id) return;
  if(!threads.has(id)){ if(threads.size>=MAX_THREADS){ const k=threads.keys().next().value; threads.delete(k);} threads.set(id,[]); }
  threads.get(id).push({ role, content });
}
function getThread(id){ if(!id) return []; const m=threads.get(id); if(!m) return []; threads.delete(id); threads.set(id,m); return m.slice(-40); }

function toClaudeMessages(msgs){
  return (msgs||[]).map(m=>{
    if(Array.isArray(m.content)){
      const parts = m.content.map(p=>{
        if(p.type==='input_text'||p.type==='text'){ return {type:'text', text:p.text||p.content||''}; }
        if(p.type==='input_image'&&p.image_url){
          const m = p.image_url.match(/^data:image\/(.*?);base64,(.*)$/);
          if(m){ return { type:'image', source:{ type:'base64', media_type:`image/${m[1]}`, data:m[2] } }; }
        }
        return null;
      }).filter(Boolean);
      return { role: m.role==='user'?'user':'assistant', content: parts };
    }
    return { role: m.role==='user'?'user':'assistant', content: m.content||'' };
  });
}

async function claudeCall({ system, messages, stream=false }){
  if(!ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
  const body = { model: CLAUDE_MODEL, max_tokens: 4096, stream, messages: toClaudeMessages(messages||[]) };
  if(system) body.system = system;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{ 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version':'2023-06-01', 'content-type':'application/json' },
    body: JSON.stringify(body)
  });
  if(!r.ok){ throw new Error(`Claude HTTP ${r.status}: ${await r.text()}`); }
  return r;
}

function mount(prefix=''){
  const router = express.Router();

  // JSON (non-stream)
  router.post(`${prefix}/claude`, async (req,res)=>{
    try{
      const { prompt='', system, model, thread, image } = req.body||{};
      const hist = getThread(thread);
      const msgs = []; if(system) msgs.push({role:'system', content:system}); msgs.push(...hist);
      if(image){
        msgs.push({role:'user', content:[{type:'input_text', text:prompt||'Bitte analysiere das Bild.'},{type:'input_image', image_url:image}]});
      } else {
        msgs.push({role:'user', content:prompt});
      }
      const r = await claudeCall({ system, messages: msgs, stream:false });
      const j = await r.json();
      const t = (j?.content||[]).map(c=>c?.text||'').join('');
      addToThread(thread,'user',prompt); addToThread(thread,'assistant',t);
      res.json({ text:t, model:j?.model||CLAUDE_MODEL });
    } catch(e){ res.status(500).json({error:String(e) }); }
  });

  // SSE (text) → normalisiert {delta}
  router.get(`${prefix}/claude-sse`, async (req,res)=>{
    const prompt = String(req.query.prompt || req.query.message || '');
    const system = String(req.query.system || req.query.systemPrompt || '');
    const thread = String(req.query.thread || '');
    try{
      const hist = getThread(thread);
      const msgs = []; if(system) msgs.push({role:'system', content:system}); msgs.push(...hist); msgs.push({role:'user', content:prompt});
      const r = await claudeCall({ system, messages: msgs, stream:true });

      res.writeHead(200,{ 'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*' });

      const decoder = new TextDecoder(); let buf='';
      for await (const chunk of r.body){
        buf += decoder.decode(chunk,{stream:true});
        let idx; while((idx = buf.indexOf('\n\n'))>=0){
          const block = buf.slice(0,idx); buf = buf.slice(idx+2);
          let ev='message', data='';
          for(const line of block.split('\n')){
            if(line.startsWith('event:')) ev = line.slice(6).trim();
            else if(line.startsWith('data:')) data += line.slice(5).trim();
          }
          if(!data) continue;
          if(ev==='content_block_delta'){
            try{ const j = JSON.parse(data); const t = j?.delta?.text||''; if(t) res.write(`data: ${JSON.stringify({delta:t})}\n\n`); }catch{}
          } else if(ev==='message_stop'){
            res.write('event: done\n'); res.write('data: [DONE]\n\n'); res.end();
            addToThread(thread,'user',prompt);
          }
        }
      }
    } catch(e){
      res.writeHead(500,{'Content-Type':'text/event-stream'});
      res.write(`event: error\n`); res.write(`data: ${JSON.stringify({error:String(e)})}\n\n`); res.end();
    }
  });

  // Strukturierte JSON-Antworten (Artefakt/Canvas)
  router.post(`${prefix}/claude-json`, async (req,res)=>{
    try{
      const { prompt='', system, thread } = req.body||{};
      const hist = getThread(thread);
      const msgs = []; if(system) msgs.push({role:'system', content:system}); msgs.push(...hist); msgs.push({role:'user', content:prompt+'\n\nAntworte NUR als gültiges JSON.'});
      const r = await claudeCall({ system, messages: msgs, stream:false });
      const j = await r.json(); const raw = (j?.content||[]).map(c=>c?.text||'').join('');
      res.json({ ok:true, json: JSON.parse(raw) });
    }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
  });

  return router;
}

// Mount unter '' und '/api'; Aliasse für alte /chat*-Clients
app.use(mount(''));
app.use(mount('/api'));
app.post('/chat',     (req,res,next)=> (req.url='/claude',     next()));
app.get('/chat-sse',  (req,res,next)=> (req.url='/claude-sse', next()));

// Health + Root
app.get('/healthz', (_req,res)=> res.json({ok:true, ts:Date.now()}));
app.get('/',        (_req,res)=> res.send('ok'));

// SPA-Fallback
app.use((req,res,next)=>{
  const p = req.path || '';
  if (req.method==='GET' && !p.startsWith('/api') && !p.startsWith('/claude') && !p.startsWith('/chat') &&
      !p.startsWith('/videos') && !p.match(/\.(?:js|css|svg|png|jpg|jpeg|gif|ico|webm|mp4|map)$/i)) {
    return res.sendFile(path.join(__dirname,'..','index.html'));
  }
  next();
});

// Fehlerfänger
app.use((err,_req,res,_next)=>{ console.error('Unhandled error:',err); res.status(500).json({error:'Internal Server Error', detail:String(err)}); });

// Start
const server = app.listen(PORT, '0.0.0.0', ()=> console.log('server up on', PORT));
process.on('SIGTERM', ()=>{ server.close(()=>process.exit(0)); });
process.on('SIGINT',  ()=>{ server.close(()=>process.exit(0)); });
