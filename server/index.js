// server/index.js — SSE Keep-Alive + robust CORS + graceful shutdown
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
config();

const app = express();
app.use(express.json({limit:'12mb'}));

function parseAllowed(s){ return (s||'').split(/[;,]/).map(x=>x.trim().replace(/;+$/,'')).filter(Boolean); }
const allowed = parseAllowed(process.env.ALLOWED_ORIGINS);
app.use(cors({ origin:(o,cb)=>{ if(!o) return cb(null,true); if(allowed.length===0||allowed.includes(o)) return cb(null,true); return cb(new Error('CORS '+o), false);} }));

app.get('/healthz', (req,res)=> res.send('ok'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function openaiChat(messages, stream=false){
  const url='https://api.openai.com/v1/chat/completions';
  const body={ model:OPENAI_MODEL, messages, stream };
  const r= await fetch(url,{ method:'POST', headers:{'Authorization':`Bearer ${OPENAI_API_KEY}`,'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!stream){ if(!r.ok) throw new Error(await r.text()); return await r.json(); }
  if(!r.ok) throw new Error(await r.text()); return r;
}

app.post('/chat', async (req,res)=>{
  try{
    const { message, systemPrompt, image } = req.body||{};
    const msgs=[]; if(systemPrompt) msgs.push({role:'system', content: systemPrompt});
    if(image){ msgs.push({ role:'user', content:[ {type:'input_text', text: message||''}, {type:'input_image', image_url: image} ] }); }
    else{ msgs.push({ role:'user', content: message||'' }); }
    const data = await openaiChat(msgs, false);
    res.json({ answer: data?.choices?.[0]?.message?.content || '' });
  }catch(e){ res.status(500).json({error:String(e)}); }
});

app.get('/chat-sse', async (req,res)=>{
  let keep=null;
  function sendKeep(){ try{ res.write(':ka\\n\\n'); }catch{} }
  try{
    const message = req.query.message || '';
    const systemPrompt = req.query.systemPrompt || '';
    const msgs=[]; if(systemPrompt) msgs.push({role:'system', content: systemPrompt}); msgs.push({role:'user', content: message});
    const r = await openaiChat(msgs, true);

    res.writeHead(200, {
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive',
      'Access-Control-Allow-Origin':'*'
    });
    keep = setInterval(sendKeep, 20000); // alle 20s Ping
    const decoder = new TextDecoder();
    for await (const chunk of r.body){
      const str = decoder.decode(chunk);
      str.split('\\n').forEach(line=>{ if(line.trim()) res.write(`data: ${line}\\n\\n`); });
    }
    res.write('event: done\\n'); res.write('data: [DONE]\\n\\n'); res.end();
  }catch(e){
    res.writeHead(500, {'Content-Type':'text/event-stream'}); res.write(`event: error\\n`); res.write(`data: ${String(e)}\\n\\n`); res.end();
  } finally { if(keep) clearInterval(keep); }
});

const server = app.listen(process.env.PORT || 8080, ()=> console.log('server up'));
process.on('SIGTERM', ()=>{ console.log('SIGTERM'); server.close(()=> process.exit(0)); });
process.on('SIGINT',  ()=>{ console.log('SIGINT');  server.close(()=> process.exit(0)); });