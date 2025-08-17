
/*! answers-overlay.js — Variant C: Antworten streamen in einer Bubble */
(function(){
  const css = `
  .answer-overlay{ position:absolute; inset:6%; display:flex; align-items:center; justify-content:center;
    border-radius:24px; padding:16px 18px; background: radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,0.14), rgba(10,14,20,0.16));
    box-shadow: inset 0 0 1px rgba(255,255,255,0.25), 0 12px 36px rgba(0,0,0,0.35);
    color:#eaf2ff; font: 600 15px/1.35 ui-sans-serif,system-ui; text-shadow: 0 1px 1px rgba(0,0,0,.35);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity:0; transform: scale(0.98); transition: opacity .45s ease, transform .45s ease;
    pointer-events:none; } /* nicht klickblockend */
  .answer-overlay.show{ opacity:1; transform: scale(1); }
  .answer-overlay .inner{ max-width: 88%; max-height: 74%; overflow:hidden; }
  .answer-overlay .snippet{ display:block; white-space:pre-wrap; word-wrap:break-word; overflow:hidden; }
  .answer-overlay .cta{ margin-top:10px; display:inline-block; padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); font:600 12px/1 ui-sans-serif; }
  @media (max-width:880px){
    .answer-overlay{ inset:8%; border-radius:18px; font-weight:600; font-size:14px; }
  }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  let currentEl=null, hideTimer=null, accText='';

  function pickBubble(){
    const nodes = Array.from(document.querySelectorAll('#shapes .shape'));
    if(!nodes.length) return null;
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    let best=null, score=-1;
    for(const n of nodes){
      const r = n.getBoundingClientRect();
      if(r.width<80 || r.height<80) continue;
      const area = r.width*r.height;
      const dx = (r.left + r.width/2) - cx;
      const dy = (r.top + r.height/2) - cy;
      const dist = Math.sqrt(dx*dx + dy*dy) + 1;
      const s = area / dist;
      if(s>score){ score=s; best=n; }
    }
    return best || nodes[0];
  }

  function ensureOverlay(host){
    if(currentEl && currentEl.parentElement!==host){
      currentEl.remove(); currentEl=null;
    }
    if(!currentEl){
      currentEl = document.createElement('div'); currentEl.className='answer-overlay';
      const inner = document.createElement('div'); inner.className='inner';
      const snippet = document.createElement('span'); snippet.className='snippet';
      const cta = document.createElement('span'); cta.className='cta'; cta.textContent='Weiter im Chat ⟶';
      inner.appendChild(snippet); inner.appendChild(cta); currentEl.appendChild(inner);
      currentEl.addEventListener('click', ()=>{
        try{ if(window.ChatDock && (ChatDock.open||ChatDock.focus)){ (ChatDock.open||ChatDock.focus).call(ChatDock); } }catch{}
      });
      host.appendChild(currentEl);
      requestAnimationFrame(()=> currentEl.classList.add('show'));
    }
    return currentEl;
  }

  function showSnippet(text){
    if(!currentEl) return;
    const el = currentEl.querySelector('.snippet');
    el.textContent = text.trim();
  }

  function scheduleHide(ms){
    if(hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(()=>{
      if(currentEl){
        currentEl.classList.remove('show');
        setTimeout(()=>{ currentEl && currentEl.remove(); currentEl=null; }, 400);
      }
    }, ms);
  }

  window.addEventListener('chat:send', ()=>{
    try{
      accText='';
      const host = pickBubble();
      if(host){ ensureOverlay(host); showSnippet('…'); scheduleHide(15000); }
    }catch{}
  });
  window.addEventListener('chat:delta', (ev)=>{
    try{
      accText += (ev.detail && ev.detail.delta) ? ev.detail.delta : '';
      const text = accText.length>380 ? accText.slice(0,360)+' …' : accText;
      showSnippet(text);
      scheduleHide(15000);
    }catch{}
  });
  window.addEventListener('chat:done', ()=>{
    scheduleHide(12000);
  });
})();
