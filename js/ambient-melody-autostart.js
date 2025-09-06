/*! ambient-melody-autostart.js — default radiohead */
(function(){
  'use strict';
  let primed=false;
  function prime(){
    if(primed) return; primed=true;
    try{ const Ctx=window.AudioContext||window.webkitAudioContext; const ctx=window.WolfMelody&&window.WolfMelody.ensureCtx&&window.WolfMelody.ensureCtx(); if(ctx&&ctx.resume) ctx.resume(); }catch(e){}
    try{ window.WolfMelody&&window.WolfMelody.start&&window.WolfMelody.start('radiohead'); }catch(e){}
    window.removeEventListener('pointerdown', prime); window.removeEventListener('keydown', prime); window.removeEventListener('touchstart', prime);
  }
  window.addEventListener('pointerdown', prime, {once:true});
  window.addEventListener('keydown', prime, {once:true});
  window.addEventListener('touchstart', prime, {once:true});
})();