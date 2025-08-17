/*
 * engine-sim-lite-v2.js
 * Superleichter WebAudio-"Motor" mit sanfter Loudness-Kurve
 * API: window.EngineLite.start(), .stop(), .isRunning()
 */
(function(){
  const Ctx = window.AudioContext || window.webkitAudioContext;
  let ctx, master, osc, sub, noise, bp, shaper, running=false;

  function ensure(){
    if(ctx) return;
    ctx = new Ctx();
    master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);

    // Sägezahn-Grundton
    osc = ctx.createOscillator(); osc.type="sawtooth";
    const oscGain = ctx.createGain(); oscGain.gain.value = 0.22;
    osc.connect(oscGain);

    // Sub-Oszillator (Herz des "Wummerns")
    sub = ctx.createOscillator(); sub.type="square";
    const subGain = ctx.createGain(); subGain.gain.value = 0.12;
    sub.connect(subGain);

    // Rauschanteil → Bandpass
    const buffer = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.35;
    noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop=true;
    bp = ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value = 140; bp.Q.value = 0.8;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.18;
    noise.connect(bp).connect(noiseGain);

    // leichtes Saturation-Shaping
    shaper = ctx.createWaveShaper();
    shaper.curve = (function makeCurve(amount=30){
      const n_samples = 44100; const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = (3+amount)*x*20*deg / (Math.PI + amount*Math.abs(x));
      }
      return curve;
    })(18);

    // Routing
    oscGain.connect(shaper);
    subGain.connect(shaper);
    noiseGain.connect(shaper);
    shaper.connect(master);

    osc.start(); sub.start(); noise.start();
  }

  function setRPM(rpm){
    if(!ctx) return;
    // Frequenzschätzung: 12-Zylinder-Feeling (rein synthetisch)
    const fBase = 30 + (rpm-700)/75; // ~30–90 Hz
    osc.frequency.setTargetAtTime(Math.max(28, fBase), ctx.currentTime, .06);
    sub.frequency.setTargetAtTime(Math.max(14, fBase*0.5), ctx.currentTime, .08);
    bp.frequency.setTargetAtTime(110 + (rpm-700)/10, ctx.currentTime, .09);
  }

  let rampTimer;
  function start(rpm = 1400){
    ensure();
    if(running) { setRPM(rpm); return; }
    running = true;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(.0, now+.01);
    // sanfte Attack
    master.gain.linearRampToValueAtTime(.18, now+.35);
    master.gain.linearRampToValueAtTime(.24, now+.9);
    setRPM(rpm);
  }

  function stop(){
    if(!ctx || !running) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    // sanfte Release
    master.gain.setTargetAtTime(0.0, now, .28);
    running = false;
  }

  function arm(){ if(!ctx) ensure(); if(ctx.state==="suspended") ctx.resume(); }

  window.EngineLite = { start, stop, arm, isRunning: ()=>running };
})();
