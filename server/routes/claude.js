// server/routes/claude.js — Anthropic (Claude) JSON + SSE
// Benötigt: ANTHROPIC_API_KEY (oder CLAUDE_API_KEY). Node 20+ global fetch.

import express from 'express';

export const router = express.Router();

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = (process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022').trim();
const FALLBACKS = ['claude-3-5-sonnet-latest', 'claude-3-haiku-20240307'].filter(m => m !== DEFAULT_MODEL);
const MODELS = [DEFAULT_MODEL, ...FALLBACKS].filter(Boolean);

// --- Mini Thread‑Store (4h TTL, max 500)
const TTL = 4 * 60 * 60 * 1000;
const MAX = 500;
const SESS = new Map(); // id -> {t:number, m:Array<{role,content}>}

function touchThread(id) {
  const now = Date.now();
  let t = SESS.get(id);
  if (!t) { t = { t: now, m: [] }; SESS.set(id, t); }
  t.t = now;
  // prune old
  const tooOld = now - TTL;
  if (SESS.size > MAX) {
    const arr = [...SESS.entries()].sort((a, b) => a[1].t - b[1].t);
    for (let i = 0; i < arr.length - MAX; i++) SESS.delete(arr[i][0]);
  }
  for (const [k, v] of SESS) if (v.t < tooOld) SESS.delete(k);
  return t.m;
}
const pushMsg = (id, role, content) => { if (!id) return; touchThread(id).push({ role, content }); };

function headers(extra = {}) {
  if (!API_KEY) throw new Error('Missing ANTHROPIC_API_KEY / CLAUDE_API_KEY');
  return { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', ...extra };
}

// --- Helpers
const toMessages = (hist, user, system) => {
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: String(system) });
  msgs.push(...hist.slice(-40));
  msgs.push({ role: 'user', content: String(user) });
  return msgs;
};

// --- JSON (klassisch, nicht‑streamend)
router.post('/claude', express.json(), async (req, res) => {
  try {
    const { prompt = '', system = '', model = DEFAULT_MODEL, thread: id = '', image } = req.body || {};
    const hist = touchThread(id);
    let messages;

    if (image) {
      messages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...hist,
        { role: 'user', content: [{ type: 'input_text', text: String(prompt || 'Bitte analysiere dieses Bild.') }, { type: 'input_image', image_url: image }] }
      ];
    } else {
      messages = toMessages(hist, prompt, system);
    }

    const r = await fetch(API_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ model, max_tokens: 1200, temperature: 0.7, stream: false, messages })
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(502).json({ error: 'Claude upstream', status: r.status, body: txt });
    }
    const j = await r.json();
    const text = (j?.content || []).map(c => c?.text || '').join('');
    pushMsg(id, 'user', prompt);
    pushMsg(id, 'assistant', text);
    return res.json({ text, model: j?.model || model });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

// --- JSON strukturiert (reines JSON zurück)
router.post('/claude-json', express.json(), async (req, res) => {
  try {
    const { prompt = '', model = DEFAULT_MODEL } = req.body || {};
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model,
        max_tokens: 900,
        temperature: 0.4,
        stream: false,
        system: 'Antworte NUR mit gültigem JSON ohne erklärenden Text.',
        messages: [{ role: 'user', content: String(prompt) }]
      })
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(502).json({ error: 'Claude upstream', status: r.status, body: txt });
    }
    const j = await r.json();
    const raw = (j?.content || []).map(c => c?.text || '').join('');
    let obj = null; try { obj = JSON.parse(raw); } catch {}
    return res.json({ ok: !!obj, json: obj, rawText: raw });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

// --- SSE (Streaming)
router.post('/claude-sse', express.json(), async (req, res) => {
  try {
    const { prompt = '', system = '', model = DEFAULT_MODEL, thread: id = '' } = req.body || {};
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const models = MODELS.length ? MODELS : [DEFAULT_MODEL];
    let sent = false, acc = '';

    for (const m of models) {
      const upstream = await fetch(API_URL, {
        method: 'POST',
        headers: { ...headers({ accept: 'text/event-stream' }) },
        body: JSON.stringify({ model: m, stream: true, max_tokens: 1200, temperature: 0.7, system, messages: toMessages(touchThread(id), prompt, system) })
      });

      if (!upstream.ok) {
        const txt = await upstream.text().catch(() => '');
        if (upstream.status === 404) continue; // nächstes Modell versuchen
        res.write(`event: error\ndata: ${JSON.stringify({ status: upstream.status, message: txt })}\n\n`);
        res.write(`event: done\ndata: {}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      // Heartbeat: hält Verbindung über Proxies offen
      const hb = setInterval(() => res.write(`:hb ${Date.now()}\n\n`), 15000);
      const onClose = () => { clearInterval(hb); try { reader.cancel(); } catch {} };

      req.on('close', onClose);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let ix;
        while ((ix = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, ix); buf = buf.slice(ix + 2);
          let event = 'message', data = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (!data || data === '[DONE]') continue;

          try {
            const ev = JSON.parse(data);
            if (ev?.type === 'content_block_delta' && ev?.delta?.text) {
              sent = true;
              acc += ev.delta.text;
              res.write(`event: delta\ndata: ${JSON.stringify({ text: ev.delta.text })}\n\n`);
            }
            if (ev?.type === 'message_stop') {
              pushMsg(id, 'user', prompt);
              pushMsg(id, 'assistant', acc);
              onClose();
              res.write(`event: done\ndata: {}\n\n`);
              return res.end();
            }
          } catch {
            // ignore
          }
        }
      }
      onClose();
      break; // normal beendet
    }

    if (!sent) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Kein Modell verfügbar. Environment prüfen.' })}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    }
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(e?.message || e) })}\n\n`);
    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  }
});

