/*! ticker.js — robust init, z-index über Shapes, Direct-Send */
(function(){
  'use strict';
  const css = `
  .ticker-wrap{ position:fixed; left:24px; right:24px; z-index:45; pointer-events:auto; }
  .ticker{ position:relative; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%); }
  .ticker-track{ position:absolute; display:inline-flex; gap:14px; white-space:nowrap;
    will-change: transform; animation: ticker-move var(--dur,40s) linear infinite; }
  .ticker-track.paused{ animation-play-state: paused; }
  .ticker a{ display:inline-block; padding:10px 16px; border-radius:999px; text-decoration:none;
    color:#eaf2ff; background:rgba(20,28,36,.64); border:1px solid rgba(255,255,255,.16); backdrop-filter: blur(6px); }
  .ticker a:hover{ filter:brightness(1.08); }
  @keyframes ticker-move{ from{ transform:translateX(100%);} to{ transform:translateX(-110%);} }
  @media (max-width:880px){ .ticker-wrap{ left:12px; right:12px; } .ticker a{ padding:8px 12px; } }
  `;
  const style=document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  let wrap, inner, track;

  function updateBottom(){
    const chat = document.querySelector('.chat-dock');
    let bottom = 104;
    if(chat){
      try{ bottom = (window.innerHeight - chat.getBoundingClientRect().top) + 20; }catch(e){}
    }
    wrap.style.bottom = Math.max(76, bottom) + 'px';
  }

  function autoDuration(){
    const w = track.scrollWidth, vw = Math.max(320, window.innerWidth);
    const screens = Math.max(1, w / vw);
    const dur = Math.max(26, Math.min(60, screens * 34));
    track.style.setProperty('--dur', dur.toFixed(1)+'s');
  }

  function pauseTicker(){ track && track.classList.add('paused'); }
  function resumeTicker(){ track && track.classList.remove('paused'); }

  function sendNow(text){
    try{ if(window.ChatDock && typeof ChatDock.send==='function'){ ChatDock.send(text); return; } }catch(_){}
    const input = document.querySelector('#chat-input'); const btn=document.querySelector('#chat-send');
    if(input){ input.focus(); input.value = text;
      const kd = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
      input.dispatchEvent(kd); return;
    }
    if(btn){ btn.click(); }
  }

  function init(){
    if (document.querySelector('.ticker-wrap')) return; // already mounted
    wrap = document.createElement('div'); wrap.className='ticker-wrap';
    inner = document.createElement('div'); inner.className='ticker';
    wrap.appendChild(inner);
    track = document.createElement('div'); track.className='ticker-track';
    inner.appendChild(track);
    document.body.appendChild(wrap);

    const items = Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length
      ? window.__TICKER_ITEMS
      : [{label:"Überrasch mich 🤯",prompt:"Zeig mir etwas Unerwartetes … in 3 Sätzen, mit kleinem Beispiel.",preview:"Kleine Demo, große Wirkung."}];

    function addChip(label, prompt, preview){
      const a = document.createElement('a'); a.href='#'; a.textContent = label;
      if (preview) a.title = preview;
      a.addEventListener('click', function(ev){
        ev.preventDefault();
        pauseTicker();
        try{ window.AnalyticsLite && AnalyticsLite.emit && AnalyticsLite.emit('ticker_click', { label }); }catch(_){}
        sendNow(prompt);
      });
      track.appendChild(a);
    }
    for(const it of items){ addChip(it.label, it.prompt, it.preview); }
    for(const it of items){ addChip(it.label, it.prompt, it.preview); }

    updateBottom(); autoDuration();
    window.addEventListener('resize', ()=>{ updateBottom(); autoDuration(); }, {passive:true});
    window.addEventListener('chat:send', pauseTicker);
    window.addEventListener('chat:done', resumeTicker);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.Ticker = { pause:()=>pauseTicker(), resume:()=>resumeTicker() };
})();
