/*! ticker.js — "Aktuell"-Laufband: Klick sendet direkt an GPT; unterstützt {label,prompt} */
(function(){
  const items = (window.__TICKER_ITEMS && window.__TICKER_ITEMS.length) ? window.__TICKER_ITEMS : [
    {label:"Über mich",   prompt:"Kurzer Überblick über Wolf Hohl (TÜV‑zertifizierter KI‑Manager): Profil, Fokus, Angebot in 5 Sätzen."},
    {label:"Projekte",    prompt:"Gib mir 3 Projekt‑Highlights von Wolf Hohl (Ziel, Umsetzung, Ergebnis) prägnant."},
    {label:"Kontakt",     prompt:"Ich möchte Kontakt aufnehmen. Welche Möglichkeiten habe ich (E‑Mail, LinkedIn)? Bitte kurz & präzise."},
    "Sind wir fit für den EU AI Act?",
    "Dürfen wir interne Daten mit GPT nutzen?",
    "Wie starte ich ein KI‑Pilotprojekt unter DSGVO?",
    "Welche Fördermittel passen zu KMU‑KI?"
  ];

  const style = document.createElement('style');
  style.textContent = `
  .ticker-wrap{ position:fixed; left:24px; right:24px; bottom:140px; height:44px; z-index:38; pointer-events:none; }
  @media (max-width: 880px){ .ticker-wrap{ height:38px; left:16px; right:16px; } }
  .ticker{ position:relative; width:100%; height:100%; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black calc(100% - var(--fade-right, 28vw)), transparent);
            mask-image: linear-gradient(90deg, transparent, black 6%, black calc(100% - var(--fade-right, 28vw)), transparent);
  }
  .ticker-track{ position:absolute; white-space:nowrap; will-change:transform; animation:ticker-move 60s linear infinite; }
  .ticker a{ pointer-events:auto; display:inline-inline; display:inline-block; margin:0 28px; padding:8px 12px;
    border-radius:999px; background:rgba(20,28,36,0.42); border:1px solid rgba(255,255,255,0.16);
    backdrop-filter: blur(8px); color:#f1f6ff; text-decoration:none; font: 600 15px/1.1 ui-sans-serif,system-ui; letter-spacing:.1px; }
  .ticker a:hover{ background:rgba(32,40,52,0.52); border-color: rgba(255,255,255,0.22); }
  @media (max-width: 880px){
    .ticker a{ margin:0 18px; padding:6px 10px; font:600 14px/1.1 ui-sans-serif,system-ui; }
  }
  @media (prefers-reduced-motion: reduce){ .ticker-track{ animation: none; } }
  .ticker-track.paused{ animation-play-state: paused; }
  @keyframes ticker-move{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div'); wrap.className='ticker-wrap'; wrap.setAttribute('aria-label','Aktuell');
  const inner = document.createElement('div'); inner.className='ticker';
  const track = document.createElement('div'); track.className='ticker-track';

  function renderChunk(){
    const frag = document.createDocumentFragment();
    items.forEach(item=>{
      const label = (typeof item==='string') ? item : (item.label || item.prompt || 'Frage');
      const prompt = (typeof item==='string') ? item : (item.prompt || item.label);
      const a=document.createElement('a'); a.href='#'; a.textContent=label;
      a.addEventListener('click', (ev)=>{ ev.preventDefault(); sendNow(prompt); });
      frag.appendChild(a);
    });
    return frag;
  }
  track.appendChild(renderChunk());
  track.appendChild(renderChunk());
  inner.appendChild(track); wrap.appendChild(inner);
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.appendChild(wrap);
    setTimeout(applyLayout, 0);
  });

  function pauseTicker(){ track.classList.add('paused'); }
  function resumeTicker(){ track.classList.remove('paused'); }
  window.addEventListener('chat:send', pauseTicker);
  window.addEventListener('chat:done', resumeTicker);
  

  function locateChat(){
    const sels = ['.chatbox', '#chat-dock', '.chat-dock', '[data-chat-dock]', '.chatbox-dock'];
    for(const s of sels){ const el = document.querySelector(s); if(el) return el; }
    return null;
  }
  function applyLayout(){
    const chat = locateChat();
    const th = wrap.offsetHeight || 44;
    if(chat){
      const r = chat.getBoundingClientRect();
      const centerY = r.top + r.height/2;
      const bottomPx = Math.max(12, window.innerHeight - centerY - th/2);
      wrap.style.bottom = bottomPx.toFixed(0) + 'px';
      const fadeRight = Math.max(40, (window.innerWidth - r.left) + 16);
      wrap.style.setProperty('--fade-right', fadeRight.toFixed(0) + 'px');
    }else{
      wrap.style.bottom = '140px';
      wrap.style.setProperty('--fade-right', '28vw');
    }
  }
  window.addEventListener('resize', ()=> requestAnimationFrame(applyLayout), {passive:true});
  window.addEventListener('scroll', ()=> requestAnimationFrame(applyLayout), {passive:true});
  window.addEventListener('orientationchange', ()=> setTimeout(applyLayout, 100));
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(()=>applyLayout()) : null;
  document.addEventListener('DOMContentLoaded', ()=>{ const chat=locateChat(); if(ro && chat) ro.observe(chat); });

  function sendNow(text){
    // Pause ticker immediately
    try{ track.classList.add('paused'); }catch{}
    // Prefer direct programmatic send
    try{ if(window.ChatDock && ChatDock.send){ ChatDock.send(text); return; } }catch{}
    // Fallback: fill input + fire Enter
    const root = document; const input = root.querySelector('#chat-input, .chat-dock input, [data-chat-input]');
    if(input){ input.focus(); input.value = text;
      const kd = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
      const ku = new KeyboardEvent('keyup',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
      input.dispatchEvent(kd); input.dispatchEvent(ku); return;
    }
    // last fallback: click any visible "Senden"-Button
    let btn = root.querySelector('#chat-send, [data-send], button.send, button:has([data-icon="send"])');
    if(!btn){ btn = Array.from(root.querySelectorAll('button')).find(b=>/senden|send/i.test(b.textContent||'')); }
    if(btn){ btn.click(); return; }
    try{ navigator.clipboard && navigator.clipboard.writeText(text); }catch{}
  } }catch{}
    try{
      if(window.ChatDock && typeof ChatDock.send === 'function'){ ChatDock.send(text); return; }
      if(window.ChatDock && ChatDock.postMessage){ ChatDock.postMessage(text); return; }
    }catch{}
    const selectors = ['textarea[data-chat-input]','#chat-input','textarea[name="chat"]','.chatbox textarea','.chat-input textarea','textarea'];
    let input=null; for(const sel of selectors){ const cand=document.querySelector(sel); if(cand){ input=cand; break; } }
    if(input){
      try{
        input.focus(); input.value=text; input.dispatchEvent(new Event('input',{bubbles:true}));
        let root = input.closest('form') || input.closest('.chatbox') || document;
        let btn = root.querySelector('[type="submit"], [data-send], button.send, button:has([data-icon="send"])');
        if(!btn){ btn = Array.from(root.querySelectorAll('button')).find(b=>/senden|send/i.test(b.textContent||'')); }
        if(btn){ btn.click(); return; }
        const kd = new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
        const ku = new KeyboardEvent('keyup',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true});
        input.dispatchEvent(kd); input.dispatchEvent(ku); return;
      }catch{}
    }
    try{ navigator.clipboard && navigator.clipboard.writeText(text); }catch{}
  }
})();
// mobile tweaks
;(function(){
  const css = `@media (max-width:520px){
    .ticker-wrap{ left:12px; right:12px; bottom:10px; }
    .ticker a{ font-size:13px; padding:8px 10px; }
  }`;
  const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
})();
