/*! harley-lite.js — V‑Twin ambience (WebAudio) — v3
 *  - Start: HarleyLite.startAmbient(rpm=900)
 *  - Blip:  HarleyLite.blip()
 *  - Stop:  HarleyLite.stop()
 *  - isRunning(): boolean
 *  - Auto-Arm: startet beim **ersten** User-Event (pointer/keydown) nach Page-Load automatisch,
 *    sofern noch nicht laufend. Browser-Policy-konform (keine Autoplay-Verstöße).
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
    const dur = 0.12;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate*dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
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
    const lookahead = 0.12;
    const cycle = 120.0 / ctxState.rpm;  // 2 revs per cycle (4-stroke)
    const i1 = cycle * (315/720), i2 = cycle * (405/720);
    while(ctxState.nextTime < ctx.currentTime + lookahead){
      const j1 = i1 * (1 + (Math.random()-0.5)*0.06);
      const j2 = i2 * (1 + (Math.random()-0.5)*0.06);
      thump(ctxState.nextTime);
      thump(ctxState.nextTime + j1);
      ctxState.nextTime += (j1 + j2);
    }
  }

  function thump(t){
    const ctx = ctxState.ctx;
    const n = ctx.createBufferSource(); n.buffer = ctxState.noiseBuf;
    const nf_lp = ctx.createBiquadFilter(); nf_lp.type='lowpass'; nf_lp.frequency.value = 200; nf_lp.Q.value=0.7;
    const nf_bp = ctx.createBiquadFilter(); nf_bp.type='bandpass'; nf_bp.frequency.value = 190; nf_bp.Q.value=1.1;
    const gN = ctx.createGain(); gN.gain.value = 0.0;
    n.connect(nf_lp); nf_lp.connect(nf_bp); nf_bp.connect(gN); gN.connect(ctxState.master);

    const o1 = ctx.createOscillator(); o1.type='sine'; o1.frequency.value = 58;
    const o2 = ctx.createOscillator(); o2.type='sine'; o2.frequency.value = 116;
    const g1 = ctx.createGain(); g1.gain.value = 0.0;
    const g2 = ctx.createGain(); g2.gain.value = 0.0;
    o1.connect(g1); g1.connect(ctxState.master);
    o2.connect(g2); g2.connect(ctxState.master);

    const a = 0.010, d = 0.18;
    gN.gain.setValueAtTime(0, t);
    gN.gain.linearRampToValueAtTime(0.9, t + a);
    gN.gain.exponentialRampToValueAtTime(0.001, t + d);

    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.30, t + a*1.1);
    g1.gain.exponentialRampToValueAtTime(0.001, t + d);

    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.18, t + a*1.1);
    g2.gain.exponentialRampToValueAtTime(0.001, t + d*0.9);

    n.start(t); o1.start(t); o2.start(t);
    n.stop(t + d + 0.03); o1.stop(t + d + 0.05); o2.stop(t + d + 0.05);
  }

  function startAmbient(rpm){
    ensureCtx();
    const ctx = ctxState.ctx;
    if(ctxState.running) return;
    ctx.resume && ctx.resume();
    ctxState.rpm = rpm || 900;
    ctxState.running = true;
    ctxState.nextTime = ctx.currentTime + 0.05;
    ctxState.master.gain.cancelScheduledValues(ctx.currentTime);
    ctxState.master.gain.setValueAtTime(ctxState.master.gain.value, ctx.currentTime);
    ctxState.master.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 1.0);
    ctxState.timer = setInterval(schedule, 25);
  }

  function setRpm(rpm){ ctxState.rpm = Math.max(500, Math.min(2500, rpm|0)); }
  function blip(){ const r0 = ctxState.rpm; setRpm(Math.min(1700, r0 + 500)); setTimeout(()=> setRpm(r0), 1200); }
  function stop(){
    if(!ctxState.ctx) return;
    const ctx = ctxState.ctx;
    if(ctxState.timer){ clearInterval(ctxState.timer); ctxState.timer=null; }
    const t = ctx.currentTime;
    ctxState.master.gain.cancelScheduledValues(t);
    ctxState.master.gain.setValueAtTime(ctxState.master.gain.value, t);
    ctxState.master.gain.linearRampToValueAtTime(0.0001, t + 1.0);
    ctxState.running = false;
  }
  function isRunning(){ return !!ctxState.running; }
  function autoArm(){
    const boot = ()=>{ try{ startAmbient(900); }catch{}; window.removeEventListener('pointerdown', boot); window.removeEventListener('keydown', boot); };
    window.addEventListener('pointerdown', boot, {once:true});
    window.addEventListener('keydown', boot, {once:true});
  }

  window.HarleyLite = { startAmbient, setRpm, blip, stop, isRunning, autoArm };

  document.addEventListener('DOMContentLoaded', ()=>{ autoArm(); });
})();
