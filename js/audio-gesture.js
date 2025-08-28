/*! audio-gesture.js — startet Ambient‑Melodie mit der ersten Geste (Sound‑Gate) */
(function(){
  function muteVideo(){
    try{ const vid=document.getElementById('bg-video'); if(vid){ vid.muted=true; vid.volume=0; } }catch(_){}
  }
  muteVideo();

  function arm(){
    try{ window.WolfMelody?.start('hopkins'); }catch(_){}
    muteVideo();
    window.removeEventListener('pointerdown', arm, true);
    window.removeEventListener('keydown', arm, true);
  }
  window.addEventListener('pointerdown', arm, true);
  window.addEventListener('keydown', arm, true);
})();
