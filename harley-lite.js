/*! harley-lite.js — richer, irregular V‑Twin ambiance */
(function(){
  'use strict';
  const HarleyLite = {};
  let ctx, master, lp, oscA, oscB, sub, noise, noiseGain, running=false, lfo, lfoGain, varTimer;

  function ensure(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);

    // Core tones (etwas schnelleres Idle)
    oscA = ctx.createOscillator(); oscA.type='sawtooth'; oscA.frequency.value=58;
    oscB = ctx.createOscillator(); oscB.type='square';   oscB.frequency.value=116;
    sub  = ctx.createOscillator(); sub.type='sine';      sub.frequency.value=29;

    const oGain = ctx.createGain(); oGain.gain.value=0.18;
    const subGain = ctx.createGain(); subGain.gain.value=0.12;

    lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=340; lp.Q.value=0.8;

    // Gentle exhaust noise (brown-ish)
    const len = 2*ctx.sampleRate; const nb = ctx.createBuffer(1,len,ctx.sampleRate);
    const ch = nb.getChannelData(0); let last=0;
    for(let i=0;i<len;i++){ const white=Math.random()*2-1; last=(last+0.03*white)/1.03; ch[i]=last; }
    noise = ctx.createBufferSource(); noise.buffer=nb; noise.loop=true;
    noiseGain = ctx.createGain(); noiseGain.gain.value=0.02;

    // Tremolo
    lfo = ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=2.6;
    lfoGain = ctx.createGain(); lfoGain.gain.value=0.33;

    oscA.connect(oGain); oscB.connect(oGain); oGain.connect(lp); lp.connect(master);
    sub.connect(subGain); subGain.connect(master);
    noise.connect(noiseGain); noiseGain.connect(master);
    lfo.connect(lfoGain); lfoGain.connect(master.gain);
  }

  function scheduleIrregular(){
    if(varTimer) clearInterval(varTimer);
    varTimer = setInterval(()=>{
      if(!ctx) return;
      const wobble = 1 + (Math.random()*0.20 - 0.10); // ±10%
      const baseA = 54*wobble, baseB = 108*wobble, baseSub = 27*wobble;
      oscA.frequency.setTargetAtTime(baseA, ctx.currentTime, 0.25);
      oscB.frequency.setTargetAtTime(baseB, ctx.currentTime, 0.25);
      sub.frequency.setTargetAtTime(baseSub, ctx.currentTime, 0.25);

      const t = ctx.currentTime;
      const g = master.gain;
      const peak = Math.min(0.28 + Math.random()*0.08, 0.34);
      g.setTargetAtTime(peak, t, 0.04);
      g.setTargetAtTime(0.13 + Math.random()*0.03, t+0.18, 0.18);
    }, 260 + Math.random()*180);
  }

  HarleyLite.prewarm = function(){ ensure(); };

  HarleyLite.startAmbient = function(fadeMs=900){
    ensure();
    if(!running){
      oscA.start(); oscB.start(); sub.start(); lfo.start(); noise.start();
      running = true;
    }
    const t = ctx.currentTime;
    const peak = 0.26, cruise = 0.13;
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(peak,  t + Math.max(0.05, fadeMs/1000));
    master.gain.linearRampToValueAtTime(cruise, t + Math.max(0.05, fadeMs/1000) + 3.2);
    scheduleIrregular();
  };

  HarleyLite.blip = function(intensity=1){
    if(!ctx || !running) return;
    const t = ctx.currentTime;
    const boost = Math.min(0.30 + 0.12*intensity, 0.42);
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(boost, t, 0.06);
    master.gain.setTargetAtTime(0.14, t+0.22, 0.28);
  };

  HarleyLite.stop = function(fadeMs=350){
    if(!ctx || !running) return;
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(0.0, t, Math.max(0.05, fadeMs/1000));
    if(varTimer) { clearInterval(varTimer); varTimer=null; }
  };

  HarleyLite.isRunning = function(){ return !!running; };
  window.HarleyLite = HarleyLite;
})();
