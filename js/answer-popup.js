/* answer-popup.js — transparentes Antwort-Popup */
(function(){
  'use strict';
  let pop, body, closeBtn, acc='';
  function ensure(){
    if(pop) return pop;
    pop = document.createElement('div');
    pop.style.position='fixed'; pop.style.inset='0';
    pop.style.background='rgba(12,16,22,0.40)';
    pop.style.backdropFilter='blur(6px)';
    pop.style.zIndex='1400'; pop.style.display='none';
    const card=document.createElement('div');
    card.style.position='absolute'; card.style.left='50%'; card.style.top='15%';
    card.style.transform='translateX(-50%)';
    card.style.width='min(720px,90vw)';
    card.style.background='rgba(18,24,32,0.82)';
    card.style.border='1px solid rgba(255,255,255,.14)';
    card.style.borderRadius='18px';
    card.style.color='#eaf2ff';
    card.style.padding='16px';
    body=document.createElement('div'); body.style.whiteSpace='pre-wrap'; body.style.maxHeight='60vh'; body.style.overflow='auto';
    closeBtn=document.createElement('button'); closeBtn.textContent='Schließen'; closeBtn.style.marginTop='12px';
    closeBtn.style.borderRadius='999px'; closeBtn.style.padding='8px 12px'; closeBtn.style.border='1px solid rgba(255,255,255,.18)';
    closeBtn.onclick=()=>{ pop.style.display='none'; };
    card.appendChild(body); card.appendChild(closeBtn); pop.appendChild(card); document.body.appendChild(pop);
    return pop;
  }
  window.addEventListener('chat:send', ()=>{ acc=''; ensure().style.display='block'; body.textContent='…'; });
  window.addEventListener('chat:delta', (ev)=>{ acc += (ev.detail && ev.detail.delta) ? ev.detail.delta : ''; body.textContent = acc; });
  window.addEventListener('chat:done', ()=>{});
})();