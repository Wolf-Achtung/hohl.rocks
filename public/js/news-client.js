// File: public/js/news-client.js
const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  const raw = (meta?.content || '').trim();
  return raw ? (raw.endsWith('/') ? raw.slice(0, -1) : raw) : '';
})();

function abs(p){ return p.startsWith('/') ? `${BASE}${p}` : p; }

export async function fetchNews() {
  const r = await fetch(abs('/api/news'));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchTopPrompts() {
  const r = await fetch(abs('/api/prompts/top'));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
