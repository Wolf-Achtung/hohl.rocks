// bubble-sound-lite.js — binds EngineSimLite to '.shape' clicks; one-at-a-time; stop on outside click
(function(){
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx, engine, panner, currentEl=null, armed=false;

  function ensureAudio(){
    if (!ctx){
      ctx = new AC();
      panner = ctx.createStereoPanner();
      engine = new (window.EngineSimLite||function(){}) (ctx);
      if (!engine || !engine.output){
        console.warn("[BubbleSound] EngineSimLite not present.");
        return false;
      }
      engine.connect(panner); panner.connect(ctx.destination);
    }
    return true;
  }

  function resumeOnFirstGesture(){
    if (armed) return;
    armed = true;
    const resume = () => {
      if (ctx && ctx.state === 'suspended') ctx.resume();
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
  }

  function playFor(el){
    if (!ensureAudio()) return;
    resumeOnFirstGesture();
    if (ctx.state === 'suspended') ctx.resume();
    if (currentEl === el && engine.running){ engine.stop(); currentEl=null; return; }

    // pan based on element center
    const r = el.getBoundingClientRect();
    const mid = window.innerWidth/2;
    const pan = Math.max(-1, Math.min(1, (r.left + r.width/2 - mid) / mid));
    panner.pan.setTargetAtTime(pan, ctx.currentTime, 0.08);

    engine.setRPM(800 + Math.random()*500);
    engine.start();
    currentEl = el;
  }
  function stopAll(){ if (engine) engine.stop(); currentEl=null; }

  function bind(){
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(s=>{
      s.addEventListener('click', (e)=>{ e.stopPropagation(); playFor(s); }, {passive:true});
    });
    document.addEventListener('click', (e)=>{
      if (!e.target.closest('.shape')) stopAll();
    });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
