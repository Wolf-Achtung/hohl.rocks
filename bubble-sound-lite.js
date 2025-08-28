/*
 * Bindet Sound-Start/Stop an Shapes und respektiert Autoplay-Policy
 * - Klick auf Shape: Engine an (leichte Zufalls-RPM), optional Navigation
 * - Klick ins Leere: Engine aus
 */
(function(){
  function bind(){
    // arm Audio on first interaction
    const arm = ()=>{ try{ EngineLite.arm(); }catch(e){} window.removeEventListener('pointerdown', arm); window.removeEventListener('keydown', arm); };
    window.addEventListener('pointerdown', arm, {once:false});
    window.addEventListener('keydown', arm, {once:false});

    document.addEventListener('click', (ev)=>{
      const el = ev.target.closest('.shape');
      if(el){
        const rpm = 1100 + Math.random()*1200;
        EngineLite.start(rpm);
      } else {
        EngineLite.stop();
      }
    });
  }
  if(document.readyState!=="loading") bind();
  else document.addEventListener('DOMContentLoaded', bind);
})();
