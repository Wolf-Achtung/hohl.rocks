import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// CORS
const parseOrigins = (str) => (str || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const ALLOWED = parseOrigins(process.env.ALLOWED_ORIGINS);

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();
  if (!ALLOWED.length) {
    // Dev mode: allow all
    res.header('Access-Control-Allow-Origin', '*');
  } else if (ALLOWED.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else {
    // Not allowed: short-circuit with 403 to avoid confusing 502s
    return res.status(403).json({ error: 'Origin not allowed', origin });
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (req, res) => res.type('text/plain').send('ok'));

// Utility: OpenAI fetch
async function openAIChat({ message, systemPrompt, model = MODEL, stream = false }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const body = {
    model,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: message }
    ],
    temperature: 0.3,
    stream
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(()=>''); 
    throw new Error(`OpenAI ${resp.status}: ${text}`);
  }
  return resp;
}

// JSON endpoint (non-streaming)
app.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt, model } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message missing' });

    const resp = await openAIChat({ message, systemPrompt, model, stream: false });
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content || '';

    // CORS echo for some proxies
    const origin = req.headers.origin;
    if (ALLOWED.length && ALLOWED.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!ALLOWED.length) {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.json({ answer, model: data?.model, usage: data?.usage });
  } catch (err) {
    console.error('[chat] error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// SSE endpoint (streaming)
app.post('/chat-sse', async (req, res) => {
  try {
    const { message, systemPrompt, model } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message missing' });

    // SSE headers
    // Nginx-friendly + no buffering
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    const origin = req.headers.origin;
    if (ALLOWED.length && ALLOWED.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else if (!ALLOWED.length) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Open channel (optional event)
    res.write('event: open\n');
    res.write('data: {"ok": true}\n\n');

    // Heartbeat to keep connections alive behind proxies
    const heart = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    const upstream = await openAIChat({ message, systemPrompt, model, stream: true });

    // OpenAI streams its own SSE. We parse each `data:` JSON and forward
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    function flushLines() {
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          res.write('data: {"done": true}\n\n');
          res.end();
          return true;
        }
        try {
          const json = JSON.parse(payload);
          // Chat Completions delta path
          const delta = json?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            res.write('data: ' + JSON.stringify({ delta }) + '\n\n');
          }
        } catch (e) {
          // Forward raw payload for debugging
          res.write('event: upstream\n');
          res.write('data: ' + JSON.stringify({ raw: payload }) + '\n\n');
        }
      }
      return false;
    }

    // Stream loop
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const finished = flushLines();
      if (finished) break;
    }
    // Flush any remainder (shouldn't happen for SSE)
    flushLines();

    clearInterval(heart);
  } catch (err) {
    console.error('[chat-sse] error', err);
    try {
      // Attempt to send as SSE error
      res.write('event: error\n');
      res.write('data: ' + JSON.stringify({ message: String(err.message || err) }) + '\n\n');
      res.end();
    } catch {}
  }
});

// Simple 404 for clarity
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[hohlrocks-chat] listening on :${PORT}`);
  console.log('Allowed origins:', ALLOWED.length ? ALLOWED : ['* (dev)']);
});
