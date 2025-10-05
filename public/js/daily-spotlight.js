// /public/js/daily-spotlight.js
(() => {
  const BASE = (document.querySelector('meta[name="hohl-chat-base"]')?.content || '').replace(/\/+$/, '') || location.origin;

  async function inject() {
    try {
      const r = await fetch(`${BASE}/api/daily`, { headers: { 'cache-control': 'no-store' } });
      if (!r.ok) return;
      const j = await r.json().catch(() => null);
      const it = j?.item;
      if (!it || !it.label || !it.prompt) return;

      window.__TICKER_ITEMS = Array.isArray(window.__TICKER_ITEMS) ? window.__TICKER_ITEMS : [];
      // Nach vorn stellen (Slot 0)
      window.__TICKER_ITEMS.unshift({
        label: it.label || 'Heute neu',
        hint:  it.hint  || 'Täglich frisches Micro‑Topic',
        explain: it.explain || 'Kurzformat mit sofort anwendbarer Mini‑Aufgabe.',
        action: it.action || 'claude',
        prompt: it.prompt || 'Gib 5 nützliche Punkte im Kurzformat.',
        placeholder: it.placeholder || ''
      });
    } catch { /* silently ignore */ }
  }

  if (document.readyState !== 'loading') inject();
  else window.addEventListener('DOMContentLoaded', inject);
})();
