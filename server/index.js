// server/index.js — hardened CORS + graceful SIGTERM
import express from 'express';
import { router as research } from './routes/research-agent.js';
import { router as visual } from './routes/visual-lab.js';
import { router as compare } from './routes/llm-compare.js';
import { router as modelsLive } from './routes/models-live.js';
import cors from 'cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
config();

const app = express();
app.use(express.json({ limit: '12mb' }));
app.use(research);
app.use(visual);
app.use(compare);
app.use(modelsLive);
app.use(newsLive);
app.use('/api', express.static('api'));

// Parse ALLOWED_ORIGINS robustly: split on comma/semicolon + trim
function parseAllowed(originsStr){
  return (originsStr||'')
   .split(/[;,]/)
   .map(s=>s.trim().replace(/;+$/,''))
   .filter(Boolean);
}
const allowed = parseAllowed(process.env.ALLOWED_ORIGINS);
console.log('Allowed origins:', allowed);

app.use(cors({
  origin: (origin, cb)=>{
    if(!origin) return cb(null, true); // allow curl / health etc.
    if(allowed.length===0 || allowed.includes(origin)) return cb(null,true);
    return cb(new Error('Not allowed by CORS: '+origin), false);
  }
}));

// Health
app.get('/healthz', (req,res)=> res.send('ok'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function openaiChat(messages, stream=false){
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = { model: OPENAI_MODEL, messages, stream };
  const r = await fetch(url, {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${OPENAI_API_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  if(!stream){
    if(!r.ok){ throw new Error(await r.text()); }
    return await r.json();
  }
  if(!r.ok){ throw new Error(await r.text()); }
  return r;
}

// JSON chat (supports image as data URL)
app.post('/chat', async (req,res)=>{
  try{
    const { message, systemPrompt, model, image } = req.body||{};
    const msgs = [];
    if(systemPrompt) msgs.push({ role:'system', content: systemPrompt });
    if(image){
      msgs.push({ role:'user', content: [
        { type:'input_text', text: message||'Bitte analysiere das Bild im Kontext.' },
        { type:'input_image', image_url: image }
      ]});
    }else{
      msgs.push({ role:'user', content: message||'' });
    }
    const data = await openaiChat(msgs, false);
    const text = data?.choices?.[0]?.message?.content || '';
    res.json({ answer: text });
  }catch(e){
    res.status(500).json({ error: String(e) });
  }
});

// SSE (text only)
app.get('/chat-sse', async (req,res)=>{
  try{
    const message = req.query.message || '';
    const systemPrompt = req.query.systemPrompt || '';
    const messages = [];
    if(systemPrompt) messages.push({ role:'system', content: systemPrompt });
    messages.push({ role:'user', content: message });
    const r = await openaiChat(messages, true);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const decoder = new TextDecoder();
    for await (const chunk of r.body){
      const str = decoder.decode(chunk);
      const lines = str.split('\\n');
      for(const line of lines){
        if(!line.trim()) continue;
        res.write(`data: ${line}\\n\\n`);
      }
    }
    res.write('event: done\\n');
    res.write('data: [DONE]\\n\\n');
    res.end();
  }catch(e){
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\\n`);
    res.write(`data: ${String(e)}\\n\\n`);
    res.end();
  }
});

app.get('/', (req,res)=> res.send('ok'));

// Graceful shutdown
const server = app.listen(process.env.PORT || 8080, ()=> console.log('server up on', server.address().port));
process.on('SIGTERM', ()=>{ console.log('SIGTERM received — shutting down gracefully'); server.close(()=> process.exit(0)); });
process.on('SIGINT', ()=>{ console.log('SIGINT received — exiting'); server.close(()=> process.exit(0)); });
