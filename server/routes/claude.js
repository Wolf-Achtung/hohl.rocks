import express from 'express';
export const router = express.Router();

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const MODEL   = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
const API_URL = 'https://api.anthropic.com/v1/messages';

// In-Memory Threads (Mini-Store, 4h TTL)
const SESS = new Map(); const TTL = 4*60*60*1000; const MAX = 500;
function thread(id){ if(!id) return []; const now=Date.now();
  let t=SESS.get(id); if(!t){ t={t:now,m:[]}; SESS.set(id,t); }
  t.t=now; // prune
  const tooOld = now-TTL;
  if(SESS.size>MAX){ const L=[...SESS.entries()].sort((a,b)=>a[1].t-b[1].t); for(let i=0;i<L.length-MAX;i++) SESS.delete(L[i][0]); }
  for(const [k,v] of SESS){ if(v.t<tooOld) SESS.delete(k); }
  return t.m;
}
function push(id, role, content){ if(!id) return; thread(id).push({role,content}); }

function headers(){
  if(!API_KEY) throw new Error('Missing ANTHROPIC_API_KEY / CLAUDE_API_KEY');
  return { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type':'application/json' };
}
function toMsgs(hist, user, system){
  const msgs=[]; if(system) msgs.push({role:'system', content:String(system)});
  msgs.push(...hist.slice(-40)); msgs.push({role:'user', content:String(user)});
  return msgs;
}

// JSON (non-stream)
router.post('/claude', express.json(), async (req,res)=>{
  try{
    const { prompt='', system='', model=MODEL, thread:id='', image } = req.body||{};
    const hist = thread(id);
    const messages = image
      ? [{role:'system', content:system||undefined}, ...hist,
         {role:'user', content:[
           { type:'input_text',  text: String(prompt||'Bitte analysiere das Bild.')},
           { type:'input_image', image_url: image }]}]
      : toMsgs(hist, prompt, system);

    const r = await fetch(API_URL, { method:'POST', headers: headers(),
      body: JSON.stringify({ model, max_tokens: 1200, temperature: 0.7, stream:false, messages }) });

    if(!r.ok){ const txt = await r.text(); console.error('Claude JSON', r.status, txt);
      return res.status(502).json({ error:'Claude upstream', status:r.status, body:txt }); }

    const j = await r.json(); const text=(j?.content||[]).map(c=>c?.text||'').join('');
    push(id,'user',prompt); push(id,'assistant',text);
    res.json({ text, model: j?.model||model });
  }catch(e){ res.status(500).json({ error: String(e) }); }
});

// Streaming-API: GET und POST
//
// Der GET-Endpunkt akzeptiert die Parameter über die Query-String, wie
// ?prompt=...&system=...&model=...&thread=....
// Der POST-Endpunkt nimmt dieselben Felder aus dem JSON-Body entgegen. Beide
// implementieren identische Logik: Sie rufen das Anthropic-API mit
// stream=true auf und forwarden die Events (delta/done/error) im SSE-Format.

router.get('/claude-sse', async (req,res)=>{
  try{
    const prompt = String(req.query.prompt||req.query.message||'');
    const system = String(req.query.system||req.query.systemPrompt||'');
    const model  = String(req.query.model||MODEL);
    const id     = String(req.query.thread||'');
    const messages = toMsgs(thread(id), prompt, system);

    const upstream = await fetch(API_URL, { method:'POST', headers: headers(),
      body: JSON.stringify({ model, max_tokens: 1200, temperature: 0.7, stream:true, messages }) });

    if(!upstream.ok){ const txt = await upstream.text(); console.error('Claude SSE', upstream.status, txt);
      res.writeHead(502, {'Content-Type':'text/event-stream'}); res.write(`event: error\ndata: ${JSON.stringify({status:upstream.status,body:txt})}\n\n`); return res.end(); }

    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});
    const reader = upstream.body.getReader(); const dec = new TextDecoder();
    let buf = '', acc=''; let closed=false;

    req.on('close', ()=>{ try{ reader.cancel(); }catch(_){} closed=true; });

    // Heartbeat alle 15s
    const hb = setInterval(()=>{ if(!closed) res.write(':hb\n\n'); }, 15000);

    while(true){
      const {value, done} = await reader.read(); if(done) break;
      buf += dec.decode(value,{stream:true});
      let ix; while((ix = buf.indexOf('\n\n'))>=0){
        const block = buf.slice(0,ix); buf = buf.slice(ix+2);
        let ev='message', data='';
        for(const line of block.split('\n')){
          if(line.startsWith('event:')) ev = line.slice(6).trim();
          else if(line.startsWith('data:')) data += line.slice(5).trim();
        }
        if(ev==='content_block_delta'){
          try{ const j = JSON.parse(data); const t=j?.delta?.text||''; if(t){ acc+=t; res.write(`data: ${JSON.stringify({delta:t})}\n\n`);} }catch{}
        }
        if(ev==='message_stop'){ res.write('event: done\n'); res.write('data: [DONE]\n\n'); clearInterval(hb); res.end();
          push(id,'user',prompt); push(id,'assistant',acc); return; }
      }
    }
    clearInterval(hb); if(!closed){ res.write('event: done\n'); res.write('data: [DONE]\n\n'); res.end(); }
  }catch(e){
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\ndata: ${JSON.stringify({error:String(e)})}\n\n`); res.end();
  }
});

// POST-Variante für Streaming: liest prompt/system/model/thread aus dem JSON-Body.
router.post('/claude-sse', express.json(), async (req,res)=>{
  try{
    const { prompt = '', system = '', model = MODEL, thread: id = '' } = req.body || {};
    const messages = toMsgs(thread(id), String(prompt), String(system));
    const upstream = await fetch(API_URL, { method:'POST', headers: headers(),
      body: JSON.stringify({ model: String(model||MODEL), max_tokens: 1200, temperature: 0.7, stream:true, messages }) });
    if(!upstream.ok){ const txt = await upstream.text(); console.error('Claude SSE', upstream.status, txt);
      res.writeHead(502, {'Content-Type':'text/event-stream'});
      res.write(`event: error\ndata: ${JSON.stringify({status:upstream.status,body:txt})}\n\n`);
      return res.end(); }
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});
    const reader = upstream.body.getReader(); const dec = new TextDecoder();
    let buf = '', acc=''; let closed=false;
    req.on('close', ()=>{ try{ reader.cancel(); }catch(_e){} closed=true; });
    const hb = setInterval(()=>{ if(!closed) res.write(':hb\n\n'); }, 15000);
    while(true){
      const { value, done } = await reader.read(); if(done) break;
      buf += dec.decode(value,{stream:true});
      let ix; while((ix = buf.indexOf('\n\n'))>=0){
        const block = buf.slice(0,ix); buf = buf.slice(ix+2);
        let ev='message', data='';
        for(const line of block.split('\n')){
          if(line.startsWith('event:')) ev = line.slice(6).trim();
          else if(line.startsWith('data:')) data += line.slice(5).trim();
        }
        if(ev==='content_block_delta'){
          try{ const j = JSON.parse(data); const t=j?.delta?.text||''; if(t){ acc+=t; res.write(`data: ${JSON.stringify({delta:t})}\n\n`);} }catch{}
        }
        if(ev==='message_stop'){
          res.write('event: done\n'); res.write('data: [DONE]\n\n'); clearInterval(hb); res.end();
          push(id,'user', String(prompt)); push(id,'assistant', acc);
          return;
        }
      }
    }
    clearInterval(hb);
    if(!closed){ res.write('event: done\n'); res.write('data: [DONE]\n\n'); res.end(); }
  }catch(e){
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\ndata: ${JSON.stringify({error:String(e)})}\n\n`);
    res.end();
  }
});

// Strukturierte JSON-Antwort (für „Generate & Show“)
router.post('/claude-json', express.json(), async (req,res)=>{
  try{
    const { prompt='', model=MODEL } = req.body||{};
    const r = await fetch(API_URL, { method:'POST', headers: headers(),
      body: JSON.stringify({ model, max_tokens:900, temperature:0.4, stream:false,
        system:'Antworte NUR mit gültigem JSON ohne erklärenden Text.',
        messages:[{role:'user', content:String(prompt)}] }) });
    if(!r.ok){ const txt = await r.text(); console.error('Claude JSON-struct', r.status, txt);
      return res.status(502).json({ error:'Claude upstream', status:r.status, body:txt }); }

    const j = await r.json(); const raw=(j?.content||[]).map(c=>c?.text||'').join('');
    let obj=null; try{ obj=JSON.parse(raw); }catch(_){}
    res.json({ ok: !!obj, json: obj, rawText: raw });
  }catch(e){ res.status(500).json({ error: String(e) }); }
});
