/* engine-sim.js — Generative WebAudio Engine (V12 + Motorcycle Idle) — FIX
   Improvements:
   - Creates a #sound-toggle button if none exists
   - Resumes AudioContext on first user gesture (pointerdown/keydown)
   - Attaches to the toggle automatically (On→start, Off→stop)
   - Helpful console logs for quick debugging

   API:
     EngineSim.init({ mode:'v12'|'motorcycle', rpm:1800, volume:0.35, attachToggle:true, autoStartOnGesture:false })
     EngineSim.start(), EngineSim.stop(), EngineSim.setRPM(x), EngineSim.setMode(m), EngineSim.setVolume(v)

   Include:
     <script defer src="engine-sim.js"></script>
*/
(function(){
  const clamp = (x,a,b)=>Math.min(Math.max(x,a),b);

  const DEFAULTS = {
    mode: 'v12',
    rpm: 1800,
    volume: 0.35,
    attachToggle: true,
    autoStartOnGesture: false
  };

  let audioCtx, master, comp;
  let engineGain, bodyOsc, bodyGain, noiseSrc, noiseGain, envOsc, envShape, envDepth;
  let bpf1, bpf2, bpf3, saturator, pan, hp;
  let running = false;
  let cfg = { ...DEFAULTS };
  let booted = false;

  function log(...a){ try{ console.log('[EngineSim]', ...a); }catch(e){} }

  function ensureCtx(){
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    master = audioCtx.createGain(); master.gain.value = 0.9;
    comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 2.5;
    comp.attack.value = 0.006; comp.release.value = 0.22;
    master.connect(comp).connect(audioCtx.destination);
    log('AudioContext created, state=', audioCtx.state);
  }

  function makeRectPowCurve(pow=5, len=2048){
    const c = new Float32Array(len);
    for (let i=0; i<len; i++){
      const x = i/(len-1)*2 - 1; // [-1,1]
      const y = Math.max(0, x);  // half-wave rectify
      c[i] = Math.pow(y, pow);
    }
    return c;
  }

  function rpmToFireHz(rpm, cyl){ return (rpm/60) * (cyl/2); } // 4-stroke
  function rpmToCrankHz(rpm){ return rpm/60; }

  function buildGraph(){
    engineGain = audioCtx.createGain(); engineGain.gain.value = cfg.volume;
    engineGain.connect(master);

    // Body oscillator
    bodyOsc = audioCtx.createOscillator(); bodyOsc.type = 'sawtooth';
    bodyGain = audioCtx.createGain(); bodyGain.gain.value = 0.12;
    bpf1 = audioCtx.createBiquadFilter(); bpf1.type='bandpass';
    bpf2 = audioCtx.createBiquadFilter(); bpf2.type='bandpass';
    bpf3 = audioCtx.createBiquadFilter(); bpf3.type='lowpass'; bpf3.frequency.value = 1800;
    saturator = audioCtx.createWaveShaper();
    (function(){ const n=1024, curve=new Float32Array(n);
      for(let i=0;i<n;i++){ const x=i/(n-1)*2-1; curve[i]=Math.tanh(1.4*x); }
      saturator.curve = curve; })();

    bodyOsc.connect(bodyGain).connect(bpf1).connect(bpf2).connect(bpf3).connect(saturator).connect(engineGain);

    // Exhaust noise + envelope
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate*2, audioCtx.sampleRate);
    const data = buf.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
    noiseSrc = audioCtx.createBufferSource(); noiseSrc.buffer=buf; noiseSrc.loop=true;
    noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0.0;
    const exh1 = audioCtx.createBiquadFilter(); exh1.type='bandpass';
    const exh2 = audioCtx.createBiquadFilter(); exh2.type='bandpass';
    const exh3 = audioCtx.createBiquadFilter(); exh3.type='highpass'; exh3.frequency.value=120;
    noiseSrc.connect(exh1).connect(exh2).connect(exh3).connect(noiseGain).connect(engineGain);

    envOsc = audioCtx.createOscillator(); envOsc.type='sine';
    envShape = audioCtx.createWaveShaper(); envShape.curve = makeRectPowCurve(6);
    envDepth = audioCtx.createGain(); envDepth.gain.value=0.8;
    const envBias = audioCtx.createConstantSource(); envBias.offset.value=0.02;
    envOsc.connect(envShape).connect(envDepth).connect(noiseGain.gain); envBias.connect(noiseGain.gain);
    envBias.start();

    // Stereo + final HP
    pan = new StereoPannerNode(audioCtx, { pan: 0 });
    hp  = audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=35;
    engineGain.connect(pan).connect(hp).connect(master);

    bodyOsc.start(); envOsc.start(); noiseSrc.start();
    log('Graph built.');
  }

  function applyMode(){
    if (!audioCtx) return;
    if (cfg.mode === 'v12'){
      const fireHz = rpmToFireHz(cfg.rpm, 12);
      bodyOsc.frequency.setValueAtTime(Math.max(60, fireHz*2), audioCtx.currentTime);
      envOsc.frequency.setValueAtTime(fireHz, audioCtx.currentTime);
      bpf1.frequency.setValueAtTime(180, audioCtx.currentTime); bpf1.Q.value=2.0;
      bpf2.frequency.setValueAtTime(360, audioCtx.currentTime); bpf2.Q.value=1.6;
    } else {
      const fireHz = Math.min(Math.max(cfg.rpm/60, 6), 40);
      bodyOsc.frequency.setValueAtTime(fireHz*3, audioCtx.currentTime);
      envOsc.frequency.setValueAtTime(fireHz, audioCtx.currentTime);
      bpf1.frequency.setValueAtTime(120, audioCtx.currentTime); bpf1.Q.value=2.2;
      bpf2.frequency.setValueAtTime(240, audioCtx.currentTime); bpf2.Q.value=1.7;
    }
    log('Mode applied:', cfg.mode, 'rpm=', cfg.rpm);
  }

  function ensureToggle(){
    if (!cfg.attachToggle) return;
    let btn = document.getElementById('sound-toggle');
    if (!btn){
      btn = document.createElement('button');
      btn.id = 'sound-toggle';
      btn.className = 'sound-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'Sound: Off';
      document.body.appendChild(btn);
      log('Created #sound-toggle automatically.');
    }
    btn.addEventListener('click', async ()=>{
      const on = btn.getAttribute('aria-pressed')==='true';
      if (on) await API.start(); else await API.stop();
    });
  }

  // Public API
  const API = {
    async init(options={}){
      cfg = { ...DEFAULTS, ...options };
      ensureCtx();
      buildGraph();
      API.setMode(cfg.mode);
      API.setRPM(cfg.rpm);
      API.setVolume(cfg.volume);
      ensureToggle();
      booted = true;
      log('Init done. ctx=', audioCtx.state, 'attachToggle=', cfg.attachToggle);
    },
    async start(){
      if (!audioCtx) ensureCtx();
      if (audioCtx.state==='suspended') await audioCtx.resume();
      running = true;
      const btn = document.getElementById('sound-toggle');
      if (btn){ btn.setAttribute('aria-pressed','true'); btn.textContent='Sound: On'; }
      log('Engine started.');
    },
    async stop(){
      if (!audioCtx) return;
      if (audioCtx.state==='running') await audioCtx.suspend();
      running = false;
      const btn = document.getElementById('sound-toggle');
      if (btn){ btn.setAttribute('aria-pressed','false'); btn.textContent='Sound: Off'; }
      log('Engine stopped.');
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

  // Resume on first user gesture (for autoplay policy) & optionally auto-start
  function firstGesture(){
    ensureCtx();
    if (audioCtx.state === 'suspended'){
      audioCtx.resume().then(()=>{
        log('AudioContext resumed from first gesture.');
        if (cfg.autoStartOnGesture){
          if (!booted) API.init();
          API.start();
        }
      }).catch(()=>{});
    }else{
      if (cfg.autoStartOnGesture){
        if (!booted) API.init();
        API.start();
      }
    }
    window.removeEventListener('pointerdown', firstGesture);
    window.removeEventListener('keydown', firstGesture);
  }
  window.addEventListener('pointerdown', firstGesture, { once:true });
  window.addEventListener('keydown', firstGesture, { once:true });

  document.addEventListener('DOMContentLoaded', () => {
    // lazy init after DOM ready so button can be attached/created
    setTimeout(()=>API.init(), 60);
  });
})();