// server.mjs – Chat-Backend mit Claude API (JSON + SSE)
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
  
  // Convert OpenAI format to Claude format if needed
  const claudeMessages = messages.map(msg => {
    if(msg.role === 'system') {
      // Claude doesn't have system role, move to user message
      return { role: 'user', content: msg.content };
    }
    // Handle vision messages
    if(Array.isArray(msg.content)) {
      const claudeContent = msg.content.map(item => {
        if(item.type === 'input_text' || item.type === 'text') {
          return { type: 'text', text: item.text || item.content };
        }
        if(item.type === 'input_image' && item.image_url) {
          // Claude expects base64 data
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
  });

  // Extract system message if exists
  let systemPrompt = '';
  const userMessages = [];
  for(const msg of claudeMessages) {
    if(messages.find(m => m.role === 'system' && m.content === msg.content)) {
      systemPrompt = msg.content;
    } else {
      userMessages.push(msg);
    }
  }

  const body = { 
    model: CLAUDE_MODEL, 
    messages: userMessages,
    max_tokens: 4096,
    stream
  };
  
  if(systemPrompt) {
    body.system = systemPrompt;
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
    console.error('Chat error:', e);
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
        
        // Claude SSE format handling
        if(line.startsWith('data: ')) {
          const data = line.substring(6);
          if(data === '[DONE]') {
            res.write('event: done\n');
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              // Forward Claude's streaming format
              res.write(`data: ${JSON.stringify(parsed)}\n\n`);
            } catch(e) {
              // If not JSON, forward as-is
              res.write(`${line}\n\n`);
            }
          }
        } else {
          res.write(`${line}\n\n`);
        }
      }
    }
    res.end();
  }catch(e){
    console.error('SSE error:', e);
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\n`);
    res.write(`data: ${String(e)}\n\n`);
    res.end();
  }
});

// Alternative POST endpoint for SSE
app.post('/chat-sse', async (req,res)=>{
  try{
    const { message, systemPrompt } = req.body || {};
    const messages = [];
    if(systemPrompt) messages.push({ role:'system', content: systemPrompt });
    messages.push({ role:'user', content: message || '' });
    
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
        if(line.startsWith('data: ')) {
          res.write(`${line}\n\n`);
        }
      }
    }
    res.write('event: done\n');
    res.write('data: [DONE]\n\n');
    res.end();
  }catch(e){
    console.error('POST SSE error:', e);
    res.writeHead(500, {'Content-Type':'text/event-stream'});
    res.write(`event: error\n`);
    res.write(`data: ${String(e)}\n\n`);
    res.end();
  }
});

app.get('/', (req,res)=> res.send('ok'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('server up on', PORT));
