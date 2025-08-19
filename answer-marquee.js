/*! answer-marquee.js — GPT-Kurzantwort als ruhiger Lauftext + „Prompt des Tages“ im Idle */
(function(){
  const css = `
  .answer-marquee-wrap{ position:fixed; left:24px; right:24px; z-index:40; pointer-events:auto; }
  .answer-marquee{ position:relative; width:100%; overflow:hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%);
    font:600 16px/1.2 ui-sans-serif,system-ui; color:#eaf2ff; }
  .answer-track{ position:absolute; white-space:nowrap; will-change:transform; animation:ans-move 24s linear infinite; }
  .answer-track.paused{ animation-play-state: paused; }
  .answer-badge{ display:inline-block; margin-right:10px; padding:4px 8px; border-radius:999px;
    background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18); font:700 12px/1 ui-sans-serif; letter-spacing:.2px;}
  @keyframes ans-move{ from{ transform:translateX(100%);} to{ transform:translateX(-120%);} }
  @media (max-width:880px){ .answer-marquee-wrap{ left:12px; right:12px; } .answer-marquee{ font-size:14px; } }
  @media (max-width:520px){ .answer-marquee{ font-size:13px; } }
  @media (prefers-reduced-motion: reduce){ .answer-track{ animation:none; } }
  .toast{ position:fixed; left:50%; transform:translateX(-50%); bottom:22vh; z-index:50; background:rgba(20,28,36,.88);
    color:#eaf2ff; border:1px solid rgba(255,255,255,.18); padding:8px 10px; border-radius:10px; font:700 12px/1 ui-sans-serif; opacity:0; transition:opacity .25s ease; }
  .toast.show{ opacity:1; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const wrap = document.createElement('div'); wrap.className='answer-marquee-wrap';
  const inner = document.createElement('div'); inner.className='answer-marquee'; wrap.appendChild(inner);
  const track = document.createElement('div'); track.className='answer-track'; inner.appendChild(track);
  const badge = document.createElement('span'); badge.className='answer-badge'; badge.textContent='Antwort';
  track.appendChild(badge);
  const span = document.createElement('span'); track.appendChild(span);
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(wrap));

  function updateBottom(){
    const ticker = document.querySelector('.ticker-wrap');
    let bottomPx = 168; // default
    if(ticker){
      const cs = getComputedStyle(ticker);
      const b = parseFloat(cs.bottom||'140') || 140;
      bottomPx = b + 28; // 24–28px über den Fragechips
    }
    wrap.style.bottom = bottomPx+'px';
  }
  window.addEventListener('resize', ()=> requestAnimationFrame(updateBottom), {passive:true});
  document.addEventListener('DOMContentLoaded', updateBottom);
  setTimeout(updateBottom, 300);

  function setText(txt){
    const clean = (txt||'').replace(/\s+/g,' ').trim();
    let short = clean;
    const dotIx = clean.indexOf('. ');
    if(dotIx>70 && dotIx<140){ short = clean.slice(0, dotIx+1); }
    if(short.length>120){ short = short.slice(0, 118)+'…'; }
    span.textContent = short || 'Wolf Hohl · TÜV‑zertifizierter KI‑Manager · wolf@hohl.rocks · LinkedIn · Antwort i. d. R. < 24 h';
  }

  // Spotlight öffnen bei Klick
  inner.addEventListener('click', ()=>{
    try{ if(window.ChatDock && (ChatDock.open||ChatDock.focus)){ (ChatDock.open||ChatDock.focus).call(ChatDock);} }catch{}
  });
  inner.addEventListener('mouseenter', ()=> track.classList.add('paused'));
  inner.addEventListener('mouseleave', ()=> track.classList.remove('paused'));

  // Fallback-Visitenkarte
  function setCard(){
    badge.textContent='Wolf';
    setText('Wolf Hohl · TÜV‑zertifizierter KI‑Manager · wolf@hohl.rocks · LinkedIn · Antwort i. d. R. < 24 h');
  }
  setCard();

  // „Prompt des Tages“ – Idle Rotation
  const dailyPrompts = [
    'Formuliere meine KI‑Roadmap in 5 Punkten.',
    'Welche EU‑AI‑Act‑Pflichten treffen auf uns?',
    'Mach aus diesem Text 3 starke LinkedIn‑Hooks.',
    'Gib mir 5 DSGVO‑Guardrails für GPT‑Prompts.',
    'Baue ein 14‑Tage‑Pilotprojekt mit klarer Metrik.',
    'Schätze den ROI eines Marketing‑Pilotprojekts.',
  ];
  let idleTimer=null, idleIx=0, inIdle=false;
  function showDaily(){
    inIdle=true; badge.textContent='Prompt des Tages';
    const p = dailyPrompts[idleIx++ % dailyPrompts.length];
    span.textContent = p + ' (Klicken = kopieren)';
  }
  function startIdleTimer(){
    if(idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(showDaily, 75000); // 75s Stille
  }
  function stopIdle(){
    inIdle=false; if(idleTimer) clearTimeout(idleTimer); idleTimer=null; badge.textContent='Antwort';
  }
  startIdleTimer();

  // Copy on click im Idle
  inner.addEventListener('click', (ev)=>{
    if(!inIdle) return;
    ev.preventDefault();
    try{
      const text = span.textContent.replace(/\s+\(Klicken = kopieren\)$/,'');
      navigator.clipboard && navigator.clipboard.writeText(text);
      toast('Kopiert');
    }catch{}
  });

  // Events aus dem Chat
  let acc='';
  window.addEventListener('chat:send', ()=>{ acc=''; stopIdle(); setText('…'); try{ window.HarleyLite && HarleyLite.blip && HarleyLite.blip(); }catch{} });
  window.addEventListener('chat:delta', (ev)=>{ acc += (ev.detail && ev.detail.delta) ? ev.detail.delta : ''; setText(acc); });
  window.addEventListener('chat:done', ()=>{ if(!acc) setCard(); startIdleTimer(); });

  // Mini-Gasstoß bei Bubble‑Klick (best effort)
  document.addEventListener('click', (ev)=>{
    const hit = ev.target.closest && (ev.target.closest('.bubble,.shape,.shp,.hero-shapes,canvas,svg'));
    if(hit){ try{ window.HarleyLite && HarleyLite.blip && HarleyLite.blip(); }catch{} }
  }, {capture:true});

  // kleine Toast-Funktion
  function toast(msg){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
    document.body.appendChild(t); requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 280); }, 900);
  }
})();