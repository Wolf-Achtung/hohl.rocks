// Startet erst nach User-Geste (Browser-Autoplay-Policy)
(function(w,d){
  let ctx, master, on=false;
  function init(){
    ctx = new (w.AudioContext||w.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.15; master.connect(ctx.destination);
    const mk = (freq)=>{ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=freq;
      const g=ctx.createGain(); g.gain.value=0; o.connect(g).connect(master); o.start();
      // langsame Hüllkurven
      const t=ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.0,t);
      g.gain.linearRampToValueAtTime(0.18,t+8);
      g.gain.linearRampToValueAtTime(0.12,t+30);
      return {o,g};
    };
    const voices=[ mk(196), mk(233), mk(311) ];
    // leichte Modulation
    setInterval(()=>{ voices.forEach(v=>{ const f=v.o.frequency.value; v.o.frequency.setTargetAtTime(f*(0.98+Math.random()*0.04), ctx.currentTime, 2.0); }); }, 6000);
  }
  function toggle(){
    if(!ctx){ init(); on=true; return; }
    if(ctx.state==='suspended') ctx.resume();
    on=!on; master.gain.setTargetAtTime(on?0.15:0.0, ctx.currentTime, 0.5);
  }
  // Button mit id="sound-toggle" (optional)
  d.addEventListener('pointerdown', function on1(){ d.removeEventListener('pointerdown', on1, true); if(!ctx) init(); }, true);
  w.Klang = { toggle };
})(window, document);
