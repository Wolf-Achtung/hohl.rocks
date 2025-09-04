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
      animation:ticker-move var(--dur,140s) linear infinite;transform:translateZ(0);animation-delay:-8s;}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}

    /* Ask bar container inside ticker */
    .ticker-ask{position:absolute;right:0;top:0;height:100%;display:flex;align-items:center;gap:4px;padding-left:8px;pointer-events:auto}
    .ticker-ask input{height:28px;padding:4px 8px;border-radius:20px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.4);color:#eaf2ff;font-size:14px;outline:none}
    .ticker-ask button{height:28px;padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.35);background:rgba(58,76,102,.6);color:#eaf2ff;font-size:14px;cursor:pointer}
    .ticker-ask button:hover{filter:brightness(1.1)}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  
    @media (max-width: 390px){
      .ticker-wrap{left:12px;right:12px}
      .ticker{height:38px}
      .ticker-track{gap:10px}
      .ticker a{padding:8px 12px;font-size:13px}
    }
`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM ----------
  let wrap, inner, track, baseItems = [];
  // Elements for free-form question bar
  let askWrap, askInput, askButton;

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

    // Create ask bar for free-form questions
    askWrap = wrap.querySelector('.ticker-ask');
    if (!askWrap) {
      askWrap = document.createElement('div');
      askWrap.className = 'ticker-ask';
      askInput = document.createElement('input');
      askInput.type = 'text';
      askInput.placeholder = 'Frage stellen… (KI, EU)';
      askButton = document.createElement('button');
      askButton.type = 'button';
      askButton.textContent = 'Senden';
      askWrap.appendChild(askInput);
      askWrap.appendChild(askButton);
      wrap.appendChild(askWrap);
      // Helper to send prompt
      const sendPrompt = (msg) => {
        if (!msg) return;
        pauseTicker();
        ensureOneAnswerOnly();
        try {
          if (window.ChatDock?.send) {
            ChatDock.send(msg);
            return;
          }
        } catch (_) {}
        // fallback: fill chat input and trigger enter or send button
        const inputEl = document.querySelector('#chat-input');
        const btnEl = document.querySelector('#chat-send');
        if (inputEl) {
          inputEl.value = msg;
          inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true }));
        } else {
          btnEl?.click();
        }
      };
      askButton.addEventListener('click', () => {
        const val = (askInput.value || '').trim();
        if (val) {
          sendPrompt(val);
          askInput.value = '';
        }
      });
      askInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          const val = (askInput.value || '').trim();
          if (val) {
            sendPrompt(val);
            askInput.value = '';
          }
          ev.preventDefault();
        }
      });
    } else {
      askInput = askWrap.querySelector('input');
      askButton = askWrap.querySelector('button');
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
    // Start ticker immediately by applying negative animation delay
    if (track) track.style.animationDelay = '-8s';
  }

  // ---------- Hilfen ----------
  function chatDockRect(){ const c = document.querySelector('.chat-dock'); return c ? c.getBoundingClientRect() : null; }
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

    // Standard: oberhalb der Chat-Box
    let bottom = 76;
    if (chat) bottom = Math.max(bottom, (window.innerHeight - chat.top) + 12);

    // Wenn eine Antwort-Card da ist: Ticker UNTER die Card (also näher zum unteren Rand),
    // so dass die Oberkante des Tickers MINDESTENS 12px unter der Card liegt.
    if (ans){
      const maxBottom = Math.max(12, window.innerHeight - ans.bottom - 12 - tickerH);
      bottom = Math.min(bottom, maxBottom);
    }

    wrap.style.bottom = Math.max(12, bottom) + 'px';
  }

  // Rechts Freiraum für die Chat-Box (Safe-Zone)
  function updateSafeZone(){
    const chat = chatDockRect();
    let safe = 340;
    // Use width of ask bar if present
    if (askWrap) {
      const rect = askWrap.getBoundingClientRect();
      safe = Math.max(safe, Math.ceil(rect.width + 24));
    }
    // Also consider chat dock width if chat-dock is visible
    if (chat) {
      safe = Math.max(safe, Math.ceil(chat.width + 24));
    }
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
