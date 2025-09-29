// /public/js/daily-spotlight.js
(() => {
  async function inject() {
    try {
      const r = await fetch("/api/daily");
      const j = await r.json();
      const it = j?.item;
      if (!it || !it.label || !it.prompt) return;

      window.__TICKER_ITEMS = Array.isArray(window.__TICKER_ITEMS) ? window.__TICKER_ITEMS : [];
      // Nach vorn stellen (Slot 0)
      window.__TICKER_ITEMS.unshift({
        label: it.label || "Heute neu",
        hint:  it.hint  || "Täglich frisches Micro‑Topic",
        explain: it.explain || "Kurzformat mit sofort anwendbarer Mini‑Aufgabe.",
        action: it.action || "claude",
        prompt: it.prompt || "Gib 5 nützliche Punkte im Kurzformat.",
        placeholder: it.placeholder || ""
      });
    } catch { /* silently ignore */ }
  }

  if (document.readyState !== "loading") inject();
  else window.addEventListener("DOMContentLoaded", inject);
})();
