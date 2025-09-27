// server/routes/claude.js — Anthropic Claude proxy with thread sessions, SSE + JSON
import express from 'express';

export const router = express.Router();

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const MODEL  = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';
const API_URL = 'https://api.anthropic.com/v1/messages';

// In‑memory session store (thread → {messages:[], updatedAt:Number}).
// LRU cleanup on each write; TTL 4h; max 500 threads.
const SESS = new Map();
const TTL_MS = 4 * 60 * 60 * 1000;
const MAX_THREADS = 500;

function getThread(thread){
  const now = Date.now();
  let e = SESS.get(thread);
  if(!e){ e = { messages: [], updatedAt: now }; SESS.set(thread, e); }
  e.updatedAt = now;
  // prune
  const tooOld = now - TTL_MS;
  if(SESS.size > MAX_THREADS){
    // drop oldest by updatedAt
    const arr = [...SESS.entries()].sort((a,b)=>a[1].updatedAt - b[1].updatedAt);
    for(let i=0;i<arr.length - MAX_THREADS;i++) SESS.delete(arr[i][0]);
  }
  for(const [k,v] of SESS){
    if(v.updatedAt < tooOld) SESS.delete(k);
  }
  return e;
}

function bad(res, msg){ res.status(500).json({ error: msg }); }

router.get('/claude-sse', async (req,res)=>{
  try{
    if(!API_KEY) return bad(res, 'Missing ANTHROPIC_API_KEY/CLAUDE_API_KEY');
    const { prompt='', system='', model=MODEL, temperature='0.7', max_tokens='800', thread='' } = req.query;

    const hist = thread ? getThread(String(thread)).messages : [];
    const body = {
      model,
      max_tokens: Number(max_tokens)||800,
      temperature: Number(temperature)||0.7,
      stream: true,
      messages: [...hist, { role:'user', content: String(prompt) }],
      ...(system ? { system: String(system) } : {})
    };

    res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.flushHeaders?.();

    const r = await fetch(API_URL, {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${API_KEY}`,
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if(!r.ok){
      const txt = await r.text();
      res.write(`event: error\ndata: ${JSON.stringify({status:r.status, body:txt})}\n\n`);
      return res.end();
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let acc = '';
    while(true){
      const { value, done } = await reader.read();
      if(done) break;
      buffer += decoder.decode(value,{stream:true});
      const parts = buffer.split('\\n\\n');
      buffer = parts.pop() || '';
      for(const chunk of parts){
        const lines = chunk.split('\\n');
        let event, data;
        for(const ln of lines){
          const idx = ln.indexOf(':');
          if(idx<0) continue;
          const k = ln.slice(0,idx).trim();
          const v = ln.slice(idx+1).trim();
          if(k==='event') event = v;
          else if(k==='data') data = v;
        }
        if(event==='content_block_delta'){
          try{
            const obj = JSON.parse(data);
            const delta = obj?.delta?.text || '';
            if(delta){ acc += delta; res.write(`data: ${JSON.stringify({delta})}\\n\\n`); }
          }catch{}
        } else if(event==='message_stop'){
          res.write(`event: done\\ndata: {}\\n\\n`);
        }
      }
    }
    res.end();

    // Persist the exchange if thread enabled
    if(thread){
      const t = getThread(String(thread));
      t.messages.push({ role:'user', content: String(prompt) });
      t.messages.push({ role:'assistant', content: acc });
    }
  }catch(e){
    try{ res.write(`event: error\\ndata: ${JSON.stringify({error:String(e)})}\\n\\n`); }catch{}
    res.end();
  }
});

router.post('/claude', express.json(), async (req,res)=>{
  try{
    if(!API_KEY) return bad(res, 'Missing ANTHROPIC_API_KEY/CLAUDE_API_KEY');
    const { prompt='', system='', model=MODEL, temperature=0.7, max_tokens=800, thread='' } = req.body||{};
    const hist = thread ? getThread(String(thread)).messages : [];
    const r = await fetch(API_URL, {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${API_KEY}`,
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify({
        model, max_tokens, temperature, stream:false,
        messages:[...hist, { role:'user', content:String(prompt) }],
        ...(system ? { system:String(system) } : {})
      })
    });
    const json = await r.json();
    const text = Array.isArray(json?.content) ? json.content.map(c=>c?.text||'').join('') : '';
    if(thread){
      const t = getThread(String(thread));
      t.messages.push({ role:'user', content:String(prompt) });
      t.messages.push({ role:'assistant', content:text });
    }
    res.json({ text, raw: json });
  }catch(e){ bad(res, String(e)); }
});

// For "Generate & Show" bubbles: request structured JSON (no streaming)
router.post('/claude-json', express.json(), async (req,res)=>{
  try{
    if(!API_KEY) return bad(res, 'Missing ANTHROPIC_API_KEY/CLAUDE_API_KEY');
    const { prompt='', schemaHint='', model=MODEL, temperature=0.4, max_tokens=900 } = req.body||{};
    const sys = `Du antwortest ausschließlich mit gültigem JSON nach folgender Beschreibung. ${schemaHint || ''}
Kein erklärender Text, keine Markdown-Umrandung — nur gültiges JSON.`;
    const r = await fetch(API_URL, {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${API_KEY}`,
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify({
        model, max_tokens, temperature, stream:false,
        system: sys,
        messages:[{ role:'user', content:String(prompt) }]
      })
    });
    const j = await r.json();
    const text = Array.isArray(j?.content) ? j.content.map(c=>c?.text||'').join('') : '';
    let obj=null; try{ obj = JSON.parse(text); }catch{}
    res.json({ ok: !!obj, json: obj, rawText: text });
  }catch(e){ bad(res, String(e)); }
});
