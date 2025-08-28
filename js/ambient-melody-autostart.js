/*! ambient-melody-autostart.js — prime on first gesture + handy shortcuts */
(function(){
  'use strict';
  let primed=false;
  function prime(){
    if (primed) return; primed=true;
    try{ const Ctx = window.AudioContext||window.webkitAudioContext; const ctx = window.WolfMelody?.ensureCtx?.(); ctx && ctx.resume(); }catch(_){}
    // Default: starte sanft im „Hopkins“-Mood
    window.WolfMelody?.start?.('hopkins');
    // Entferne Listener nach dem ersten Prime
    window.removeEventListener('pointerdown', prime); window.removeEventListener('keydown', prime); window.removeEventListener('touchstart', prime);
  }
  window.addEventListener('pointerdown', prime, {once:true});
  window.addEventListener('keydown', prime, {once:true});
  window.addEventListener('touchstart', prime, {once:true});

  // Bonus: Global Shortcuts aus Konsole
  window.Melody = {
    start: (m)=> window.WolfMelody?.start?.(m||'hopkins'),
    stop: ()=> window.WolfMelody?.stop?.(),
    tempo: (b)=> window.WolfMelody?.setTempo?.(b),
    mood: (m)=> window.WolfMelody?.setMood?.(m),
    gpt: (t)=> window.WolfMelody?.gptPlan?.(t),
    seed: (s)=> window.WolfMelody?.setSeed?.(s),
  };
})();
