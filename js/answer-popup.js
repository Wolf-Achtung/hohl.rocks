/*
 * answer-popup.js — Einfaches Antwort-Popup für KI-Antworten
 *
 *  Dieses Skript erstellt ein modales Overlay, das bei einer neuen
 *  Antwort automatisch geöffnet wird. Es lauscht auf die globalen
 *  Ereignisse `chat:send`, `chat:delta` und `chat:done`, um den Text
 *  zu sammeln und schließlich anzuzeigen. Das Popup kann vom Nutzer
 *  geschlossen werden.
 */
(function(){
  'use strict';
  let answer = '';
  function ensurePopup(){
    let pop = document.getElementById('answer-popup');
    if(pop) return pop;
    pop = document.createElement('div');
    pop.id = 'answer-popup';
    pop.style.position = 'fixed';
    pop.style.left = '50%';
    pop.style.top = '50%';
    pop.style.transform = 'translate(-50%, -50%)';
    pop.style.minWidth = '320px';
    pop.style.maxWidth = '84vw';
    pop.style.maxHeight = '70vh';
    // Fast durchsichtiges Overlay (dunkel, aber deutlich leichter)
    pop.style.background = 'rgba(12,16,22,0.40)';
    pop.style.border = '1px solid rgba(255,255,255,0.14)';
    pop.style.backdropFilter = 'blur(12px)';
    pop.style.borderRadius = '18px';
    pop.style.padding = '20px';
    pop.style.boxSizing = 'border-box';
    pop.style.zIndex = '1300';
    pop.style.color = '#eaf2ff';
    pop.style.display = 'none';
    pop.style.overflowY = 'auto';
    // Inhalt
    const content = document.createElement('div');
    content.className = 'popup-content';
    pop.appendChild(content);
    // Schließen-Button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Schließen';
    closeBtn.style.background = '#1b66ff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = '0';
    closeBtn.style.borderRadius = '999px';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginTop = '16px';
    closeBtn.addEventListener('click', ()=>{ pop.style.display = 'none'; });
    pop.appendChild(closeBtn);
    document.body.appendChild(pop);
    return pop;
  }
  function openPopup(text){
    const pop = ensurePopup();
    const content = pop.querySelector('.popup-content');
    content.textContent = text;
    pop.style.display = 'block';
  }
  // Ereignisse abfangen
  window.addEventListener('chat:send', ()=>{ answer = ''; });
  window.addEventListener('chat:delta', (ev)=>{
    const delta = (ev.detail && ev.detail.delta) || '';
    answer += delta;
  });
  window.addEventListener('chat:done', ()=>{
    if(answer && answer.trim()){ openPopup(answer.trim()); }
  });
})();