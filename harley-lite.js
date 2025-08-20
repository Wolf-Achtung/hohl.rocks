/*! harley-lite.js — dezentes V‑Twin‑Tuckern (WebAudio, keine Dateien) */
(function(){
  const HarleyLite = {};
  let ctx=null, master=null, running=false;
  let osc1=null, osc2=null, sub=null, trem=null, tremGain=null, lowpass=null, shaper=null, noise=null, noiseGain=null;

  function makeShaper(amount=1.6){
    const n=256, c=new Float32Array(n);
    for(let i=0;i<n;i++){ const x = i*2/n - 1; c[i] = Math.tanh(amount*x); }
    return c;
  }

  function ensure(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value=0.0; master.connect(ctx.destination);

    // Core: zwei Oszillatoren + Sub
    osc1 = ctx.createOscillator(); osc1.type='sawtooth'; osc1.frequency.value=46; // ~ Leerlauf
    osc2 = ctx.createOscillator(); osc2.type='square';   osc2.frequency.value=92; // 2. Oberton
    sub  = ctx.createOscillator(); sub.type='sine';      sub.frequency.value=23; // Subtiefe

    const oGain = ctx.createGain(); oGain.gain.value=0.18;
    const subGain = ctx.createGain(); subGain.gain.value=0.10;

    // Leichtes Tremolo erzeugt das "tuckern"
    trem = ctx.createOscillator(); trem.type='sine'; trem.frequency.value=2.2;
    tremGain = ctx.createGain(); tremGain.gain.value=0.35;

    // Dezent: Auspuffrauschen
    const bufferSize = 2 * ctx.sampleRate;
    const nb = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = nb.getChannelData(0); let last=0;
    for(let i=0;i<bufferSize;i++){ const white=Math.random()*2-1; last=(last+0.02*white)/1.02; data[i]=last; }
    noise = ctx.createBufferSource(); noise.buffer=nb; noise.loop=true;
    noiseGain = ctx.createGain(); noiseGain.gain.value=0.02;

    // Formung
    shaper = ctx.createWaveShaper(); shaper.curve = makeShaper(1.6);
    lowpass = ctx.createBiquadFilter(); lowpass.type='lowpass'; lowpass.frequency.value=320;

    // Verkabelung
    osc1.connect(oGain); osc2.connect(oGain); oGain.connect(shaper); shaper.connect(lowpass);
    sub.connect(subGain);
    lowpass.connect(master); subGain.connect(master);
    noise.connect(noiseGain); noiseGain.connect(master);

    trem.connect(tremGain); tremGain.connect(master.gain);
  }

  function fadeParam(param, to, ms){ const t=ctx.currentTime; param.cancelScheduledValues(t); param.setTargetAtTime(to, t, Math.max(0.01, ms/1000)); }

  HarleyLite.prewarm = function(){ ensure(); };

  HarleyLite.startAmbient = function(fadeMs=900){
    ensure();
    if(!running){
      osc1.start(); osc2.start(); sub.start(); trem.start(); noise.start();
      running = true;
    }
    const t = ctx.currentTime;
    const peak = 0.22, cruise = 0.12;
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(peak, t + fadeMs/1000);
    master.gain.linearRampToValueAtTime(cruise, t + fadeMs/1000 + 3.0);
  };

  HarleyLite.blip = function(intensity=1){
    if(!ctx || !running) return;
    const t = ctx.currentTime;
    const boost = Math.min(0.22 + 0.10*intensity, 0.35);
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(boost, t, 0.08);
    master.gain.setTargetAtTime(0.12, t+0.25, 0.35);
  };

  HarleyLite.stop = function(fadeMs=350){
    if(!ctx || !running) return;
    fadeParam(master.gain, 0.0, fadeMs);
  };

  HarleyLite.isRunning = function(){ return !!running; };
  window.HarleyLite = HarleyLite;
})();