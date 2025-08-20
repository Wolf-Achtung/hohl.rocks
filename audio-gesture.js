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
;(function(){ document.addEventListener('DOMContentLoaded', function(){ const v=document.getElementById('bg-video'); if(v){ v.muted=true; v.volume=0.0; v.addEventListener('volumechange', ()=>{ v.muted=true; v.volume=0.0; }, true); } }); })();
