/*! no-subpage-nav.js — killt alte Unterseiten-Navigation & Panels */
(function(){
  function killNav(ev){
    const a = ev.target.closest && ev.target.closest('a[href]');
    if(!a) return;
    const href = (a.getAttribute('href')||'').toLowerCase();
    if(/(kontakt|ueber-mich|projekte)\.html/.test(href)){
      ev.preventDefault(); ev.stopImmediatePropagation();
      // Panels schließen
      ['.panel','.content-panel','.contact-panel','.modal','.sheet','.glass-panel','#kontakt','.kontakt','#contact','[data-panel]']
        .forEach(sel=> document.querySelectorAll(sel).forEach(el=>{ el.style.display='none'; el.removeAttribute('open'); el.classList.remove('show'); }));
      // Stattdessen Chat fokussieren / Nachricht vorschlagen
      try{
        if(window.ChatDock && (ChatDock.focus||ChatDock.open)) (ChatDock.focus||ChatDock.open).call(ChatDock);
        if(window.ChatDock && ChatDock.send) ChatDock.send('Wie nehme ich am besten Kontakt zu Wolf Hohl auf? (E‑Mail, LinkedIn) – bitte kurz & präzise.');
      }catch{}
    }
  }
  window.addEventListener('click', killNav, true);
})();