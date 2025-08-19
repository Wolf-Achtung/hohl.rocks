/*! harley-lite.js — dezenter V‑Twin‑Ambient (WebAudio, keine Dateien) */
(function(){
  const HarleyLite = {};
  let ctx=null, master=null, rumble=null, subOsc=null, lfo=null, lfoGain=null, running=false;

  function ensureCtx(){
    if(ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);
    // Brownish noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last=0; for(let i=0;i<bufferSize;i++){ const white=Math.random()*2-1; data[i]=(last + 0.02*white)/1.02; last=data[i]; }
    rumble = ctx.createBufferSource(); rumble.buffer=noiseBuffer; rumble.loop=true;
    const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=30;
    const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=220;
    rumble.connect(hp); hp.connect(lp);
    subOsc = ctx.createOscillator(); subOsc.type='sine'; subOsc.frequency.value=46;
    const subGain = ctx.createGain(); subGain.gain.value=0.08;
    lfo = ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.8;
    lfoGain = ctx.createGain(); lfoGain.gain.value=0.08;
    lp.connect(master); subOsc.connect(subGain); subGain.connect(master); lfo.connect(lfoGain); lfoGain.connect(master.gain);
  }
  function fade(param, from, to, ms){ const t=ctx.currentTime; param.cancelScheduledValues(t); param.setValueAtTime(from,t); param.linearRampToValueAtTime(to, t+ms/1000); }
  HarleyLite.prewarm = function(){ ensureCtx(); };
  HarleyLite.startAmbient = async function(fadeMs=900){
    ensureCtx();
    await ctx.resume();
    if(!running){ rumble.start(0); subOsc.start(0); lfo.start(0); running=true; }
    // Start etwas lauter, dann nach 3.5s auf Basis
    fade(master.gain, master.gain.value, 0.32, Math.max(600, fadeMs));
    setTimeout(()=>{ try{ fade(master.gain, master.gain.value, 0.22, 900); }catch{} }, 3500);
  };
  HarleyLite.stop = function(fadeMs=350){ if(!ctx||!running) return; fade(master.gain, master.gain.value, 0.0, fadeMs); };
  HarleyLite.isRunning = ()=> running && master && master.gain.value>0.001;
  HarleyLite.blip = function(){ if(!ctx) return; const target=Math.min(0.34, master.gain.value+0.12); fade(master.gain, master.gain.value, target, 80); setTimeout(()=>fade(master.gain, master.gain.value, 0.22, 260),160); };
  window.HarleyLite = HarleyLite;
})();