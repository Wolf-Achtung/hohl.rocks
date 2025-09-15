/* answer-popup.js — Popup mit Copy- & Try-it-Button */
(function(){
  'use strict'; let textAcc='';
  function ensure(){
    let pop=document.getElementById('answer-popup');
    if(pop) return pop;
    pop=document.createElement('div'); pop.id='answer-popup';
    pop.style.position='fixed'; pop.style.left='50%'; pop.style.top='15%'; pop.style.transform='translateX(-50%)';
    pop.style.width='min(760px,92vw)'; pop.style.maxHeight='70vh';
    pop.style.background='rgba(12,16,22,.40)'; pop.style.border='1px solid rgba(255,255,255,.14)';
    pop.style.backdropFilter='blur(12px)'; pop.style.borderRadius='18px'; pop.style.padding='16px'; pop.style.zIndex='1400'; pop.style.color='#eaf2ff'; pop.style.display='none';
    const content=document.createElement('div'); content.className='popup-content'; content.style.whiteSpace='pre-wrap'; content.style.maxHeight='56vh'; content.style.overflow='auto';
    const bar=document.createElement('div'); bar.style.display='flex'; bar.style.gap='8px'; bar.style.justifyContent='flex-end'; bar.style.marginTop='10px';
    const close=document.createElement('button'); close.textContent='Schließen'; styleBtn(close);
    const copy=document.createElement('button'); copy.textContent='In Zwischenablage'; styleBtn(copy);
    const tryit=document.createElement('button'); tryit.textContent='Im Editor öffnen'; styleBtn(tryit);
    close.onclick=()=> pop.style.display='none';
    copy.onclick=()=>{ navigator.clipboard.writeText(content.textContent||''); copy.textContent='Kopiert!'; setTimeout(()=> copy.textContent='In Zwischenablage', 1200); };
    tryit.onclick=()=>{ const txt=content.textContent||''; try{ window.dispatchEvent(new CustomEvent('open:editor',{ detail:{ text: txt } })); }catch(_){}};
    bar.appendChild(copy); bar.appendChild(tryit); bar.appendChild(close);
    pop.appendChild(content); pop.appendChild(bar); document.body.appendChild(pop); return pop;
    function styleBtn(b){ b.style.borderRadius='999px'; b.style.border='1px solid rgba(255,255,255,.18)'; b.style.padding='8px 12px'; b.style.cursor='pointer'; }
  }
  function openPopup(text){ const pop=ensure(); pop.querySelector('.popup-content').textContent=text; pop.style.display='block'; }
  window.addEventListener('chat:send', ()=>{ textAcc=''; });
  window.addEventListener('chat:delta', (ev)=>{ textAcc += (ev.detail && ev.detail.delta) ? ev.detail.delta : ''; });
  window.addEventListener('chat:done', ()=>{ if(textAcc && textAcc.trim()){ openPopup(textAcc.trim()); }});
  window.openAnswerPopup = openPopup;
})();