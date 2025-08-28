/*! answers-spotlight.js — Variante A: Spotlight Card links neben dem Chat */
(function(){
  if(window.__ANSWER_MODE!=='spotlight'){ return; }
  const css = `
  .spotlight-card{ position: fixed; left: 24px; bottom: 15vh; width: min(520px, 44vw); z-index: 41;
    background: rgba(20, 28, 36, 0.72); border: 1px solid rgba(255,255,255,0.16); border-radius: 18px;
    box-shadow: 0 18px 60px rgba(0,0,0,0.35); color: #EAF2FF; backdrop-filter: blur(12px); padding: 14px; opacity: 0;
    transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
  .spotlight-card.show{ opacity: 1; transform: translateY(0); }
  .spot-title{ font: 700 14px/1.2 ui-sans-serif,system-ui; margin: 0 0 6px 0; opacity: .95; }
  .spot-body{ font: 600 15px/1.35 ui-sans-serif,system-ui; white-space: pre-wrap; max-height: 38vh; overflow:auto; }
  .spot-row{ display:flex; gap:8px; justify-content: flex-end; margin-top: 8px; }
  .spot-btn{ border-radius: 999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18); color:#f1f6ff; padding:6px 10px; font:600 12px/1 ui-sans-serif; }
  .spot-btn:hover{ background: rgba(255,255,255,.18); }
  @media (max-width: 880px){ .spotlight-card{ left: 16px; width: 86vw; bottom: calc(16vh + 80px); } }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  let card=null, acc=''; let hideTimer=null;

  function ensureCard(){
    if(!card){
      card = document.createElement('div'); card.className='spotlight-card';
      const h = document.createElement('div'); h.className='spot-title'; h.textContent='Antwort';
      const b = document.createElement('div'); b.className='spot-body'; b.textContent='…';
      const row = document.createElement('div'); row.className='spot-row';
      const open = document.createElement('button'); open.className='spot-btn'; open.textContent='Weiter im Chat ⟶';
      open.addEventListener('click', ()=>{ try{ if(window.ChatDock && (ChatDock.open||ChatDock.focus)){ (ChatDock.open||ChatDock.focus).call(ChatDock); } }catch{}; });
      const close = document.createElement('button'); close.className='spot-btn'; close.textContent='Schließen';
      close.addEventListener('click', ()=>{ if(card){ card.classList.remove('show'); setTimeout(()=>card && card.remove(), 300); card=null; } });
      row.appendChild(close); row.appendChild(open);
      card.appendChild(h); card.appendChild(b); card.appendChild(row);
      document.body.appendChild(card);
      requestAnimationFrame(()=> card.classList.add('show'));
    }
    return card;
  }

  function scheduleHide(ms){
    if(hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(()=>{
      if(card){ card.classList.remove('show'); setTimeout(()=>{ card && card.remove(); card=null; }, 350); }
    }, ms);
  }

  window.addEventListener('chat:send', ()=>{
    acc=''; ensureCard(); scheduleHide(15000);
  });
  window.addEventListener('chat:delta', (ev)=>{
    const d = (ev.detail && ev.detail.delta) ? ev.detail.delta : '';
    acc += d;
    ensureCard().querySelector('.spot-body').textContent = (acc.length>540? acc.slice(0,520)+' …' : acc);
    scheduleHide(15000);
  });
  window.addEventListener('chat:done', ()=> scheduleHide(12000));
})();