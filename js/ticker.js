/*! ticker.js — vLoop6 (slow, seamless, clickable, answer-aware, no-overlap) */
(function () {
  'use strict';

  // ---------- Styles ----------
  const css = `
    .ticker-wrap{position:fixed;left:24px;right:24px;z-index:250;pointer-events:auto}
    .ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);pointer-events:none;
      -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);
              mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}
    .ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;
      animation:ticker-move var(--dur,140s) linear infinite;animation-delay:var(--delay,-8s);transform:translateZ(0)}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}
    /* Integrated ask bar for free-form questions */
    .ticker-ask{position:absolute;top:0;right:0;height:100%;display:flex;align-items:center;gap:8px;pointer-events:auto;padding-left:8px;background:transparent}
    .ticker-ask input{width:min(48vw,360px);max-width:68vw;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);
      color:#eaf2ff;border-radius:999px;padding:10px 14px;outline:none;flex:1 1 auto;}
    .ticker-ask button{background:#1b66ff;border:0;color:#fff;border-radius:999px;padding:9px 14px;cursor:pointer;flex:0 0 auto;}
    .ticker-ask button:hover{background:#2857e7}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  
    @media (max-width: 390px){
      .ticker-wrap{left:12px;right:12px}
      .ticker{height:38px}
      .ticker-track{gap:10px}
      .ticker a{padding:8px 12px;font-size:13px}
      .ticker-ask input{padding:8px 12px;font-size:14px}
      .ticker-ask button{padding:8px 12px;font-size:14px}
    }
`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM ----------
  let wrap, inner, track, askWrap, askInput, askButton, baseItems = [];

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

  // ---------- Inhalte ----------
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
      ensureOneAnswerOnly(); // alte Spotlight(s) räumen
      try { window.AnalyticsLite?.emit?.('ticker_click', { label }); } catch {}
      // Handle action-chips like "!action:..." (can include "; gpt:...")
      try{
        if (prompt && prompt.indexOf('!action:')>-1 && window.WolfFX && WolfFX.run){ WolfFX.run(prompt); return; }
      }catch(_){ }
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

  // ---------- Hilfen ----------
  function chatDockRect(){ const c = document.querySelector('.chat-dock'); if(!c) return null; const r = c.getBoundingClientRect(); if((r.width===0 && r.height===0) || getComputedStyle(c).display==='none' || getComputedStyle(c).visibility==='hidden'){ return null; } return r; }
  function answerEl(){
    // häufige Klassen/IDs deines Overlays – erweitere bei Bedarf
    return document.querySelector('.spotlight-card, .answer-overlay, .chat-answer, .chat-output, .answer-marquee');
  }
  function answerRect(){ const el = answerEl(); return el ? el.getBoundingClientRect() : null; }

  // nur die NEUSTE Antwort sichtbar halten (ältere entfernen/ausblenden)
  function ensureOneAnswerOnly(){
    const all = Array.from(document.querySelectorAll('.spotlight-card, .answer-overlay, .answer-marquee'));
    if (all.length > 1) {
      all.slice(0, -1).forEach(n => { n.remove(); }); // oder: n.style.display='none';
    }
  }

  // Bottom-Position: zwischen Antwort und Chat-Input, ohne Überschneidung
  function updateBottom(){
      const chat = chatDockRect();
      const ans  = answerRect();
      const tickerH = (inner?.getBoundingClientRect().height) || 48;

      let bottom = 76; // sane default
      // Only use chat if it's actually visible
      if (chat){
        const candidate = (window.innerHeight - chat.top) + 12;
        // Clamp to keep banner in view (12..240px)
        bottom = Math.min(Math.max(bottom, candidate), 240);
      }

      if (ans){
        const maxBottom = Math.max(12, window.innerHeight - ans.bottom - 12 - tickerH);
        bottom = Math.min(bottom, maxBottom);
      }

      wrap.style.bottom = Math.max(12, bottom) + 'px';
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

  // Layering: immer UNTER der Antwort-Card, aber ÜBER Video/Shapes
  function updateZ(){
    const ans = answerEl();
    let z = 250;
    if (ans){
      const zi = parseInt(getComputedStyle(ans).zIndex || '1000', 10);
      z = Math.min(zi - 5, 600); // sicher unter der Antwort
    }
    wrap.style.zIndex = String(z);
  }

  // ---------- Laufgeschwindigkeit ----------
  const SPEED_PX_S = 16; // sehr ruhig (ggf. 14 probieren)
  function setDuration(){
    const vw = Math.max(320, window.innerWidth);
    const px = track.scrollWidth + vw;
    const dur = Math.max(60, Math.min(260, px / SPEED_PX_S));
    track.style.setProperty('--dur', dur.toFixed(1) + 's');
  }

  function topUp(){
    const vw = Math.max(320, window.innerWidth);
    let guard = 20;
    while (track.scrollWidth < 3 * vw && guard-- > 0){
      for (const it of baseItems) addChip(track, it.label, it.prompt, it.preview);
    }
  }

  // ---------- Pause/Resume ----------
  function pauseTicker(){ track?.classList.add('paused'); }
  function resumeTicker(){ track?.classList.remove('paused'); }

  // ---------- Init ----------
  function init(){
    mount(); if(!track) return;
    build(); updateBottom(); updateSafeZone(); updateZ();
    // Sofort loslaufen: ein negativer Delay sorgt dafür, dass der Track schon „am Laufen“ ist
    // und resumeTicker startet die Animation direkt
    setDuration();
    resumeTicker();

    // Reagieren auf Layout/Antwort
    window.addEventListener('resize', ()=>{ updateBottom(); updateSafeZone(); topUp(); setDuration(); updateZ(); }, {passive:true});
    window.addEventListener('chat:send', ()=>{ ensureOneAnswerOnly(); pauseTicker(); updateBottom(); updateZ(); });
    window.addEventListener('chat:done', ()=>{ ensureOneAnswerOnly(); resumeTicker(); updateBottom(); updateZ(); });

    // Wenn Spotlight/Antwort dynamisch wechselt
    const mo = new MutationObserver(()=>{ ensureOneAnswerOnly(); updateBottom(); updateZ(); });
    mo.observe(document.body, { childList:true, subtree:true });

    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) resumeTicker(); });
    setInterval(()=>resumeTicker(), 30000);
  }

  (document.readyState==='loading')
    ? document.addEventListener('DOMContentLoaded', init, {once:true})
    : init();

  // Expose
  window.Ticker = { pause: pauseTicker, resume: resumeTicker, rebuild: ()=>{ build(); setDuration(); updateBottom(); updateZ(); } };
})();
