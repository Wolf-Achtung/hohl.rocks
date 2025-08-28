/*! audio-gesture.js — startet Ambient‑Sound mit der ersten Geste */
(function(){
  function arm(){
    try{ sessionStorage.setItem('harley_wants','1'); }catch{}
    try{ if(window.HarleyLite){ HarleyLite.prewarm(); HarleyLite.startAmbient(900);} }catch{}
    window.removeEventListener('pointerdown', arm, true);
    window.removeEventListener('keydown', arm, true);
  }
  window.addEventListener('pointerdown', arm, true);
  window.addEventListener('keydown', arm, true);
})();