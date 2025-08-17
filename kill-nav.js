/*! kill-nav.js — entfernt alte Unterseiten-Navi & blockiert Links */
(function(){
  const css = `nav.chips, .chips{ display:none !important; visibility:hidden !important; }`;
  const style=document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function removeNav(){
    try{ document.querySelectorAll('nav.chips, .chips').forEach(el=>el.remove()); }catch{}
  }
  document.addEventListener('DOMContentLoaded', removeNav);

  // Block clicks auf alte Unterseiten-Links (Failsafe, Capture-Phase)
  window.addEventListener('click', function(e){
    const a = e.target && e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    const href = (a.getAttribute('href')||'').toLowerCase();
    if(/(ueber-mich|projekte|kontakt)\.html/.test(href)){
      e.preventDefault(); e.stopPropagation();
      try{
        if(href.includes('ueber-mich'))      { window.ChatDock && ChatDock.send && ChatDock.send("Kurzer Überblick über Wolf Hohl (TÜV‑zertifizierter KI‑Manager): Profil, Fokus, Angebot in 5 Sätzen."); }
        else if(href.includes('projekte'))   { window.ChatDock && ChatDock.send && ChatDock.send("Zeig mir eine kompakte Übersicht der Projekte von Wolf Hohl: 3 Highlights mit Ergebnis/Impact."); }
        else if(href.includes('kontakt'))    { window.ChatDock && ChatDock.send && ChatDock.send("Ich möchte Kontakt aufnehmen. Welche Möglichkeiten habe ich (E‑Mail, LinkedIn), und wie schnell ist die Reaktionszeit?"); }
      }catch{}
    }
  }, true);
})();