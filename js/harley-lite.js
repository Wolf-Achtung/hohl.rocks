/*! harley-lite.js — v5: schnelleres V-Twin-Idle („potato-potato“) mit Jitter */
(function(){
  'use strict';

  let ctx, master, running=false, timer=null;
  const state = { gain: 0.0, base: 0.16 }; // base ↓ = schneller

  function ensureCtx(){
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
    return ctx;
  }

  // einzelner „Thump“
  function scheduleThump(t, lvl){
    const o = ctx.createOscillator(); o.type='triangle';
    o.frequency.setValueAtTime(80, t);
    o.frequency.exponentialRampToValueAtTime(45, t+0.10);

    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.95*lvl, t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.16);

    // kurzer Noise-Impuls durch LPF
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate*0.18), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.018));
    n.buffer = buf;

    const lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value=360; lpf.Q.value=0.7;

    const mix = ctx.createGain(); mix.gain.value = 0.48*lvl;

    n.connect(lpf); o.connect(g); g.connect(mix); lpf.connect(mix); mix.connect(master);
    n.start(t); n.stop(t+0.18); o.start(t); o.stop(t+0.18);
  }

  // schnelleres, unregelmäßiges Pattern: zwei kurze, eine längere Pause
  function patternTimes(){
    // base ~0.16 → sehr flott; gern 0.14 für „noch schneller“
    const b = state.base;
    const jit = ()=> (Math.random()*0.02 - 0.01); // ±10ms
    return [ Math.max(0.10, b-0.03+jit()), Math.max(0.10, b-0.03+jit()), Math.max(0.18, b+0.06+jit()) ];
  }

  function loop(){
    if (!running) return;
    const now = ctx.currentTime, ahead = now + 0.9;
    if (!loop.nextAt || loop.nextAt < now) loop.nextAt = now;
    while (loop.nextAt < ahead){
      const patt = patternTimes();
      for (const step of patt){
        loop.nextAt += step;
        scheduleThump(loop.nextAt, state.gain);
      }
    }
  }

  function setRpm(rpm){
    // sehr grobe Abbildung: höhere RPM → kleinere base
    // 900 → ~0.19 | 1200 → ~0.16 | 1500 → ~0.14
    state.base = Math.max(0.12, Math.min(0.22, 0.32 - rpm/5000));
  }

  function startAmbient(rpm=1300){
    ensureCtx(); if (ctx.state==='suspended') ctx.resume();
    if (running) return; running = true;
    setRpm(rpm);

    // Start kräftig, dann runter
    state.gain = 0.9;
    ramp(master.gain, 0.9, 0.25);
    setTimeout(()=> ramp(master.gain, 0.42, 1.0), 3200);

    loop.nextAt = 0;
    clearInterval(timer); timer = setInterval(loop, 70);
  }

  function stop(){
    if (!ctx || !running) return;
    running=false; clearInterval(timer); timer=null; ramp(master.gain, 0.0001, 0.5);
  }

  function ramp(param, target, seconds){
    const now = ctx.currentTime;
    try{
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.exponentialRampToValueAtTime(Math.max(0.0001, target), now + Math.max(0.01, seconds));
    }catch{}
  }

  window.HarleyLite = { startAmbient, stop, setRpm };
})();
