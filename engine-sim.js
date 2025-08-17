/* engine-sim.js — Generative WebAudio Engine (V12 + Motorcycle Idle)
   - Pure synthesis: no audio files
   - Modes: 'v12' (smooth, sovereign), 'motorcycle' (gentle idle tuck)
   - Simple API:
       EngineSim.init({ mode: 'v12', rpm: 1800, volume: 0.35, attachToggle: true });
       EngineSim.setRPM(2400);
       EngineSim.setMode('motorcycle');
       EngineSim.start(); EngineSim.stop();

   - If attachToggle:true and a button with id="sound-toggle" exists,
     EngineSim will follow that toggle automatically (On→start, Off→stop).

   Include:
     <script defer src="engine-sim.js"></script>
*/

(function(){
  const clamp = (x,a,b)=>Math.min(Math.max(x,a),b);

  const DEFAULTS = {
    mode: 'v12',     // 'v12' | 'motorcycle'
    rpm: 1800,       // 600 - 6000 sensible
    volume: 0.35,    // 0..1 master gain for engine bus
    attachToggle: true
  };

  let audioCtx, master, comp;
  let engineGain;
  let noiseSrc, noiseGain;           // exhaust noise
  let bodyOsc, bodyGain;             // steady tonal body
  let bpf1, bpf2, bpf3, saturator;   // body shaping
  let envOsc, envShape, envDepth;    // pulse shaper for exhaust
  let pan, hp;                       // subtle highpass + stereo pan
  let running = false;
  let cfg = { ...DEFAULTS };

  function makeRectPowCurve(pow=5, len=2048){
    const c = new Float32Array(len);
    for (let i=0; i<len; i++){
      const x = i/(len-1)*2 - 1; // [-1,1]
      const y = Math.max(0, x);  // half-wave rectify
      c[i] = Math.pow(y, pow);   // sharpen
    }
    return c;
  }

  function rpmToFireHz(rpm, cyl){
    // 4-stroke: each cylinder fires every 2 revs → fires/rev = cyl/2
    return (rpm/60) * (cyl/2);
  }
  function rpmToCrankHz(rpm){ return rpm/60; }

  function ensureCtx(){
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0.9;
    comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 2.5;
    comp.attack.value = 0.006; comp.release.value = 0.22;
    master.connect(comp).connect(audioCtx.destination);
  }

  function buildGraph(){
    // engine bus
    engineGain = audioCtx.createGain(); engineGain.gain.value = cfg.volume;
    engineGain.connect(master);

    // body oscillator (tonal bed) — saw/triangle blend filtered
    bodyOsc = audioCtx.createOscillator();
    bodyOsc.type = 'sawtooth'; // rich, tamed by filters
    bodyGain = audioCtx.createGain(); bodyGain.gain.value = 0.12;

    // filters for body
    bpf1 = audioCtx.createBiquadFilter(); bpf1.type='bandpass';
    bpf2 = audioCtx.createBiquadFilter(); bpf2.type='bandpass';
    bpf3 = audioCtx.createBiquadFilter(); bpf3.type='lowpass'; bpf3.frequency.value = 1800;

    // subtle saturation (waveshaper)
    saturator = audioCtx.createWaveShaper();
    (function(){
      const len=1024, curve=new Float32Array(len);
      for (let i=0;i<len;i++){
        const x = i/(len-1)*2-1;
        curve[i] = Math.tanh(1.4*x);
      }
      saturator.curve = curve;
    })();

    // exhaust noise
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate*2, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = Math.random()*2-1;
    noiseSrc = audioCtx.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
    noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0.0; // opened by envelope

    // pulse envelope via waveshaped sine (rectified^pow)
    envOsc = audioCtx.createOscillator(); envOsc.type='sine';
    envShape = audioCtx.createWaveShaper(); envShape.curve = makeRectPowCurve(6);
    envDepth = audioCtx.createGain(); envDepth.gain.value = 0.8; // envelope depth
    const envBias = audioCtx.createConstantSource(); envBias.offset.value = 0.02;
    envOsc.connect(envShape).connect(envDepth).connect(noiseGain.gain); envBias.connect(noiseGain.gain);
    envBias.start();

    // exhaust shapers
    const exh1 = audioCtx.createBiquadFilter(); exh1.type='bandpass';
    const exh2 = audioCtx.createBiquadFilter(); exh2.type='bandpass';
    const exh3 = audioCtx.createBiquadFilter(); exh3.type='highpass'; exh3.frequency.value = 120;
    noiseSrc.connect(exh1).connect(exh2).connect(exh3).connect(noiseGain).connect(engineGain);

    // stereo + final hp
    pan = new StereoPannerNode(audioCtx, { pan: 0 });
    hp  = audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 35;
    engineGain.connect(pan).connect(hp).connect(master);

    // connect body chain
    bodyOsc.connect(bodyGain).connect(bpf1).connect(bpf2).connect(bpf3).connect(saturator).connect(engineGain);

    // start sources
    bodyOsc.start(); envOsc.start(); noiseSrc.start();
  }

  function applyMode(){
    if (cfg.mode === 'v12'){
      // V12: smooth, even firing
      const fireHz = rpmToFireHz(cfg.rpm, 12);              // fires per second
      const crankHz= rpmToCrankHz(cfg.rpm);
      bodyOsc.frequency.setValueAtTime(Math.max(60, fireHz*2), audioCtx.currentTime);
      envOsc.frequency.setValueAtTime(fireHz, audioCtx.currentTime);
      // resonant peaks around ~180, 360 Hz
      bpf1.frequency.setValueAtTime(180, audioCtx.currentTime); bpf1.Q.value = 2.0;
      bpf2.frequency.setValueAtTime(360, audioCtx.currentTime); bpf2.Q.value = 1.6;
    } else {
      // motorcycle idle: gentle, lumpy tuck
      const fireHz = clamp(cfg.rpm/60, 6, 40); // idle-ish
      bodyOsc.frequency.setValueAtTime(fireHz*3, audioCtx.currentTime);
      envOsc.frequency.setValueAtTime(fireHz, audioCtx.currentTime);
      bpf1.frequency.setValueAtTime(120, audioCtx.currentTime); bpf1.Q.value = 2.2;
      bpf2.frequency.setValueAtTime(240, audioCtx.currentTime); bpf2.Q.value = 1.7;
    }
  }

  // expose API
  const API = {
    async init(options={}){
      cfg = { ...DEFAULTS, ...options };
      ensureCtx();
      buildGraph();
      API.setMode(cfg.mode);
      API.setRPM(cfg.rpm);
      API.setVolume(cfg.volume);
      if (cfg.attachToggle){
        const btn = document.getElementById('sound-toggle');
        if (btn){
          btn.addEventListener('click', ()=>{
            const on = btn.getAttribute('aria-pressed')==='true';
            if (on) API.start(); else API.stop();
          });
        }
      }
    },
    async start(){
      if (!audioCtx) ensureCtx();
      if (audioCtx.state==='suspended') await audioCtx.resume();
      running = true;
    },
    async stop(){
      if (!audioCtx) return;
      if (audioCtx.state==='running') await audioCtx.suspend();
      running = false;
    },
    setRPM(rpm){
      cfg.rpm = clamp(rpm, 400, 7000);
      if (!audioCtx) return;
      applyMode();
      const t = audioCtx.currentTime;
      const target = (cfg.mode==='v12')
        ? (0.12 + (cfg.rpm-600)/7000*0.10)
        : (0.10 + (cfg.rpm-600)/7000*0.08);
      bodyGain.gain.setTargetAtTime(target, t, 0.08);
      // subtle stereo drift only for motorcycle
      const panVal = (cfg.mode==='v12') ? 0.0 : (Math.sin(t*0.2)*0.08);
      pan.pan.setTargetAtTime(panVal, t, 0.15);
    },
    setMode(mode){
      cfg.mode = (mode==='motorcycle') ? 'motorcycle' : 'v12';
      if (!audioCtx) return;
      applyMode();
    },
    setVolume(v){
      cfg.volume = clamp(v, 0, 1);
      if (engineGain) engineGain.gain.setTargetAtTime(cfg.volume, (audioCtx?audioCtx.currentTime:0), 0.12);
    }
  };

  window.EngineSim = API;

  document.addEventListener('DOMContentLoaded', () => {
    // auto-attach if desired — starts/suspends with your #sound-toggle
    if (DEFAULTS.attachToggle){
      setTimeout(()=>API.init(), 50);
    }
  });
})();