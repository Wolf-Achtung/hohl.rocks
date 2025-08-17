// server.mjs (PATCH) — adds /chat-sse streaming endpoint
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL_DEFAULT = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const RAW_ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://hohl.rocks,https://www.hohl.rocks,http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

if (!OPENAI_API_KEY) console.warn('[WARN] OPENAI_API_KEY not set');

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '16kb' }));
app.use(cors({
  origin: (origin, cb) => !origin || RAW_ALLOWED.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked'), false)
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(['/chat','/chat-sse'], limiter);

app.get('/health', (req, res) => res.json({ ok: true, model: MODEL_DEFAULT }));

app.post('/chat', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Server not configured' });
    const q = (req.body?.q ?? '').toString().slice(0, 4000).trim();
    const model = (req.body?.model || MODEL_DEFAULT).toString();
    const temperature = Math.min(Math.max(Number(req.body?.temperature ?? 0.3), 0), 1);
    if (!q) return res.status(400).json({ error: 'No query' });

    const payload = {
      model, temperature,
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Wolf Hohl (TÜV‑zertifizierter KI‑Manager). Antworte präzise, freundlich, professionell. Bei Compliance-Themen verweise auf EU AI Act & DSGVO.' },
        { role: 'user', content: q }
      ]
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) return res.status(502).json({ error: 'Upstream error', details: await r.text() });
    const data = await r.json();
    res.json({ answer: data?.choices?.[0]?.message?.content ?? '', usage: data?.usage ?? null, model });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Internal error' });
  }
});

// --- NEW: Server-Sent Events streaming endpoint ---
app.post('/chat-sse', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) { res.writeHead(500); return res.end('data: {"error":"not configured"}\n\n'); }
    const q = (req.body?.q ?? '').toString().slice(0, 4000).trim();
    const model = (req.body?.model || MODEL_DEFAULT).toString();
    const temperature = Math.min(Math.max(Number(req.body?.temperature ?? 0.3), 0), 1);
    if (!q) { res.writeHead(400); return res.end('data: {"error":"no query"}\n\n'); }

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
    const ping = setInterval(()=>res.write(': ping\n\n'), 15000);
    req.on('close', ()=> clearInterval(ping));

    // Request OpenAI with streaming
    const payload = {
      model, temperature, stream: true,
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Wolf Hohl (TÜV‑zertifizierter KI‑Manager).' },
        { role: 'user', content: q }
      ]
    };
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!upstream.ok) { send({ error: 'upstream', details: await upstream.text() }); return res.end(); }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!chunk) continue;
        for (const line of chunk.split('\n')) {
          const m = line.match(/^data:\s*(.*)$/);
          if (!m) continue;
          const data = m[1];
          if (data === '[DONE]') { res.write('event: done\ndata: {}\n\n'); return res.end(); }
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content || '';
            if (delta) send({ delta });
          } catch {}
        }
      }
    }
    res.write('event: done\ndata: {}\n\n'); res.end();
  } catch (e) {
    console.error(e);
    try { res.end('data: {"error":"internal"}\n\n'); } catch {}
  }
});

app.listen(PORT, () => {
  console.log(`[hohlrocks-chat] listening on :${PORT}`);
  console.log('Allowed origins:', RAW_ALLOWED);
});
