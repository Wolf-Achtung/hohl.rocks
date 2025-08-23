/*! ticker.js — vLoop3 (slow + safe zone + seamless) */
(function () {
  'use strict';

  // ---------- Stil ----------
  const css = `
    .ticker-wrap{position:fixed;left:24px;right:24px;z-index:45;pointer-events:auto}
    .ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);
      -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);
              mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}
    .ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;
      animation:ticker-move var(--dur,90s) linear infinite}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- DOM ----------
  let wrap = document.querySelector('.ticker-wrap');
  let inner, track, baseItems = [];

  function mount() {
    if (wrap) return;
    wrap = document.createElement('div'); wrap.className = 'ticker-wrap';
    inner = document.createElement('div'); inner.className = 'ticker';
    track = document.createElement('div'); track.className = 'ticker-track';
    inner.appendChild(track); wrap.appendChild(inner); document.body.appendChild(wrap);
  }

  // ---------- Inhalte ----------
  function getItems() {
    if (Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length) return window.__TICKER_ITEMS;
    // Fallback — falls mal nichts geladen ist
    return [
      { label: "Überrasch mich 🤯", prompt: "Zeig mir etwas Unerwartetes, das KI heute schon gut kann – in 3 Sätzen, mit kleinem Beispiel.", preview:"Kleine Demo, große Wirkung." },
      { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach ein kurzer Titel. Ton: smart, knapp, überraschend.", preview:"Fünf Wörter, ein Plot." },
      { label: "Haiku zur Fahrt", prompt: "Schreibe ein kurzes Haiku über eine nächtliche Highway-Fahrt, Winterluft, Fernlicht, Weite. Ton: ruhig, präzise.", preview:"Drei Zeilen Highway-Luft." }
    ];
  }

  function addChip(dst, label, prompt, preview) {
    const a = document.createElement('a');
    a.href = '#'; a.textContent = label; if (preview) a.title = preview;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      pauseTicker();
      try { window.AnalyticsLite?.emit?.('ticker_click', { label }); } catch {}
      try { if (window.ChatDock?.send) { ChatDock.send(prompt); return; } } catch {}
      const input = document.querySelector('#chat-input'); const btn = document.querySelector('#chat-send');
      if (input) {
        input.value = prompt;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true }));
      } else { btn?.click(); }
    });
    dst.appendChild(a);
  }

  function build() {
    track.innerHTML = '';
    baseItems = getItems().slice();
    baseItems.forEach(it => addChip(track, it.label, it.prompt, it.preview));
    topUp();
    setDuration(); // nach Aufbau Dauer setzen
  }

  // ---------- Layout & Lauf ----------
  function updateBottom() {
    const chat = document.querySelector('.chat-dock');
    let bottom = 104;
    if (chat) {
      try { bottom = (window.innerHeight - chat.getBoundingClientRect().top) + 20; } catch {}
    }
    wrap.style.bottom = Math.max(76, bottom) + 'px';
  }

  function updateSafeZone() {
    const chat = document.querySelector('.chat-dock');
    let safe = 340; // Standard, falls Chat nicht da ist
    if (chat) { try { safe = Math.ceil(chat.getBoundingClientRect().width + 24); } catch {} }
    wrap.style.setProperty('--safeR', safe + 'px'); // verhindert Überlappung mit dem Eingabefeld
  }

  // sehr ruhig: Pixel/Sek runter
  const SPEED_PX_S = 22; // ↓ langsamer (zuvor ~60)
  function setDuration() {
    const vw = Math.max(320, window.innerWidth);
    const px = track.scrollWidth + vw; // Weg über den Rand hinaus
    const dur = Math.max(40, Math.min(220, px / SPEED_PX_S)); // Grenzen
    track.style.setProperty('--dur', dur.toFixed(1) + 's');
  }

  function topUp() {
    const vw = Math.max(320, window.innerWidth);
    let guard = 16;
    while (track.scrollWidth < 3 * vw && guard-- > 0) {
      for (const it of baseItems) addChip(track, it.label, it.prompt, it.preview);
    }
  }

  function pauseTicker()   { track?.classList.add('paused'); }
  function resumeTicker()  { track?.classList.remove('paused'); }

  function init() {
    mount();
    // Falls von älteren Builds schon vorhanden:
    inner = inner || wrap.querySelector('.ticker') || inner;
    track = track || wrap.querySelector('.ticker-track') || track;
    if (!track) { inner = document.createElement('div'); inner.className='ticker'; track=document.createElement('div'); track.className='ticker-track'; inner.appendChild(track); wrap.appendChild(inner); }

    build();
    updateBottom(); updateSafeZone();

    window.addEventListener('resize', () => { updateBottom(); updateSafeZone(); topUp(); setDuration(); }, { passive: true });
    window.addEventListener('chat:send', pauseTicker);
    window.addEventListener('chat:done', resumeTicker);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resumeTicker(); });
    setInterval(() => resumeTicker(), 30000); // Safety
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.Ticker = { pause: pauseTicker, resume: resumeTicker, rebuild: () => { build(); setDuration(); } };
})();
