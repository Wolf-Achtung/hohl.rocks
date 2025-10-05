// public/js/daily-spotlight.js
// Lädt ein "Daily Spotlight" dynamisch:
// 1) Wenn <meta name="hohl-chat-base" content="https://..."> vorhanden → von dort /api/daily
// 2) Sonst: statischer Fallback aus /api/daily.json
(function () {
  function apiBase() {
    const meta = document.querySelector('meta[name="hohl-chat-base"]');
    const base = meta?.content?.trim();
    return base ? base.replace(/\/+$/, "") : ""; // leer = nutze Fallback
  }

  async function fetchJSON(url) {
    const r = await fetch(url, { headers: { "cache-control": "no-store" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function loadDaily() {
    const base = apiBase();
    const candidates = base
      ? [`${base}/api/daily`]
      : []; // wenn kein base → nur Fallbacks
    candidates.push("/api/daily.json"); // immer als letzte Option

    let data = null;
    for (const url of candidates) {
      try {
        data = await fetchJSON(url);
        break;
      } catch (e) {
        // next candidate
      }
    }
    if (!data || !data.item) return;

    // in globale Liste vorn einfügen
    window.__TICKER_ITEMS = Array.isArray(window.__TICKER_ITEMS) ? window.__TICKER_ITEMS : [];
    window.__TICKER_ITEMS.unshift({
      label: data.item.label || "Heute neu",
      hint: data.item.hint || "Täglich frisches Micro-Topic",
      explain: data.item.explain || "Kurzformat mit sofort anwendbarer Mini-Aufgabe.",
      action: data.item.action || "claude",
      prompt: data.item.prompt || "Nenne 3 konkrete Mikroschritte, wie ich heute mit KI 10 Minuten spare.",
      placeholder: data.item.placeholder || ""
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDaily);
  } else {
    loadDaily();
  }
})();
