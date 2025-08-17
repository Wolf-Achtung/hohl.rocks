/*! harley-lite.js — tiny V‑Twin ambience (WebAudio)
 *  - Start: HarleyLite.startAmbient(rpm=900)
 *  - Blip:  HarleyLite.blip()  // kurzer RPM‑Anstieg
 *  - Stop:  HarleyLite.stop()
 *  - isRunning(): boolean
 *  Hinweis: startet nur nach User‑Gesture (Browser‑Policy).
 */
(function(){
  const ctxState = { ctx:null, master:null, timer:null, nextTime:0, running:false, rpm:900, noiseBuf:null };

  function ensureCtx(){
    if(ctxState.ctx) return ctxState.ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    const ctx = new C();
    const g = ctx.createGain(); g.gain.value = 0.0; g.connect(ctx.destination);
    ctxState.ctx = ctx; ctxState.master = g;
    ctxState.noiseBuf = buildNoise(ctx);
    return ctx;
  }

  function buildNoise(ctx){
    const dur = 0.12; // 120 ms thump body
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate*dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    // pink-ish noise by simple filter cascade
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(let i=0;i<data.length;i++){
      const white = Math.random()*2-1;
      b0 = 0.99886*b0 + white*0.0555179;
      b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520;
      b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522;
      b5 = -0.7616*b5 - white*0.0168980;
      const pink = b0+b1+b2+b3+b4+b5+b6 + white*0.5362;
      b6 = white*0.115926;
      data[i] = pink*0.35;
    }
    return buf;
  }

  function schedule(){
    const ctx = ctxState.ctx; if(!ctx || !ctxState.running) return;
    const lookahead = 0.12; // seconds
    const cycle = 120.0 / ctxState.rpm;  // 2 revs per cycle (4-stroke)
    const i1 = cycle * (315/720), i2 = cycle * (405/720); // loping 45° V‑twin
    while(ctxState.nextTime < ctx.currentTime + lookahead){
      // slight jitter for realism
      const j1 = i1 * (1 + (Math.random()-0.5)*0.06);
      const j2 = i2 * (1 + (Math.random()-0.5)*0.06);
      thump(ctxState.nextTime);
      thump(ctxState.nextTime + j1);
      ctxState.nextTime += (j1 + j2);
    }
  }

  function thump(t){
    const ctx = ctxState.ctx;
    // noise burst
    const n = ctx.createBufferSource(); n.buffer = ctxState.noiseBuf;
    const nf = ctx.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value = 160; nf.Q.value=0.7;
    const g = ctx.createGain(); g.gain.value = 0.0;
    n.connect(nf); nf.connect(g); g.connect(ctxState.master);

    // add low sine for body
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = 55 + Math.random()*6; // 55–61 Hz
    const og = ctx.createGain(); og.gain.value = 0.0;
    o.connect(og); og.connect(ctxState.master);

    // envelope
    const a = 0.008, d = 0.14;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.9, t + a);
    g.gain.exponentialRampToValueAtTime(0.0008, t + d);

    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(0.35, t + a*1.2);
    og.gain.exponentialRampToValueAtTime(0.0008, t + d*1.1);

    n.start(t); o.start(t);
    n.stop(t + d + 0.02); o.stop(t + d + 0.04);
  }

  function startAmbient(rpm){
    ensureCtx();
    const ctx = ctxState.ctx;
    if(ctxState.running) return;
    ctx.resume && ctx.resume();
    ctxState.rpm = rpm || 900;
    ctxState.running = true;
    ctxState.nextTime = ctx.currentTime + 0.05;
    // fade in
    ctxState.master.gain.cancelScheduledValues(ctx.currentTime);
    ctxState.master.gain.setValueAtTime(ctxState.master.gain.value, ctx.currentTime);
    ctxState.master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.2);

    // scheduler
    ctxState.timer = setInterval(schedule, 25);
  }

  function setRpm(rpm){ ctxState.rpm = Math.max(500, Math.min(2500, rpm|0)); }
  function blip(){
    // short rpm rise
    const r0 = ctxState.rpm;
    setRpm(Math.min(1700, r0 + 500));
    setTimeout(()=> setRpm(r0), 1200);
  }
  function stop(){
    if(!ctxState.ctx) return;
    const ctx = ctxState.ctx;
    if(ctxState.timer){ clearInterval(ctxState.timer); ctxState.timer=null; }
    // fade out
    const t = ctx.currentTime;
    ctxState.master.gain.cancelScheduledValues(t);
    ctxState.master.gain.setValueAtTime(ctxState.master.gain.value, t);
    ctxState.master.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    ctxState.running = false;
  }
  function isRunning(){ return !!ctxState.running; }

  window.HarleyLite = { startAmbient, setRpm, blip, stop, isRunning };
})();
