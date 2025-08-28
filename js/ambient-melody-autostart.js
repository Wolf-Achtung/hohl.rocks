/*! ambient-melody-autostart.js — primt die Ambient-Engine bei erstem Benutzerkontakt
 *
 * Diese kleine Hilfsdatei sorgt dafür, dass der WebAudio‑Kontext erst nach der
 * ersten Benutzeraktion (Pointer, Touch oder Taste) gestartet wird. Dadurch
 * erfüllt sie Autoplay‑Richtlinien der meisten Browser. Standardmäßig wird
 * beim ersten Prime die Ambient‑Melodie im „Hopkins“‑Mood gestartet. Zudem
 * stellt sie ein globales `window.Melody`‑Objekt bereit, mit dem die
 * Melodie bequem gesteuert werden kann (start/stop/tempo/mood/gpt/seed).
 */
(function(){
  'use strict';
  let primed=false;
  function prime(){
    if (primed) return; primed=true;
    try{
      const ctx = window.WolfMelody?.ensureCtx?.();
      if(ctx) ctx.resume();
    }catch(_){}
    // Standardmäßig im Hopkins‑Mood starten
    try{ window.WolfMelody?.start?.('hopkins'); }catch(_){}
    window.removeEventListener('pointerdown', prime);
    window.removeEventListener('keydown', prime);
    window.removeEventListener('touchstart', prime);
  }
  window.addEventListener('pointerdown', prime, {once:true});
  window.addEventListener('keydown', prime, {once:true});
  window.addEventListener('touchstart', prime, {once:true});
  // Bonus: manuelle Kontrolle aus der Konsole
  window.Melody = {
    start: (m)=> window.WolfMelody?.start?.(m||'hopkins'),
    stop: ()=> window.WolfMelody?.stop?.(),
    tempo: (b)=> window.WolfMelody?.setTempo?.(b),
    mood: (m)=> window.WolfMelody?.setMood?.(m),
    gpt: (t)=> window.WolfMelody?.gptPlan?.(t),
    seed: (s)=> window.WolfMelody?.setSeed?.(s),
  };
})();