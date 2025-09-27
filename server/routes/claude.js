// server/routes/claude.js — Anthropic Claude proxy (SSE + JSON)
import express from 'express';

export const router = express.Router();

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const MODEL  = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';
const API_URL = 'https://api.anthropic.com/v1/messages';

function bad(res, msg){ res.status(500).json({ error: msg }); }

router.get('/claude-sse', async (req,res)=>{
  try{
    if(!API_KEY) return bad(res, 'Missing ANTHROPIC_API_KEY');
    const { prompt='', system='', model=MODEL, temperature='0.7', max_tokens='800' } = req.query;
    res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.flushHeaders?.();

    const body = {
      model,
      max_tokens: Number(max_tokens)||800,
      temperature: Number(temperature)||0.7,
      stream: true,
      messages: [{ role:'user', content: String(prompt) }],
      ...(system ? { system: String(system) } : {})
    };

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
            if(delta) res.write(`data: ${JSON.stringify({delta})}\\n\\n`);
          }catch{}
        } else if(event==='message_stop'){
          res.write(`event: done\\ndata: {}\\n\\n`);
        }
      }
    }
    res.end();
  }catch(e){
    try{ res.write(`event: error\\ndata: ${JSON.stringify({error:String(e)})}\\n\\n`); }catch{}
    res.end();
  }
});

router.post('/claude', express.json(), async (req,res)=>{
  try{
    if(!API_KEY) return bad(res, 'Missing ANTHROPIC_API_KEY');
    const { prompt='', system='', model=MODEL, temperature=0.7, max_tokens=800 } = req.body||{};
    const r = await fetch(API_URL, {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${API_KEY}`,
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify({
        model, max_tokens, temperature, stream:false,
        messages:[{ role:'user', content:String(prompt) }],
        ...(system ? { system:String(system) } : {})
      })
    });
    const json = await r.json();
    const text = Array.isArray(json?.content) ? json.content.map(c=>c?.text||'').join('') : '';
    res.json({ text, raw: json });
  }catch(e){ bad(res, String(e)); }
});