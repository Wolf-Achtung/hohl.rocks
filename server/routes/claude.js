// File: server/routes/claude.js
import { Router } from 'express';
import { parseSSE } from '../utils/sse.js';

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620';
const VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

const router = Router();

// JSON fallback (non-streaming)
router.post('/api/claude', async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ ok:false, error: 'ANTHROPIC_API_KEY fehlt' });
    const { prompt = '', system = '', model = DEFAULT_MODEL, maxTokens = 512, temperature = 0.7 } = req.body || {};
    const body = {
      model, max_tokens: maxTokens, temperature,
      system: system || undefined,
      messages: [{ role: 'user', content: prompt || '' }]
    };
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': VERSION
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) return res.status(r.status).json({ ok:false, error: await r.text() });
    const j = await r.json();
    const text = Array.isArray(j.content)
      ? j.content.filter(x => x?.type === 'text').map(x => x.text).join('')
      : (j.content?.text || '');
    res.json({ ok: true, model, text, usage: j?.usage || null });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
});

// True SSE pass-through: GET /chat-sse?message=...&systemPrompt=...&model=...
router.get('/chat-sse', async (req, res) => {
  const message = String(req.query.message || '');
  const system = String(req.query.systemPrompt || '');
  const model  = String(req.query.model || DEFAULT_MODEL);
  if (!API_KEY) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    res.write('data: ' + JSON.stringify({ error:'ANTHROPIC_API_KEY fehlt' }) + '\\n\\n');
    return res.end();
  }

  // Start SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive'
  });

  try {
    const body = {
      model, max_tokens: 512, temperature: 0.7,
      system: system || undefined,
      messages: [{ role: 'user', content: message }],
      stream: true
    };
    const upstream = await fetch('https://api.anthropic.com/v1/messages?stream=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': VERSION
      },
      body: JSON.stringify(body)
    });
    if (!upstream.ok || !upstream.body) {
      res.write('data: ' + JSON.stringify({ error: 'Claude upstream error: ' + upstream.status }) + '\\n\\n');
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // Split on double newline boundaries conservatively
      const parts = buf.split(/\\n\\n/);
      buf = parts.pop() || '';
      for (const block of parts) {
        for (const evt of parseSSE(block)) {
          try {
            if (evt.event === 'content_block_delta') {
              const j = JSON.parse(evt.data);
              const text = j?.delta?.text || '';
              if (text) res.write('data: ' + JSON.stringify({ delta: text }) + '\\n\\n');
            } else if (evt.event === 'message_stop') {
              res.write('data: ' + JSON.stringify({ done: true }) + '\\n\\n');
              res.end();
              return;
            } else if (evt.event === 'error') {
              res.write('data: ' + JSON.stringify({ error: evt.data }) + '\\n\\n');
            }
          } catch {
            // pass
          }
        }
      }
    }
    res.write('data: ' + JSON.stringify({ done: true }) + '\\n\\n');
    res.end();
  } catch (e) {
    res.write('data: ' + JSON.stringify({ error: e.message || String(e) }) + '\\n\\n');
    res.end();
  }
});

export default router;
