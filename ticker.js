
/*! ticker.js — "Aktuell"-Laufband: auf Höhe des Chat-Eingabefelds, rechts weich ausblenden */
(function(){
  const items = (window.__TICKER_ITEMS && window.__TICKER_ITEMS.length) ? window.__TICKER_ITEMS : [
    "Sind wir fit für den EU AI Act?",
    "Dürfen wir interne Daten mit GPT nutzen?",
    "Wie starte ich ein KI‑Pilotprojekt unter DSGVO?",
    "Welche Fördermittel passen zu KMU‑KI?",
    "Was macht ein TÜV‑zertifizierter KI‑Manager konkret?",
  ];

  const style = document.createElement('style');
  style.textContent = `
  .ticker-wrap{ position:fixed; left:24px; right:24px; bottom:140px; height:44px; z-index:38;
    pointer-events:none; }
  @media (max-width: 880px){ .ticker-wrap{ height:38px; left:16px; right:16px; } }
  .ticker{ position:relative; width:100%; height:100%; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black calc(100% - var(--fade-right, 28vw)), transparent);
            mask-image: linear-gradient(90deg, transparent, black 6%, black calc(100% - var(--fade-right, 28vw)), transparent);
  }
  .ticker-track{ position:absolute; white-space:nowrap; will-change:transform; animation:ticker-move 60s linear infinite; }
  .ticker a{ pointer-events:auto; display:inline-block; margin:0 28px; padding:8px 12px; border-radius:999px;
    background:rgba(20,28,36,0.42); border:1px solid rgba(255,255,255,0.16); backdrop-filter: blur(8px);
    color:#f1f6ff; text-decoration:none; font: 600 15px/1.1 ui-sans-serif,system-ui; letter-spacing:.1px; }
  .ticker a:hover{ background:rgba(32,40,52,0.52); border-color: rgba(255,255,255,0.22); }
  @media (max-width: 880px){
    .ticker a{ margin:0 18px; padding:6px 10px; font:600 14px/1.1 ui-sans-serif,system-ui; }
  }
  @media (prefers-reduced-motion: reduce){ .ticker-track{ animation: none; } }
  @keyframes ticker-move{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div'); wrap.className='ticker-wrap'; wrap.setAttribute('aria-label','Aktuell');
  const inner = document.createElement('div'); inner.className='ticker';
  const track = document.createElement('div'); track.className='ticker-track';

  function renderChunk(){
    const frag = document.createDocumentFragment();
    items.forEach(q=>{
      const a=document.createElement('a'); a.href='#'; a.textContent=q;
      a.addEventListener('click', (ev)=>{ ev.preventDefault(); prefillChat(q); });
      frag.appendChild(a);
    });
    return frag;
  }
  track.appendChild(renderChunk());
  track.appendChild(renderChunk()); // duplicate for seamless loop
  inner.appendChild(track); wrap.appendChild(inner);
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.appendChild(wrap);
    // Layout nach Einfügen berechnen
    setTimeout(applyLayout, 0);
  });

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
      // Vertikal: Ticker mittig auf Höhe des Chat-Eingabefelds
      const centerY = r.top + r.height/2;
      const bottomPx = Math.max(12, window.innerHeight - centerY - th/2);
      wrap.style.bottom = bottomPx.toFixed(0) + 'px';
      // Rechts weich ausblenden, bevor der Chat beginnt
      const fadeRight = Math.max(40, (window.innerWidth - r.left) + 16); // Chatbreite + Sicherheitsrand
      wrap.style.setProperty('--fade-right', fadeRight.toFixed(0) + 'px');
    }else{
      // Fallback
      wrap.style.bottom = '140px';
      wrap.style.setProperty('--fade-right', '28vw');
    }
  }

  function prefillChat(text){
    const selectors = [
      'textarea[data-chat-input]','#chat-input','textarea[name="chat"]','.chatbox textarea','.chat-input textarea','textarea','input[type="text"]'
    ];
    let el=null;
    for(const sel of selectors){ el = document.querySelector(sel); if(el) break; }
    if(el){
      try{ el.focus(); el.value = text; el.dispatchEvent(new Event('input',{bubbles:true})); }catch{}
    }else{
      try{ navigator.clipboard && navigator.clipboard.writeText(text); }catch{}
    }
    try{ if(window.ChatDock && (ChatDock.open||ChatDock.focus)){ (ChatDock.open||ChatDock.focus).call(ChatDock); } }catch{}
  }

  // Re-Layout bei Resize/Scroll/Orientation und wenn die Chatbox sich ändert
  window.addEventListener('resize', ()=> requestAnimationFrame(applyLayout), {passive:true});
  window.addEventListener('scroll', ()=> requestAnimationFrame(applyLayout), {passive:true});
  window.addEventListener('orientationchange', ()=> setTimeout(applyLayout, 100));
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(()=>applyLayout()) : null;
  document.addEventListener('DOMContentLoaded', ()=>{
    const chat = locateChat();
    if(ro && chat) ro.observe(chat);
  });
})();
