// File: server/routes/claude.js
// Anthropic Messages API router — SSE + JSON with thread mini-store and robust error handling

import { Router } from 'express';

export const router = Router();

// ---- Config -------------------------------------------------------------------
const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
if (!API_KEY) {
  console.warn('[warn] ANTHROPIC_API_KEY not set — /api/claude* will return 503');
}

const DEFAULT_MODELS = [
  'claude-3-5-sonnet-latest',
  'claude-3-opus-latest',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
];

const MODEL_LIST = (process.env.CLAUDE_MODELS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const MODELS = MODEL_LIST.length ? MODEL_LIST : DEFAULT_MODELS;

const MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS || 1024);
const TEMPERATURE = Number(process.env.CLAUDE_TEMPERATURE || 0.7);

// ---- Mini thread store (in-memory, TTL) --------------------------------------
const THREADS = new Map(); // id -> { messages, exp, updated }
const THREAD_TTL_MS = 4 * 60 * 60 * 1000; // 4h
const THREAD_MAX_HISTORY = 12; // pairs (user/assistant) trimmed — per Wolf

function _now() { return Date.now(); }
function getThreadMessages(id) {
  if (!id) return [];
  const t = THREADS.get(id);
  if (!t) return [];
  if (_now() > t.exp) { THREADS.delete(id); return []; }
  return t.messages || [];
}
function setThreadMessages(id, messages) {
  if (!id) return;
  const trimmed = trimHistory(messages, THREAD_MAX_HISTORY);
  THREADS.set(id, { messages: trimmed, exp: _now() + THREAD_TTL_MS, updated: _now() });
}
function trimHistory(msgs, maxPairs) {
  const list = Array.isArray(msgs) ? msgs.slice(-maxPairs * 2) : [];
  return list;
}
// opportunistic pruning
function pruneThreads(limit = 180) {
  if (THREADS.size <= limit) return;
  const arr = Array.from(THREADS.entries()).sort((a,b)=> (a[1].updated||0) - (b[1].updated||0));
  for (let i = 0; i < arr.length - limit; i++) THREADS.delete(arr[i][0]);
}

// ---- Helpers ------------------------------------------------------------------
function buildMessages(threadMsgs, userText) {
  const messages = [];
  for (const m of threadMsgs) {
    if (!m || !m.role || !m.content) continue;
    messages.push({
      role: (m.role === 'assistant' ? 'assistant' : 'user'),
      content: typeof m.content === 'string'
        ? m.content
        : (Array.isArray(m.content) ? m.content.map(x => x.text || '').join('\\n') : String(m.content))
    });
  }
  messages.push({ role: 'user', content: userText || '' });
  return messages;
}

function anthropicHeaders() {
  return {
    'content-type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01'
  };
}

function pickModels(preferred, codeHint) {
  // Strategy per Wolf: default sonnet-latest, on 429 prefer haiku (low latency), otherwise try opus → sonnet-20240229
  const order429 = [preferred || 'claude-3-5-sonnet-latest', 'claude-3-haiku-20240307', 'claude-3-opus-latest', 'claude-3-sonnet-20240229'];
  const orderDefault = [preferred || 'claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
  const base = (codeHint === 429) ? order429 : orderDefault;
  const custom = (MODELS && MODELS.length) ? MODELS : [];
  const list = [];
  for (const m of base) if (!list.includes(m)) list.push(m);
  for (const m of custom) if (!list.includes(m)) list.push(m);
  return list;
}

async function callAnthropic({ model, system, messages, stream }) {
  const body = {
    model,
    system: system || undefined,     // IMPORTANT: system is top-level, NOT a message!
    messages,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream: Boolean(stream)
  };
  const ctrl = AbortSignal.timeout(45_000);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: anthropicHeaders(),
    body: JSON.stringify(body),
    signal: ctrl
  });
  return res;
}

async function parseNonStreamJSON(res) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (j && (j.error || j)) || {};
    const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
    const code = res.status;
    const e = Object.assign(new Error(msg), { code, meta: err, retryAfter: res.headers.get('retry-after') || null });
    throw e;
  }
  const pieces = (j?.content || []).filter(p => p?.type === 'text').map(p => p.text);
  return { text: pieces.join(''), model: j?.model, usage: j?.usage || null, raw: j };
}

