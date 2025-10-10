// File: public/js/claude-stream.js
// Browser client: resilient SSE with JSON fallback and concise errors (429-friendly)

const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  const raw = (meta?.content || '').trim();
  return raw ? (raw.endsWith('/') ? raw.slice(0, -1) : raw) : '';
})();

function abs(path) {
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}`;
}

function conciseError(e) {
  try {
    if (typeof e === 'string') return e;
    if (e?.error?.message) return e.error.message;
    if (e?.message) return e.message;
  } catch {}
  return 'Unbekannter Fehler';
}

function friendlyErrorText(err) {
  const msg = conciseError(err);
  const code = err?.error?.code || err?.code;
  const retry = err?.error?.retryAfter || err?.retryAfter || null;
  if (String(code) === '429') {
    const wait = retry ? ` Wartezeit: ${retry}s.` : '';
    return `Zu viele Anfragen – bitte kurz warten.${wait}`;
  }
  return msg || 'Etwas ist schiefgegangen.';
}

export async function streamClaude(
  { prompt, system = '', model = '', thread = '' },
  { onToken, onDone, onError } = {}
) {
  const fallbackJSON = async () => {
    try {
      const r = await fetch(abs('/api/claude'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, system, model, thread })
      });
      const j = await r.json();
      if (!r.ok || j?.type === 'error') throw j;
      const t = j?.text || '';
      if (t && onToken) onToken(t);
      onDone?.(j);
    } catch (e) {
      onError?.(friendlyErrorText(e));
    }
  };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort('SSE handshake timeout'), 12_000);

  try {
    const res = await fetch(abs('/api/claude-sse'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, system, model, thread }),
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok || !res.body) return fallbackJSON();

    const dec = new TextDecoder();
    const reader = res.body.getReader();
    let buf = '';
    let queue = [];
    let idle = setTimeout(() => { try { reader.cancel(); } catch{}; fallbackJSON(); }, 30_000);
    const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => { try { reader.cancel(); } catch{}; fallbackJSON(); }, 30_000); };

    const flush = () => {
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        let event = 'message', data = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          if (line.startsWith('data:'))  data += line.slice(5).trim();
        }
        if (event === 'delta') {
          try { const j = JSON.parse(data); if (j?.text) onToken?.(j.text); } catch {}
        }
        if (event === 'error') {
          try { 
            const j = JSON.parse(data);
            // Show friendly immediately
            onError?.(friendlyErrorText(j));
            queue.push(j);
          } catch { onError?.('Stream‑Fehler'); }
        }
        if (event === 'done') { onDone?.(); }
      }
    };

    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      if (d) break;
      resetIdle();
      buf += dec.decode(value, { stream: true });
      flush();
    }
    flush();
  } catch {
    fallbackJSON();
  }
}
