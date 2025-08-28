/*! harley-lite-autostart.js — starts ambient on first user gesture; retries */
(function(){
  'use strict';
  let started = false;
  function tryStart(){
    if (started) return;
    try { HarleyLite.startAmbient(900); started = true; } catch(_){}
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
