// File: public/js/claude-stream.js
import { Settings } from './settings-store.js';

const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  const raw = (meta && meta.content ? meta.content : '').trim();
  return raw ? (raw.endsWith('/') ? raw.slice(0, -1) : raw) : '';
})();

function abs(path) {
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}`;
}

export function streamClaude({ prompt, onToken, onDone, onError }){
  const model = Settings.model || '';
  const system = Settings.system || '';
  const params = new URLSearchParams({ message: prompt || '', systemPrompt: system, model });
  const url = abs('/chat-sse') + '?' + params.toString();

  let es;
  try {
    es = new EventSource(url);
  } catch (e) {
    // Fallback to JSON
  }
  if (es) {
    es.onmessage = (ev) => {
      try {
        const j = JSON.parse(ev.data || '{}');
        if (j.delta && onToken) onToken(j.delta);
        if (j.done) { es.close(); if (onDone) onDone(); }
        if (j.error && onError) onError(new Error(j.error));
      } catch { /* ignore */ }
    };
    es.onerror = () => { es.close(); if (onError) onError(new Error('SSE error')); };
    return { close: () => es.close() };
  }

  // JSON fallback if SSE not available
  (async () => {
    try {
      const r = await fetch(abs('/api/claude'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, system, model })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      const text = j.text || '';
      const chunks = text.match(/.{1,80}/g) || [];
      for (const c of chunks) {
        if (onToken) onToken(c);
        await new Promise(r => setTimeout(r, 8));
      }
      if (onDone) onDone();
    } catch (e) { if (onError) onError(e); }
  })();
  return { close: () => {} };
}
