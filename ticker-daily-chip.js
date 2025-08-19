/* ticker-daily-chip addon */
;(function(){
  let chip=null, currentPrompt='';
  function ensureTicker(){ return document.querySelector('.ticker'); }
  function removeChip(){ if(chip && chip.parentNode){ chip.parentNode.removeChild(chip); } chip=null; }
  function makeChip(promptText){
    const t = ensureTicker(); if(!t) return;
    removeChip();
    currentPrompt = promptText || 'Formuliere meine KI‑Roadmap in 5 Punkten.';
    chip = document.createElement('a');
    chip.href = '#daily';
    chip.textContent = 'Prompt des Tages: ' + currentPrompt;
    chip.style.marginLeft = '12px';
    chip.addEventListener('click', (ev)=>{
      ev.preventDefault(); ev.stopImmediatePropagation();
      try{
        if(window.ChatDock && ChatDock.send){
          ChatDock.send(currentPrompt);
        }else{
          // Fallback Event
          window.dispatchEvent(new CustomEvent('chat:send',{detail:{message:currentPrompt}}));
        }
      }catch{}
      removeChip();
    }, {capture:true});
    t.appendChild(chip);
  }
  window.addEventListener('ticker:addDaily', (ev)=> makeChip(ev.detail && ev.detail.prompt));
  window.addEventListener('ticker:removeDaily', removeChip);

  // Safety: remove chip when chat starts
  window.addEventListener('chat:send', removeChip);
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{
      // if marquee idle fired before DOM ready, we won't have received event; no-op
    }, 1000);
  });
})();