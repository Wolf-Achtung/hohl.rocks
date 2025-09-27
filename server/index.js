// server/index.js – Express + Claude (Anthropic) – Dual-Routen & SSE-Normalisierung
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// ---------- Basics ----------
app.set('trust proxy', 1);
app.use(express.json({ limit: '12mb' }));

// CORS (Whitelist aus ALLOWED_ORIGINS)
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'), false);
  }
}));

// Static & API-JSONs
app.use(express.static(path.join(__dirname, '..')));
app.use('/api', express.static(path.join(__dirname, '..', 'api')));

// ---------- Claude Client ----------
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

// Simple Thread-Speicher (LRU-light)
const threads = new Map();
const MAX_THREADS = 500;

function addToThread(threadId, role, content) {
  if (!threadId) return;
  if (!threads.has(threadId)) {
    if (threads.size >= MAX_THREADS) {
      // simple LRU: erstes Element löschen
      const firstKey = threads.keys().next().value;
      threads.delete(firstKey);
    }
    threads.set(threadId, []);
  }
  threads.get(threadId).push({ role, content });
}

function getThread(threadId) {
  if (!threadId) return [];
  const m = threads.get(threadId);
  if (!m) return [];
  // LRU touch
  threads.delete(threadId);
  threads.set(threadId, m);
  return m.slice(-40); // letzten Verlauf
}

function toClaudeMessages(messages) {
  // transform {role, content} -> Claude message format
  return messages.map(m => {
    // content kann Text oder Array (vision) sein
    if (Array.isArray(m.content)) {
      const parts = m.content.map(p => {
        if (p.type === 'input_text' || p.type === 'text') {
          return { type: 'text', text: p.text || p.content || '' };
        }
        if (p.type === 'input_image' && p.image_url) {
          const m = p.image_url.match(/^data:image\/(.*?);base64,(.*)$/);
          if (m) {
            return { type: 'image', source: { type: 'base64', media_type: `image/${m[1]}`, data: m[2] } };
          }
        }
        return null;
      }).filter(Boolean);
      return { role: m.role === 'user' ? 'user' : 'assistant', content: parts };
    }
    return { role: m.role === 'user' ? 'user' : 'assistant', content: m.content || '' };
  });
}

async function claudeCall({ system, messages, stream = false }) {
  if (!ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    stream,
    messages: toClaudeMessages(messages || [])
  };
  if (system) body.system = system;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text().catch(()=>String(r.status));
    throw new Error(`Claude HTTP ${r.status}: ${t}`);
  }
  return r;
}

function mountClaudeRoutes(prefix = '') {
  const router = express.Router();

  // JSON Chat (non-stream)
  router.post(`${prefix}/claude`, async (req, res) => {
    try {
      const { prompt = '', system, model, thread, image } = req.body || {};
      const history = getThread(thread);
      const msgs = [];
      if (system) msgs.push({ role: 'system', content: system });
      msgs.push(...history);
      if (image) {
        msgs.push({ role: 'user', content: [
          { type:'input_text', text: prompt || 'Bitte analysiere das Bild im Kontext.' },
          { type:'input_image', image_url: image }
        ]});
      } else {
        msgs.push({ role: 'user', content: prompt });
      }

      const r = await claudeCall({ system, messages: msgs, stream: false });
      const j = await r.json();

      // Sammle reinen Text
      const text = (j?.content || [])
        .map(c => (c?.text || ''))
        .join('');

      // Thread pflegen
      addToThread(thread, 'user', prompt);
      addToThread(thread, 'assistant', text);

      res.json({ text, model: j?.model || CLAUDE_MODEL });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // SSE Streaming (normalisiert zu {delta})
  router.get(`${prefix}/claude-sse`, async (req, res) => {
    const prompt = String(req.query.prompt || req.query.message || '');
    const system = String(req.query.system || req.query.systemPrompt || '');
    const thread = String(req.query.thread || '');

    try {
      const history = getThread(thread);
      const msgs = [];
      if (system) msgs.push({ role: 'system', content: system });
      msgs.push(...history);
      msgs.push({ role: 'user', content: prompt });

      const r = await claudeCall({ system, messages: msgs, stream: true });

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      let buffer = '';
      const decoder = new TextDecoder();

      for await (const chunk of r.body) {
        buffer += decoder.decode(chunk, { stream: true });

        // Events blockweise trennen
        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          let ev = 'message';
          let data = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }

          if (!data) continue;

          // Anthropics: verschiedene Events
          if (ev === 'content_block_delta') {
            try {
              const j = JSON.parse(data);
              const t = j?.delta?.text || '';
              if (t) res.write(`data: ${JSON.stringify({ delta: t })}\n\n`);
            } catch {}
          } else if (ev === 'message_stop') {
            res.write('event: done\n');
            res.write('data: [DONE]\n\n');
            res.end();

            // Thread updaten – den finalen Text haben wir akkumuliert nicht,
            // deshalb hier nur Marker anhängen (optional)
            addToThread(thread, 'user', prompt);
          }
        }
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/event-stream' });
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: String(e) })}\n\n`);
      res.end();
    }
  });

  // Optional: strukturierte Antworten für Generate&Show
  router.post(`${prefix}/claude-json`, async (req, res) => {
    try {
      const { prompt = '', system, thread } = req.body || {};
      const history = getThread(thread);
      const msgs = [];
      if (system) msgs.push({ role: 'system', content: system });
      msgs.push(...history);
      msgs.push({ role: 'user', content: prompt + '\n\nAntwort NUR als gültiges JSON liefern.' });

      const r = await claudeCall({ system, messages: msgs, stream: false });
      const j = await r.json();
      const raw = (j?.content || []).map(c => c?.text || '').join('');
      const json = JSON.parse(raw);
      res.json({ ok: true, json, model: j?.model || CLAUDE_MODEL });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e) });
    }
  });

  return router;
}

// Mount unter '' und '/api' sowie Abwärtskompatibilität /chat*
app.use(mountClaudeRoutes(''));
app.use(mountClaudeRoutes('/api'));

// Backward aliases: /chat, /chat-sse -> identisch zu /claude*
app.post('/chat', (req, res, next) => (req.url = '/claude', next()));
app.get('/chat-sse', (req, res, next) => (req.url = '/claude-sse' + (req.url.includes('?') ? '&' : '?') + 'origin=chat', next()));

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// SPA-Fallback (nur GET & nicht-Asset)
app.use((req, res, next) => {
  const p = req.path || '';
  if (
    req.method === 'GET' &&
    !p.startsWith('/api') &&
    !p.startsWith('/claude') &&
    !p.startsWith('/chat') &&
    !p.startsWith('/videos') &&
    !p.match(/\.(?:js|css|svg|png|jpg|jpeg|gif|ico|webm|mp4|map)$/i)
  ) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Fehlerfänger
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', detail: String(err) });
});

app.listen(PORT, () => console.log('server up on', PORT));
