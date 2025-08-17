/* desert-audio-pack v2 / audio-generative.js
   Generative ambient pad + wind + soft Doppler whoosh using WebAudio.
   Adds a floating Sound toggle and supports *presets* for different moods.

   Usage (choose a preset per page before loading the script):
     <script>window.DESERT_AUDIO_PRESET = 'highway-dawn';</script>
     <link rel="stylesheet" href="audio-generative.css">
     <script defer src="audio-generative.js"></script>

   Presets:
     - 'highway-dawn'  → warm/hell, entspannt, souverän (empfohlen)
     - 'blue-noon'     → neutral, sehr ruhig, minimal
     - 'night-cruise'  → tiefer, samtig, aber nicht düster
*/
(function(){
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  // ------------------------- PRESETS --------------------------------------
  const PRESETS = {
    'highway-dawn': {
      pad: {
        rootHz: 110,                  // A2
        intervals: [0, 7, 14, 21],    // offene Quinten (souverän, nicht düster)
        oscTypes: ['sine','triangle','sine','triangle'],
        detuneCents: [-4, +6, -2, +3],
        gain: 0.20,
        filterCutoff: 1400,
        filterQ: 0.6,
        chorus: { depthMs: 4.5, rateHz: 0.05 },
        delay:  { timeL: 0.32, timeR: 0.39, feedback: 0.16, toneHz: 1600 },
        vibrato:{ depth: 0.005, rateHz: 0.035 },
      },
      wind: { gain: 0.10, bandHz: 650, bandwidth: 1.2, highpassHz: 90, fade:{min:0.06,max:0.16,rateHz:0.016} },
      whoosh: { gain: 0.22, dur: 0.65, panStart: -0.8, panEnd: +0.8, bandStartHz: 1200, bandEndHz: 500 },
    },
    'blue-noon': {
      pad: {
        rootHz: 123.47,               // B2 → leicht heller
        intervals: [0, 7, 12],        // einfacher, sehr ruhig
        oscTypes: ['sine','sine','triangle'],
        detuneCents: [-2, +3, -1],
        gain: 0.18,
        filterCutoff: 1200,
        filterQ: 0.7,
        chorus: { depthMs: 3.5, rateHz: 0.045 },
        delay:  { timeL: 0.28, timeR: 0.33, feedback: 0.12, toneHz: 1400 },
        vibrato:{ depth: 0.004, rateHz: 0.03 },
      },
      wind: { gain: 0.08, bandHz: 600, bandwidth: 1.0, highpassHz: 80, fade:{min:0.05,max:0.12,rateHz:0.012} },
      whoosh: { gain: 0.18, dur: 0.6, panStart: -0.7, panEnd: +0.7, bandStartHz: 1000, bandEndHz: 450 },
    },
    'night-cruise': {
      pad: {
        rootHz: 103.83,               // G#2 → etwas tiefer, weich
        intervals: [0, 7, 19],        // +5th, +12th (schwebend, klar)
        oscTypes: ['triangle','sine','triangle'],
        detuneCents: [-5, +4, -3],
        gain: 0.19,
        filterCutoff: 1100,
        filterQ: 0.55,
        chorus: { depthMs: 5.5, rateHz: 0.05 },
        delay:  { timeL: 0.35, timeR: 0.41, feedback: 0.17, toneHz: 1500 },
        vibrato:{ depth: 0.0055, rateHz: 0.032 },
      },
      wind: { gain: 0.09, bandHz: 580, bandwidth: 1.1, highpassHz: 85, fade:{min:0.06,max:0.15,rateHz:0.014} },
      whoosh: { gain: 0.2, dur: 0.7, panStart: -0.85, panEnd: +0.85, bandStartHz: 1100, bandEndHz: 480 },
    },
  };

  const PRESET_NAME = (window.DESERT_AUDIO_PRESET || 'highway-dawn');
  const CFG = JSON.parse(JSON.stringify(PRESETS[PRESET_NAME] || PRESETS['highway-dawn']));

  // ------------------------- AUDIO STATE ----------------------------------
  let audioCtx, masterGain, comp, padGain, windGain, whooshGain;
  let lfoNodes = [];
  let isOn = false;

  // ------------------------- UI ------------------------------------------
  function ensureToggle(){
    if (document.getElementById('sound-toggle')) return;
    const btn = document.createElement('button');
    btn.id='sound-toggle'; btn.className='sound-toggle'; btn.type='button';
    btn.setAttribute('aria-pressed','false'); btn.textContent='Sound: Off';
    btn.addEventListener('click', toggleAudio);
    document.body.appendChild(btn);
  }

  // ------------------------- INIT GRAPH -----------------------------------
  async function ensureAudio(){
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext; audioCtx = new AC();
    masterGain = audioCtx.createGain(); masterGain.gain.value = 0.9;
    comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 18; comp.ratio.value = 2.8;
    comp.attack.value = 0.004; comp.release.value = 0.28;
    masterGain.connect(comp).connect(audioCtx.destination);

    padGain = audioCtx.createGain(); padGain.gain.value = CFG.pad.gain;
    windGain = audioCtx.createGain(); windGain.gain.value = CFG.wind.gain;
    whooshGain = audioCtx.createGain(); whooshGain.gain.value = CFG.whoosh.gain;
    padGain.connect(masterGain); windGain.connect(masterGain); whooshGain.connect(masterGain);

    buildPad();
    buildWind();
    hookBubbles();
  }

  function noteHz(rootHz, st){ return rootHz * Math.pow(2, st/12); }

  function buildPad(){
    // Lowpass smoothing for pad sum
    const lp = audioCtx.createBiquadFilter(); lp.type='lowpass';
    lp.frequency.value = CFG.pad.filterCutoff; lp.Q.value = CFG.pad.filterQ;

    // Stereo chorus (modulated delay L/R)
    const delayL = audioCtx.createDelay(); const delayR = audioCtx.createDelay();
    delayL.delayTime.value = CFG.pad.chorus.depthMs/1000;
    delayR.delayTime.value = (CFG.pad.chorus.depthMs*0.85)/1000;

    const lfoL = audioCtx.createOscillator(); const lfoR = audioCtx.createOscillator();
    lfoL.frequency.value = CFG.pad.chorus.rateHz; lfoR.frequency.value = CFG.pad.chorus.rateHz*1.05;
    const lfoGainL = audioCtx.createGain(); lfoGainL.gain.value = 0.0035;
    const lfoGainR = audioCtx.createGain(); lfoGainR.gain.value = 0.0038;
    lfoL.connect(lfoGainL).connect(delayL.delayTime); lfoR.connect(lfoGainR).connect(delayR.delayTime);
    lfoL.start(); lfoR.start(); lfoNodes.push(lfoL,lfoR,lfoGainL,lfoGainR);

    const splitter = audioCtx.createChannelSplitter(2); const merger = audioCtx.createChannelMerger(2);

    // Faux reverb via stereo delays w/ gentle feedback & tone
    const fbL = audioCtx.createGain(); fbL.gain.value = CFG.pad.delay.feedback;
    const fbR = audioCtx.createGain(); fbR.gain.value = CFG.pad.delay.feedback;
    const toneL = audioCtx.createBiquadFilter(); toneL.type='lowpass'; toneL.frequency.value = CFG.pad.delay.toneHz;
    const toneR = audioCtx.createBiquadFilter(); toneR.type='lowpass'; toneR.frequency.value = CFG.pad.delay.toneHz;
    const revL = audioCtx.createDelay(); revL.delayTime.value = CFG.pad.delay.timeL;
    const revR = audioCtx.createDelay(); revR.delayTime.value = CFG.pad.delay.timeR;
    toneL.connect(fbL).connect(revL); toneR.connect(fbR).connect(revR);
    revL.connect(toneL); revR.connect(toneR);

    padGain.connect(lp).connect(splitter);
    splitter.connect(delayL,0); splitter.connect(delayR,1);
    delayL.connect(revL).connect(merger,0,0); delayR.connect(revR).connect(merger,0,1);
    merger.connect(masterGain);

    CFG.pad.intervals.forEach((st,i)=>{
      const osc = audioCtx.createOscillator();
      osc.type = CFG.pad.oscTypes[i % CFG.pad.oscTypes.length] || 'sine';
      const freq = noteHz(CFG.pad.rootHz, st);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      // vibrato
      const vibr = audioCtx.createOscillator(); vibr.frequency.value = CFG.pad.vibrato.rateHz;
      const vGain = audioCtx.createGain(); vGain.gain.value = CFG.pad.vibrato.depth * freq;
      vibr.connect(vGain).connect(osc.frequency); vibr.start(); lfoNodes.push(vibr,vGain);
      // detune
      osc.detune.value = (CFG.pad.detuneCents[i]||0);
      // voice gain
      const g = audioCtx.createGain(); g.gain.value = (i===0) ? 0.9 : 0.55;
      osc.connect(g).connect(padGain);
      osc.start();
    });
  }

  function buildWind(){
    // White noise → pink-ish via LP + HP + gentle band focus
    const length = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<length;i++) data[i] = (Math.random()*2-1);
    const src = audioCtx.createBufferSource(); src.buffer = buffer; src.loop = true;

    const lp = audioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 1300;
    const hp = audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = CFG.wind.highpassHz; hp.Q.value = 0.707;

    const bpf = audioCtx.createBiquadFilter(); bpf.type='bandpass'; bpf.frequency.value = CFG.wind.bandHz; bpf.Q.value = 1.0/CFG.wind.bandwidth;

    const lfo = audioCtx.createOscillator(); lfo.frequency.value = CFG.wind.fade.rateHz;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = (CFG.wind.fade.max - CFG.wind.fade.min)/2;
    const bias = audioCtx.createConstantSource(); bias.offset.value = (CFG.wind.fade.max + CFG.wind.fade.min)/2;
    const vca = audioCtx.createGain();
    lfo.connect(lfoGain).connect(vca.gain); bias.connect(vca.gain); lfo.start(); bias.start();

    src.connect(lp).connect(hp).connect(bpf).connect(vca).connect(windGain);
    src.start(0);
  }

  function dopplerWhoosh(){
    if(!audioCtx) return;
    const now = audioCtx.currentTime; const dur = CFG.whoosh.dur;
    const len = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0); for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
    const src = audioCtx.createBufferSource(); src.buffer = buf;

    const bpf = audioCtx.createBiquadFilter(); bpf.type='bandpass'; bpf.Q.value = 1.1;
    bpf.frequency.setValueAtTime(CFG.whoosh.bandStartHz, now);
    bpf.frequency.exponentialRampToValueAtTime(CFG.whoosh.bandEndHz, now+dur);

    const pan = new StereoPannerNode(audioCtx, { pan: CFG.whoosh.panStart });
    pan.pan.setValueAtTime(CFG.whoosh.panStart, now);
    pan.pan.linearRampToValueAtTime(CFG.whoosh.panEnd, now+dur);

    const amp = audioCtx.createGain();
    amp.gain.setValueAtTime(0.0, now);
    amp.gain.linearRampToValueAtTime(0.65, now+0.07);
    amp.gain.linearRampToValueAtTime(0.0, now+dur);

    src.connect(bpf).connect(amp).connect(whooshGain);
    amp.connect(pan).connect(masterGain);
    src.start(now);
  }

  // ------------------------- Controls -------------------------------------
  async function toggleAudio(){
    await ensureAudio(); if(!audioCtx) return;
    if(!isOn){ if(audioCtx.state==='suspended') await audioCtx.resume(); isOn=true; }
    else { if(audioCtx.state==='running') await audioCtx.suspend(); isOn=false; }
    const btn = document.getElementById('sound-toggle');
    if(btn){ btn.setAttribute('aria-pressed', String(isOn)); btn.textContent = isOn? 'Sound: On' : 'Sound: Off'; }
  }

  function hookBubbles(){
    document.addEventListener('click', (e)=>{
      const t = e.target.closest('.shape');
      if(t && audioCtx && audioCtx.state==='running') dopplerWhoosh();
    }, true);
  }

  // ------------------------- Boot -----------------------------------------
  ensureToggle();
  function firstGesture(){ ensureAudio(); window.removeEventListener('pointerdown', firstGesture); window.removeEventListener('keydown', firstGesture); }
  window.addEventListener('pointerdown', firstGesture, { once: true });
  window.addEventListener('keydown', firstGesture, { once: true });
})();