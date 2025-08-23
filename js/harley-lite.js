/*! harley-lite.js — v4: unregelmäßiges V-Twin-Idle („potato-potato“), kein Meeresrauschen */
(function(){
  'use strict';

  let ctx, master, running=false, timer=null;
  const state = { gain: 0.0 };

  function ensureCtx(){
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
    return ctx;
  }

  // Ein „Thump“: kurze Sinus-/Dreieck-Welle + Noise, stark tiefpassgefiltert
  function scheduleThump(t, lvl){
    const freqStart = 70, freqEnd = 40; // Hz
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(freqStart, t);
    o.frequency.exponentialRampToValueAtTime(freqEnd, t + 0.12);

    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9*lvl, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    // leichter „Plopp“: Noise → LPF
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate*0.2), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.02));
    noise.buffer = buf;

    const lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value = 320; lpf.Q.value = 0.7;
    noise.connect(lpf);

    const mix = ctx.createGain(); mix.gain.value = 0.5*lvl;

    o.connect(g); g.connect(mix); lpf.connect(mix); mix.connect(master);
    noise.start(t); noise.stop(t+0.2); o.start(t); o.stop(t+0.2);
  }

  // Unregelmäßiges Idle-Pattern (V-Twin): 0.23s – 0.23s – 0.36s + Jitter
  function patternTimes(base = 0.27){
    const jitter = () => (Math.random()*0.04 - 0.02); // ±20ms
    return [ base-0.04+jitter(), base-0.04+jitter(), base+0.09+jitter() ];
  }

  function loop(){
    if (!running) return;
    const now = ctx.currentTime;
    const ahead = now + 0.9; // 900ms vorausplanen
    if (!loop.nextAt || loop.nextAt < now) loop.nextAt = now;

    while (loop.nextAt < ahead){
      const patt = patternTimes(0.27 + (Math.random()*0.04 - 0.02));
      for (const step of patt){
        loop.nextAt += Math.max(0.16, step);
        scheduleThump(loop.nextAt, state.gain);
      }
    }
  }

  function startAmbient(initialRpm=900){
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (running) return;
    running = true;

    // Start laut, dann nach ~3.5s herunterfahren
    state.gain = 0.85;
    ramp(master.gain, 0.85, 0.3);
    setTimeout(()=> ramp(master.gain, 0.38, 1.0), 3500);

    loop.nextAt = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(loop, 80);
  }

  function stop(){
    if (!ctx || !running) return;
    running = false;
    clearInterval(timer); timer=null;
    ramp(master.gain, 0.0001, 0.6);
  }

  function ramp(param, target, seconds){
    const now = ctx.currentTime;
    try{
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.exponentialRampToValueAtTime(Math.max(0.0001, target), now + Math.max(0.01, seconds));
    }catch{}
  }

  window.HarleyLite = { startAmbient, stop };
})();