// ---- Routes: JSON -------------------------------------------------------------
router.post('/claude', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ type:'error', error: { code:503, message: 'ANTHROPIC_API_KEY is not set' } });

  try {
    const { prompt = '', system = '', model = '', thread = '' } = req.body || {};
    const history = getThreadMessages(thread);
    const messages = buildMessages(history, String(prompt || '').trim());

    let lastError = null;
    let codeHint = null;

    for (const mdl of pickModels(model, codeHint)) {
      try {
        const upstream = await callAnthropic({ model: mdl, system, messages, stream: false });
        if (upstream.status === 429) {
          codeHint = 429;
          lastError = new Error('rate_limited'); lastError.code = 429;
          lastError.retryAfter = upstream.headers.get('retry-after') || null;
          continue; // try next model (haiku prioritized next)
        }
        if (upstream.status >= 500) {
          lastError = new Error(`upstream_${upstream.status}`); lastError.code = upstream.status;
          continue;
        }
        const out = await parseNonStreamJSON(upstream);

        // update thread
        const newHistory = history.concat([
          { role: 'user', content: String(prompt) },
          { role: 'assistant', content: out.text }
        ]);
        setThreadMessages(thread, newHistory);
        pruneThreads();

        return res.json({
          type: 'ok',
          text: out.text,
          model: out.model || mdl,
          thread,
          usage: out.usage || null
        });
      } catch (e) {
        lastError = e;
        codeHint = e?.code || codeHint;
        continue;
      }
    }
    // All models failed
    const code = (lastError && (lastError.code || 500)) || 500;
    const retryAfter = lastError?.retryAfter || null;
    return res.status(code >= 400 ? code : 500).json({
      type: 'error',
      error: { code, message: lastError?.message || 'unknown_error', retryAfter }
    });
  } catch (e) {
    return res.status(500).json({ type: 'error', error: { code:500, message: String(e?.message || e) } });
  }
});

// ---- Routes: SSE --------------------------------------------------------------
router.post('/claude-sse', async (req, res) => {
  if (!API_KEY) {
    res.writeHead(503, { 'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
    res.write(`event: error\\ndata: ${JSON.stringify({ code:503, message:'ANTHROPIC_API_KEY is not set' })}\\n\\n`);
    return res.end();
  }

  const { prompt = '', system = '', model = '', thread = '' } = req.body || {};
  const history = getThreadMessages(thread);
  const messages = buildMessages(history, String(prompt || '').trim());

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const send = (event, data) => {
    res.write(`event: ${event}\\n`);
    res.write(`data: ${JSON.stringify(data)}\\n\\n`);
  };

  let aggregatedText = '';
  let usedModel = model || '';
  let success = false;
  let codeHint = null;

  for (const mdl of pickModels(model, codeHint)) {
    try {
      const upstream = await callAnthropic({ model: mdl, system, messages, stream: true });

      if (upstream.status === 429) {
        codeHint = 429;
        send('error', { code: 429, message: 'Zu viele Anfragen – bitte kurz warten.', retryAfter: upstream.headers.get('retry-after') || null });
        continue;
      }
      if (upstream.status >= 500) {
        send('error', { code: upstream.status, message: 'Upstream‑Fehler beim Modell' });
        continue;
      }
      if (!upstream.ok || !upstream.body) {
        send('error', { code: upstream.status || 500, message: 'Kein Stream verfügbar' });
        continue;
      }

      usedModel = mdl;

      // Parse Anthropic SSE: content_block_delta → text_delta
      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      const flushFrames = () => {
        let idx;
        while ((idx = buf.indexOf('\\n\\n')) >= 0) {
          const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
          let event = 'message', payload = '';
          for (const line of frame.split('\\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            if (line.startsWith('data:'))  payload += line.slice(5).trim();
          }
          try {
            if (event === 'content_block_delta') {
              const p = JSON.parse(payload);
              const delta = p?.delta;
              if (delta?.type === 'text_delta' && typeof delta?.text === 'string') {
                aggregatedText += delta.text;
                send('delta', { text: delta.text });
              }
            } else if (event === 'message_stop') {
              success = true;
              send('done', { model: usedModel });
            } else if (event === 'error') {
              const p = JSON.parse(payload || '{}');
              send('error', { code: p?.error?.type || 'error', message: p?.error?.message || 'stream_error' });
            }
          } catch { /* ignore malformed frames */ }
        }
      };

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) { done = true; break; }
        buf += dec.decode(value, { stream: true });
        flushFrames();
      }
      flushFrames();

      if (success) break;
    } catch (e) {
      send('error', { code: 'exception', message: e?.message || 'Stream‑Ausnahme' });
      continue;
    }
  }

  if (success && aggregatedText) {
    const newHistory = history.concat([
      { role: 'user', content: String(prompt) },
      { role: 'assistant', content: aggregatedText }
    ]);
    setThreadMessages(thread, newHistory);
    pruneThreads();
  }

  try { res.end(); } catch {}
});
