/*! wolf-melody-autostart.js — start AmbientMelody on first gesture; retries */
(function(){
  'use strict';
  let started = false;
  function tryStart(){
    if (started) return;
    try { window.WolfMelody?.start('hopkins'); started = true; } catch(_){}
  }
  function gesture(){
    if (started) return;
    tryStart();
    if (!started){
      setTimeout(tryStart, 120);
      setTimeout(tryStart, 400);
    }
  }
  ['pointerdown','touchstart','keydown','click'].forEach(evt=>{
    window.addEventListener(evt, gesture, { passive:true, once:false });
  });
  window.addEventListener('chat:send', gesture);
})();
