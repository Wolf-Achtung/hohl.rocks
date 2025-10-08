// public/js/claude-stream.js — SSE/JSON Client (Gold‑Standard+)

const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  return (meta?.content || '').trim();
})();

function abs(path) {
  if (!BASE) return path;
  return `${BASE}${path}`;
}

export async function streamClaude({ prompt, system = 'hohl.rocks', model = '', thread = '' }, { onToken, onDone, onError } = {}) {
  try {
    const res = await fetch(abs('/api/claude-sse'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system, model, thread })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Claude SSE HTTP ${res.status}: ${msg}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        let data = '', event = 'message';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) continue;
        if (event === 'delta') { try { const j = JSON.parse(data); if (j?.text && typeof onToken === 'function') onToken(j.text); } catch {} }
        if (event === 'done') { if (typeof onDone === 'function') onDone(); return; }
        if (event === 'error' && typeof onError === 'function') onError(new Error(data));
      }
    }
    if (typeof onDone === 'function') onDone();
  } catch (err) {
    if (typeof onError === 'function') onError(err);
  }
}

export async function fetchNews() { const r = await fetch(abs('/api/news')); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
export async function fetchTopPrompts() { const r = await fetch(abs('/api/prompts/top')); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
export async function fetchDaily() { const r = await fetch(abs('/api/daily')); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
