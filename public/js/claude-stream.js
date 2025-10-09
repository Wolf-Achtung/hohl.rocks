// File: public/js/claude-stream.js — SSE/JSON Client (resilient)

const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  const raw = (meta?.content || '').trim();
  return raw.endsWith('/') ? raw.slice(0,-1) : raw;
})();

function abs(path) {
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}`;
}

export async function streamClaude(
  { prompt, system = 'hohl.rocks', model = '', thread = '' },
  { onToken, onDone, onError } = {}
) {
  const invokeJSONFallback = async () => {
    try {
      const r = await fetch(abs('/api/claude'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, system, model, thread })
      });
      const j = await r.json();
      const t = j?.text || j?.answer || '';
      if (t && typeof onToken === 'function') onToken(t);
      if (typeof onDone === 'function') onDone();
    } catch (e) {
      if (typeof onError === 'function') onError(e);
    }
  };

  const ctrl = new AbortController();
  const handshakeTimer = setTimeout(() => ctrl.abort('SSE handshake timeout'), 12000);

  try {
    const res = await fetch(abs('/api/claude-sse'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, system, model, thread }),
      signal: ctrl.signal
    });
    clearTimeout(handshakeTimer);

    if (!res.ok || !res.body) {
      await invokeJSONFallback();
      return;
    }

    const dec = new TextDecoder();
    const reader = res.body.getReader();
    let buf = '';
    let idleTimer = null;

    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        try { reader.cancel(); } catch {}
        invokeJSONFallback();
      }, 30000);
    };
    resetIdle();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetIdle();
      buf += dec.decode(value, { stream: true });

      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        let event = 'message', data = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          if (line.startsWith('data:'))  data += line.slice(5).trim();
        }
        if (event === 'delta') {
          try { const j = JSON.parse(data); const t = j?.text ?? ''; if (t && typeof onToken === 'function') onToken(t); } catch {}
        }
        if (event === 'error') {
          try { const j = JSON.parse(data); if (typeof onError === 'function') onError(new Error(j?.message || 'SSE error')); } catch {}
          await invokeJSONFallback();
          return;
        }
        if (event === 'done') { if (typeof onDone === 'function') onDone(); return; }
      }
    }
    if (typeof onDone === 'function') onDone();
  } catch (_e) {
    await invokeJSONFallback();
  }
}

export async function fetchNews() {
  const r = await fetch(abs('/api/news'));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json(); // { items:[{title,url,source}], stand:'HH:MM' }
}

export async function fetchTopPrompts() {
  const r = await fetch(abs('/api/prompts/top'));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchDaily() {
  const r = await fetch(abs('/api/daily'));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
