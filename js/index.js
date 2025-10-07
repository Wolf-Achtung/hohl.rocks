// server/index.js – Railway mini-patch with SSE + Vision JSON (Claude API)
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
config();

const app = express();
app.use(express.json({limit:'12mb'}));

// CORS
const allowed = (process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb)=>{
    if(!origin) return cb(null, true);
    if(allowed.length===0 || allowed.includes(origin)) return cb(null,true);
    return cb(new Error('Not allowed by CORS'), false);
  }
}));

// Health
app.get('/healthz', (req,res)=> res.send('ok'));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

async function claudeChat(messages, stream=false){
  const url = 'https://api.anthropic.com/v1/messages';
  
  // Convert messages format for Claude
  const claudeMessages = messages.map(msg => {
    if(msg.role === 'system') {
      return null; // Will be handled separately
    }
    // Handle vision messages
    if(Array.isArray(msg.content)) {
      const claudeContent = msg.content.map(item => {
        if(item.type === 'input_text' || item.type === 'text') {
          return { type: 'text', text: item.text || item.content };
        }
        if(item.type === 'input_image' && item.image_url) {
          // Extract base64 data from data URL
          const base64Match = item.image_url.match(/^data:image\/(.*?);base64,(.*)$/);
          if(base64Match) {
            return {
              type: 'image',
              source: {
                type: 'base64',
                media_type: `image/${base64Match[1]}`,
                data: base64Match[2]
              }
            };
          }
        }
        return item;
      });
      return { role: msg.role === 'user' ? 'user' : 'assistant', content: claudeContent };
    }
    return { role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content };
  }).filter(Boolean);

  // Extract system message
  const systemMsg = messages.find(m => m.role === 'system');
  
  const body = { 
    model: CLAUDE_MODEL, 
    messages: claudeMessages,
    max_tokens: 4096,
    stream 
  };
  
  if(systemMsg) {
    body.system = systemMsg.content;
  }

  const r = await fetch(url, {
    method:'POST',
    headers:{ 
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
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
    const data = await claudeChat(msgs, false);
    const text = data?.content?.[0]?.text || '';
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
    const r = await claudeChat(messages, true);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const decoder = new TextDecoder();
    for await (const chunk of r.body){
      const str = decoder.decode(chunk);
      const lines = str.split('\n');
      for(const line of lines){
        if(!line.trim()) continue;
        res.write(`data: ${line}\n\n`);
      }
    }
    res.write('event: done\n');
    res.write('data: [DONE]\n\n');
    res.end();
  }catch(e){
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\n`);
    res.write(`data: ${String(e)}\n\n`);
    res.end();
  }
});

app.get('/', (req,res)=> res.send('ok'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('server up on', PORT));
