/*! ticker.js — stable, filtered, visible */
(function () {
  'use strict';
  const css = `
    .ticker-wrap{position:fixed;left:24px;right:24px;z-index:1200;pointer-events:auto}
    .ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);pointer-events:none;
      -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);
              mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}
    .ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;
      animation:ticker-move var(--dur,140s) linear infinite;transform:translateZ(0)}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

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
    let items;
    if (Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length) {
      items = window.__TICKER_ITEMS.slice();
    } else {
      items = [{label:"KI-Update", prompt:"Fasse die aktuelle KI-News-Lage kurz zusammen.", category:"news"}];
    }
    const cat = (typeof window.currentTickerCategory==='string' && window.currentTickerCategory.trim()) ? window.currentTickerCategory.trim() : null;
    if (cat){
      const filtered = items.filter(it => it.category===cat);
      if (filtered.length) items = filtered;
    }
    return items;
  }

  function addChip(dst, label, prompt, preview){
    const a = document.createElement('a');
    a.href = '#'; a.textContent = label; if (preview) a.title = preview;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      pauseTicker();
      try { if (window.fetchAnswer) { window.fetchAnswer(prompt); return; } } catch(e){}
      try { if (window.ChatDock && window.ChatDock.send) { window.ChatDock.send(prompt); return; } } catch(e){}
    });
    dst.appendChild(a);
  }

  function build(){
    track.innerHTML = '';
    baseItems = getItems();
    baseItems.forEach(it => addChip(track, it.label, it.prompt, it.preview));
    topUp();
    setDuration();
    // Pre‑Ticker‑Message jetzt ausblenden
    const pm = document.getElementById('pre-ticker-message');
    if (pm) setTimeout(()=> pm.style.display='none', 300);
  }

  const SPEED_PX_S = 16;
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

  function pauseTicker(){ if (track) track.classList.add('paused'); }
  function resumeTicker(){ if (track) track.classList.remove('paused'); }

  function init(){
    mount(); if(!track) return;
    build();
    setDuration();
    resumeTicker();
    window.addEventListener('resize', ()=>{ topUp(); setDuration(); }, {passive:true});
  }

  if (document.readyState==='loading')
    document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();

  window.Ticker = { pause: pauseTicker, resume: resumeTicker, rebuild: ()=>{ build(); setDuration(); } };
})();