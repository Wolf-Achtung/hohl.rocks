/*! ticker.js — vLoop5 (slow, seamless, clickable, safe-zone, answer-aware) */
(function () {
  'use strict';

  // ---------- Styles ----------
  const css = `
    .ticker-wrap{position:fixed;left:24px;right:24px;z-index:350;pointer-events:auto}
    .ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);pointer-events:none;
      -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);
              mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}
    .ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;
      animation:ticker-move var(--dur,120s) linear infinite;transform:translateZ(0)}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM ----------
  let wrap, inner, track, baseItems = [];

  function mount() {
    wrap = document.querySelector('.ticker-wrap');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.className = 'ticker-wrap';
      inner = document.createElement('div'); inner.className = 'ticker';
      track = document.createElement('div'); track.className = 'ticker-track';
      inner.appendChild(track); wrap.appendChild(inner); document.body.appendChild(wrap);
    } else {
      inner = wrap.querySelector('.ticker') || inner;
      track = wrap.querySelector('.ticker-track') || track;
      if (!track) { inner = document.createElement('div'); inner.className='ticker'; track=document.createElement('div'); track.className='ticker-track'; inner.appendChild(track); wrap.appendChild(inner); }
    }
  }

  function getItems(){
    if (Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length) return window.__TICKER_ITEMS;
    return [
      { label:"Überrasch mich 🤯", prompt:"Zeig mir etwas Unerwartetes, das KI heute schon gut kann – in 3 Sätzen, mit kleinem Beispiel.", preview:"Kleine Demo, große Wirkung." },
      { label:"Mini-Story (5 Wörter)", prompt:"Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach ein kurzer Titel. Ton: smart, knapp, überraschend.", preview:"Fünf Wörter, ein Plot." },
      { label:"Haiku zur Fahrt", prompt:"Schreibe ein kurzes Haiku über eine nächtliche Highway-Fahrt, Winterluft, Fernlicht, Weite. Ton: ruhig, präzise.", preview:"Drei Zeilen Highway-Luft." }
    ];
  }

  function addChip(dst, label, prompt, preview){
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
        input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true}));
      } else { btn?.click(); }
    });
    dst.appendChild(a);
  }

  function build(){
    track.innerHTML = '';
    baseItems = getItems().slice();
    baseItems.forEach(it => addChip(track, it.label, it.prompt, it.preview));
    topUp();
    setDuration();
  }

  // ---------- Positionierung ----------
  function chatDockRect(){ const c = document.querySelector('.chat-dock'); return c ? c.getBoundingClientRect() : null; }
  function answerRect(){
    // versuche mehrere mögliche Klassen der Antwort/Spotlight
    const el = document.querySelector('.spotlight-card, .spotlight, .answer-overlay, .answer-marquee, .chat-answer, .chat-output');
    return el ? el.getBoundingClientRect() : null;
  }

  // Verhindere Überlappung: orientiere dich an Chat-Input UND an der unteren Kante der Antwort
  function updateBottom(){
    const chat = chatDockRect();
    const ans  = answerRect();
    let bottom = 76; // Mindestabstand

    if (chat){
      // ticker direkt oberhalb der Chat-Box platzieren (kleine Luft)
      bottom = Math.max(bottom, (window.innerHeight - chat.top) + 12);
    }
    if (ans){
      // wenn die Antwort bis sehr weit nach unten reicht, ticker NOCH tiefer drücken (unter die Antwort)
      const distUnderAnswer = Math.max(8, (window.innerHeight - ans.bottom) + 12);
      bottom = Math.min(bottom, distUnderAnswer); // kleinerer bottom = näher am unteren Rand
    }
    wrap.style.bottom = Math.max(12, bottom) + 'px';
  }

  // Rechts Freiraum für die Chat-Box (Safe-Zone)
  function updateSafeZone(){
    const chat = chatDockRect();
    let safe = 340;
    if (chat) safe = Math.ceil(chat.width + 24);
    wrap.style.setProperty('--safeR', safe + 'px');
  }

  // ---------- Laufgeschwindigkeit ----------
  const SPEED_PX_S = 18; // sehr ruhig
  function setDuration(){
    const vw = Math.max(320, window.innerWidth);
    const px = track.scrollWidth + vw;
    const dur = Math.max(48, Math.min(240, px / SPEED_PX_S));
    track.style.setProperty('--dur', dur.toFixed(1) + 's');
  }

  function topUp(){
    const vw = Math.max(320, window.innerWidth);
    let guard = 18;
    while (track.scrollWidth < 3 * vw && guard-- > 0){
      for (const it of baseItems) addChip(track, it.label, it.prompt, it.preview);
    }
  }

  // ---------- Layering: Ticker UNTER der Antwort-Card, aber ÜBER Video/Shapes ----------
  function updateZ(){
    const ans = document.querySelector('.spotlight-card, .spotlight, .answer-overlay, .answer-marquee, .chat-answer, .chat-output');
    let z = 350; // Default über Video/Shapes
    if (ans){
      const zi = parseInt(getComputedStyle(ans).zIndex || '1000', 10);
      z = Math.max(1, zi - 2); // sicher unter der Antwort
    }
    wrap.style.zIndex = String(z);
  }

  // ---------- Pause/Resume ----------
  function pauseTicker(){ track?.classList.add('paused'); }
  function resumeTicker(){ track?.classList.remove('paused'); }

  function init(){
    mount(); if(!track) return;
    build(); updateBottom(); updateSafeZone(); updateZ();

    window.addEventListener('resize', ()=>{ updateBottom(); updateSafeZone(); topUp(); setDuration(); updateZ(); }, {passive:true});
    window.addEventListener('chat:send', ()=>{ pauseTicker(); updateBottom(); updateZ(); });
    window.addEventListener('chat:done', ()=>{ resumeTicker(); updateBottom(); updateZ(); });

    // falls die Antwort-Card dynamisch in den DOM kommt/verschwindet
    const mo = new MutationObserver(()=>{ updateBottom(); updateZ(); });
    mo.observe(document.body, { childList:true, subtree:true });

    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) resumeTicker(); });
    setInterval(()=>resumeTicker(), 30000);
  }

  (document.readyState==='loading')
    ? document.addEventListener('DOMContentLoaded', init, {once:true})
    : init();

  window.Ticker = { pause: pauseTicker, resume: resumeTicker, rebuild: ()=>{ build(); setDuration(); updateBottom(); updateZ(); } };
})();
