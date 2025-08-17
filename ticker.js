
/*! ticker.js — "Aktuell"-Laufband mit Chat-Prefill (safe over chat) */
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
    pointer-events:none; } /* unter Chat (41/40), klickbar nur auf Links */
  @media (max-width: 880px){ .ticker-wrap{ bottom:120px; height:38px; left:16px; right:16px; } }
  .ticker{ position:relative; width:100%; height:100%; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
    mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
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
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(wrap));

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
})();
