/*! ticker.stable.js — visible, slow, seamless ticker (no optional chaining) */
(function () {
  'use strict';

  // ---------- Styles (kept minimal) ----------
  var css = ""
    + ".ticker-wrap{position:fixed;left:24px;right:24px;z-index:1200;pointer-events:auto}"
    + ".ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);pointer-events:none;"
    + "  -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);"
    + "          mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}"
    + ".ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;"
    + "  animation:ticker-move var(--dur,140s) linear infinite;transform:translateZ(0)}"
    + ".ticker-track.paused{animation-play-state:paused}"
    + ".ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;"
    + "  color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}"
    + ".ticker a:hover{filter:brightness(1.08)}"
    + "@keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}"
    + "@media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}";
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM refs ----------
  var wrap, inner, track, baseItems = [];

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function mount() {
    wrap = $('.ticker-wrap');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.className = 'ticker-wrap';
      inner = document.createElement('div'); inner.className = 'ticker';
      track = document.createElement('div'); track.className = 'ticker-track';
      inner.appendChild(track); wrap.appendChild(inner); document.body.appendChild(wrap);
    } else {
      inner = $('.ticker', wrap) || inner;
      track = $('.ticker-track', wrap) || track;
      if (!track) { inner = document.createElement('div'); inner.className='ticker'; track=document.createElement('div'); track.className='ticker-track'; inner.appendChild(track); wrap.appendChild(inner); }
    }
  }

  // ---------- Content ----------
  function getItems(){
    if (window.__TICKER_ITEMS && window.__TICKER_ITEMS.length) return window.__TICKER_ITEMS;
    return [
      { label:"Überrasch mich 🤯", prompt:"Zeig mir in 3 Sätzen einen überraschenden, sofort nutzbaren KI‑Trick für Solo‑Berater:innen. 1 Mini‑Beispiel + 1 nächster Schritt. Ton: smart, pointiert, keine Buzzwords." },
      { label:"Mini‑Story (5 Wörter)", prompt:"Erzeuge eine spannende Mini‑Story mit genau 5 Wörtern. Danach 1 kurzer Titel. Stil: smart, knapp, überraschend." },
      { label:"Haiku zur Fahrt", prompt:"Schreibe ein kurzes Haiku über eine nächtliche Highway‑Fahrt: Winterluft, Fernlicht, Weite. Ton: ruhig, präzise." }
    ];
  }

  function addChip(dst, label, prompt, preview){
    var a = document.createElement('a');
    a.href = '#'; a.textContent = label; if (preview) a.title = preview;
    a.addEventListener('click', function(ev){
      ev.preventDefault();
      pauseTicker();
      // nur Spotlight sichtbar halten
      ensureOneAnswerOnly();
      try { if (window.ChatDock && window.ChatDock.send) { window.ChatDock.send(prompt); return; } } catch(e){}
      var input = $('#chat-input'); var btn = $('#chat-send');
      if (input) {
        input.value = prompt;
        var evd = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
        input.dispatchEvent(evd);
      } else if (btn) { btn.click(); }
    });
    dst.appendChild(a);
  }

  function build(){
    track.innerHTML = '';
    baseItems = getItems().slice();
    for (var i=0;i<baseItems.length;i++){
      var it = baseItems[i];
      addChip(track, it.label, it.prompt, it.preview);
    }
    topUp();
    setDuration();
  }

  // ---------- Geometry helpers ----------
  function chatDockRect(){
    var c = $('.chat-dock'); if(!c) return null;
    var cs = window.getComputedStyle(c);
    if (cs.display==='none' || cs.visibility==='hidden') return null;
    var r = c.getBoundingClientRect();
    if ((r.width===0 && r.height===0)) return null;
    return r;
  }
  function answerEl(){ return $('.spotlight-card, .answer-overlay, .chat-answer, .chat-output, .answer-marquee'); }
  function answerRect(){ var el = answerEl(); return el ? el.getBoundingClientRect() : null; }

  function ensureOneAnswerOnly(){
    var all = $all('.spotlight-card, .answer-overlay, .answer-marquee');
    if (all.length > 1) {
      all.slice(0, -1).forEach(function(n){ n.remove(); });
    }
  }

  // ---------- Layout ----------
  function setDuration(){
    var vw = Math.max(320, window.innerWidth || 320);
    var px = track.scrollWidth + vw;
    var dur = Math.max(60, Math.min(260, px / 16));
    track.style.setProperty('--dur', dur.toFixed(1) + 's');
  }

  function topUp(){
    var vw = Math.max(320, window.innerWidth || 320);
    var guard = 20;
    while (track.scrollWidth < 3 * vw && guard-- > 0){
      for (var i=0;i<baseItems.length;i++){
        var it = baseItems[i];
        addChip(track, it.label, it.prompt, it.preview);
      }
    }
  }

  function updateBottom(){
    var chat = chatDockRect();
    var ans  = answerRect();
    var tickerH = (inner && inner.getBoundingClientRect ? inner.getBoundingClientRect().height : 48) || 48;

    var bottom = 76; // default
    if (chat){
      var candidate = (window.innerHeight - chat.top) + 12;
      if (candidate < 12) candidate = 12;
      if (candidate > 240) candidate = 240;
      if (candidate > bottom) bottom = candidate;
    }

    if (ans){
      var maxBottom = Math.max(12, window.innerHeight - ans.bottom - 12 - tickerH);
      if (bottom > maxBottom) bottom = maxBottom;
    }

    wrap.style.bottom = Math.max(12, bottom) + 'px';
  }

  function updateSafeZone(){
    var chat = chatDockRect();
    var safe = 340;
    if (chat) safe = Math.ceil(chat.width + 24);
    inner.style.setProperty('--safeR', safe + 'px');
  }

  function updateZ(){
    var ans = answerEl();
    var z = 1200;
    if (ans){
      var zi = parseInt((window.getComputedStyle(ans).zIndex || '1000'), 10);
      if (!isNaN(zi)) z = Math.min(zi - 5, 1600);
    }
    wrap.style.zIndex = String(z);
  }

  // ---------- State ----------
  function pauseTicker(){ if (track) track.classList.add('paused'); }
  function resumeTicker(){ if (track) track.classList.remove('paused'); }

  // ---------- Init ----------
  function init(){
    try{
      mount(); if(!track) return;
      build(); updateBottom(); updateSafeZone(); updateZ();
      // Startgefühl: neg. Delay fühlt sich "schon am Laufen" an
      track.style.animationDelay = '-8s';
      resumeTicker();

      window.addEventListener('resize', function(){ updateBottom(); updateSafeZone(); topUp(); setDuration(); updateZ(); }, {passive:true});
      window.addEventListener('chat:send', function(){ ensureOneAnswerOnly(); pauseTicker(); updateBottom(); updateZ(); });
      window.addEventListener('chat:done', function(){ ensureOneAnswerOnly(); resumeTicker(); updateBottom(); updateZ(); });

      var mo = new MutationObserver(function(){ ensureOneAnswerOnly(); updateBottom(); updateZ(); });
      mo.observe(document.body, { childList:true, subtree:true });

      document.addEventListener('visibilitychange', function(){ if(!document.hidden) resumeTicker(); });
      setInterval(function(){ resumeTicker(); }, 30000);
    }catch(e){ /* fail-soft */ }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

  // Expose
  window.Ticker = {
    pause: pauseTicker,
    resume: resumeTicker,
    rebuild: function(){ build(); setDuration(); updateBottom(); updateZ(); }
  };
})();