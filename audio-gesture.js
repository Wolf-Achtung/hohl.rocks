/*! audio-gesture.js — startet Ambient‑Sound mit der ersten Geste */
(function(){
  // ensure background video is always muted (some browsers may unmute it on user gesture)
  function muteVideo(){
    try{
      const vid = document.getElementById('bg-video');
      if(vid){ vid.muted = true; vid.volume = 0; }
    }catch{}
  }
  muteVideo();
  function arm(){
    try{ sessionStorage.setItem('harley_wants','1'); }catch{}
    try{ if(window.HarleyLite){ HarleyLite.prewarm(); HarleyLite.startAmbient(900);} }catch{}
    // ensure background video stays muted
    muteVideo();
    window.removeEventListener('pointerdown', arm, true);
    window.removeEventListener('keydown', arm, true);
  }
  window.addEventListener('pointerdown', arm, true);
  window.addEventListener('keydown', arm, true);
})();