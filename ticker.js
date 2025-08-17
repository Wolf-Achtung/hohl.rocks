/*! ticker.js — minimal "Aktuell"-Laufband mit Chat-Prefill */
(function(){
  const items = (window.__TICKER_ITEMS && window.__TICKER_ITEMS.length) ? window.__TICKER_ITEMS : [
    "Was macht ein TÜV‑zertifizierter KI‑Manager konkret?",
    "Sind wir fit für den EU AI Act?",
    "Dürfen wir interne Daten mit GPT nutzen?",
    "Wie starte ich ein KI‑Pilotprojekt unter DSGVO?",
    "Welche Fördermittel passen zu KMU‑KI?",
  ];
  const style = document.createElement('style');
  style.textContent = `
  .ticker-wrap{ position:fixed; bottom:4vh; left:0; width:100%; height:42px; pointer-events:auto; z-index: 2000; }
  @media (max-width: 800px){ .ticker-wrap{ bottom:2vh; height:38px; } }
  .ticker{ position:relative; width:100%; height:100%; overflow:hidden; -webkit-mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent); mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent); }
  .ticker-track{ position:absolute; white-space:nowrap; will-change:transform; animation:ticker-move 40s linear infinite; }
  .ticker a{ display:inline-block; margin:0 32px; padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.14); backdrop-filter: blur(6px); color:#f0f6ff; text-decoration:none; font: 500 14px/1.2 ui-sans-serif,system-ui; }
  .ticker a:hover{ background:rgba(255,255,255,0.22); }
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
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(wrap));

  function prefillChat(text){
    // Try common selectors
    const selectors = [
      'textarea[data-chat-input]',
      '#chat-input',
      'textarea[name="chat"]',
      '.chatbox textarea',
      '.chat-input textarea',
      'textarea',
      'input[type="text"]'
    ];
    let el=null;
    for(const sel of selectors){
      el = document.querySelector(sel);
      if(el){ break; }
    }
    if(el){
      try{
        el.focus();
        el.value = text;
        const evt = new Event('input',{bubbles:true});
        el.dispatchEvent(evt);
      }catch{}
    }else{
      try{ navigator.clipboard && navigator.clipboard.writeText(text); }catch{}
    }
    try{
      if(window.ChatDock && (ChatDock.open||ChatDock.focus)){
        (ChatDock.open||ChatDock.focus).call(ChatDock);
      }
    }catch{}
  }
})();
