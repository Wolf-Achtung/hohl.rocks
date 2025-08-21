/*! style-switcher.js — chips to re-ask in simple/normal/nerdy styles */
(function(){
  'use strict';
  const css = `.style-switch{position:fixed;right:24px;bottom:112px;z-index:44;display:flex;gap:8px;flex-wrap:wrap}
               .style-switch .chip{padding:8px 10px;border-radius:999px;background:rgba(20,28,36,.72);border:1px solid rgba(255,255,255,.16);color:#eaf2ff;cursor:pointer;font:600 12px ui-sans-serif}`;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
  const box=document.createElement('div'); box.className='style-switch'; box.style.display='none';
  const mk=(t)=>{ const b=document.createElement('button'); b.className='chip'; b.textContent=t; return b; };
  const btnE=mk('einfach'), btnN=mk('normal'), btnX=mk('nerdy'); box.append(btnE,btnN,btnX);
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(box));

  function reask(styleWord){
    try{
      const last = (window.ChatDock && ChatDock.lastUser) ? ChatDock.lastUser : '';
      if(!last) return;
      const prompt = `Erkläre bitte dieselbe Frage erneut im Stil „${styleWord}“. Nutze maximal 4 Sätze, füge 1 Mini‑Beispiel hinzu.`;
      ChatDock.send(last + "\\n\\n" + prompt);
      window.AnalyticsLite && AnalyticsLite.emit && AnalyticsLite.emit('style_switch', { style: styleWord });
    }catch(_){}
  }

  btnE.addEventListener('click', ()=>reask('einfach'));
  btnN.addEventListener('click', ()=>reask('normal'));
  btnX.addEventListener('click', ()=>reask('nerdy'));

  window.addEventListener('chat:done', ()=>{ box.style.display='flex'; });
  window.addEventListener('chat:send', ()=>{ box.style.display='none'; });
})();
