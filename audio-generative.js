/* desert-audio-pack / audio-generative.js
   Fully generative ambient pad + wind + Doppler whoosh using WebAudio.
   - Adds a floating "Sound: Off/On" toggle (bottom-left) automatically.
   - Starts audio after first user interaction (autoplay policy safe).
   - Triggers Doppler whoosh on .shape click (if shapes exist).
   - No external files required.

   Usage:
     <link rel="stylesheet" href="audio-generative.css">
     <script defer src="audio-generative.js"></script>
*/

(function () {
  // ---------- Utilities ----------------------------------------------------
  const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- State --------------------------------------------------------
  let audioCtx, masterGain, comp, padGain, windGain, whooshGain;
  let padNodes = [], windNode = null;
  let lfoNodes = [];
  let isOn = false;

  // Config (tune to taste)
  const CFG = {
    pad: {
      // A minor-ish, distant: use 110Hz root (A2) for depth
      rootHz: 110,
      intervals: [0, 7, 12, 19],  // unison, +5th, +oct, +12th (adds shimmer)
      detuneCents: [ -8, +9, -3, +6 ],
      gain: 0.20,
      filterCutoff: 1200,  // mellow
      filterQ: 0.6,
      chorus: { depthMs: 6, rateHz: 0.06 },
      delay:  { timeL: 0.28, timeR: 0.33, feedback: 0.18, toneHz: 1500 },
      vibrato: { depth: 0.008, rateHz: 0.045 }, // subtle
    },
    wind: {
      gain: 0.14,
      bandHz: 800,
      bandwidth: 1.1,     // Q inverse feel; use BPF Q below
      highpassHz: 180,
      fade: { min: 0.08, max: 0.22, rateHz: 0.02 }, // breathing wind
    },
    whoosh: {
      gain: 0.45,
      dur: 0.7,
      panStart: -1, panEnd: +1,
      bandStartHz: 1800, bandEndHz: 650, // descending sweep
    }
  };

  // ---------- DOM: toggle button (injected) -------------------------------
  function ensureToggle() {
    if (document.getElementById('sound-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'sound-toggle';
    btn.className = 'sound-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Sound: Off';
    btn.addEventListener('click', async () => {
      await toggleAudio();
    });
    document.body.appendChild(btn);
  }

  // ---------- Audio graph --------------------------------------------------
  async function ensureAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 20;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    masterGain.connect(comp).connect(audioCtx.destination);

    // Busses
    padGain = audioCtx.createGain(); padGain.gain.value = CFG.pad.gain;
    windGain = audioCtx.createGain(); windGain.gain.value = CFG.wind.gain;
    whooshGain = audioCtx.createGain(); whooshGain.gain.value = CFG.whoosh.gain;
    padGain.connect(masterGain);
    windGain.connect(masterGain);
    whooshGain.connect(masterGain);

    buildPad();
    buildWind();
    hookBubbles();
  }

  function noteHz(rootHz, semitones) {
    return rootHz * Math.pow(2, semitones / 12);
  }

  function buildPad() {
    // Filter + stereo chorus + gentle stereo delay as faux reverb
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = CFG.pad.filterCutoff;
    lp.Q.value = CFG.pad.filterQ;

    // Chorus (two modulated delay lines L/R)
    const delayL = audioCtx.createDelay();
    const delayR = audioCtx.createDelay();
    delayL.delayTime.value = CFG.pad.chorus.depthMs / 1000;
    delayR.delayTime.value = (CFG.pad.chorus.depthMs * 0.8) / 1000;

    const lfoL = audioCtx.createOscillator();
    const lfoR = audioCtx.createOscillator();
    lfoL.frequency.value = CFG.pad.chorus.rateHz;
    lfoR.frequency.value = CFG.pad.chorus.rateHz * 1.1;

    const lfoGainL = audioCtx.createGain(); lfoGainL.gain.value = 0.004;
    const lfoGainR = audioCtx.createGain(); lfoGainR.gain.value = 0.0045;
    lfoL.connect(lfoGainL).connect(delayL.delayTime);
    lfoR.connect(lfoGainR).connect(delayR.delayTime);
    lfoL.start(); lfoR.start(); lfoNodes.push(lfoL, lfoR, lfoGainL, lfoGainR);

    const splitter = audioCtx.createChannelSplitter(2);
    const merger = audioCtx.createChannelMerger(2);

    // Faux reverb: stereo delays with slight feedback and tone
    const fbL = audioCtx.createGain(); fbL.gain.value = CFG.pad.delay.feedback;
    const fbR = audioCtx.createGain(); fbR.gain.value = CFG.pad.delay.feedback;
    const toneL = audioCtx.createBiquadFilter(); toneL.type='lowpass'; toneL.frequency.value = CFG.pad.delay.toneHz;
    const toneR = audioCtx.createBiquadFilter(); toneR.type='lowpass'; toneR.frequency.value = CFG.pad.delay.toneHz;
    const revL = audioCtx.createDelay(); revL.delayTime.value = CFG.pad.delay.timeL;
    const revR = audioCtx.createDelay(); revR.delayTime.value = CFG.pad.delay.timeR;

    // Feedback paths
    toneL.connect(fbL).connect(revL);
    toneR.connect(fbR).connect(revR);
    revL.connect(toneL); revR.connect(toneR);

    // Routing
    padGain.connect(lp).connect(splitter);
    splitter.connect(delayL, 0);
    splitter.connect(delayR, 1);
    delayL.connect(revL).connect(merger, 0, 0);
    delayR.connect(revR).connect(merger, 0, 1);
    merger.connect(masterGain);

    // Build oscillators
    CFG.pad.intervals.forEach((st, i) => {
      const osc = audioCtx.createOscillator();
      const type = (i % 2 === 0) ? 'triangle' : 'sawtooth';
      osc.type = type;
      const freq = noteHz(CFG.pad.rootHz, st);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      // subtle vibrato
      const vibrato = audioCtx.createOscillator();
      vibrato.frequency.value = CFG.pad.vibrato.rateHz;
      const vibGain = audioCtx.createGain(); vibGain.gain.value = CFG.pad.vibrato.depth * freq;
      vibrato.connect(vibGain).connect(osc.frequency);
      vibrato.start(); lfoNodes.push(vibrato, vibGain);
      // detune
      osc.detune.value = CFG.pad.detuneCents[i] || 0;
      // individual voice gain for balancing
      const voiceGain = audioCtx.createGain();
      voiceGain.gain.value = (i === 0) ? 0.9 : 0.6;
      osc.connect(voiceGain).connect(padGain);
      osc.start();
      padNodes.push(osc, voiceGain);
    });
  }

  function buildWind() {
    // Create looping noise buffer
    const length = audioCtx.sampleRate * 2; // 2 seconds loop
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      // white noise
      data[i] = (Math.random() * 2 - 1);
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Shape noise -> "wind": bandpass + highpass, slow amplitude LFO
    const bpf = audioCtx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = CFG.wind.bandHz;
    bpf.Q.value = 1.0 / CFG.wind.bandwidth;

    const hpf = audioCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = CFG.wind.highpassHz;
    hpf.Q.value = 0.707;

    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = CFG.wind.fade.rateHz;
    const lfoAmp = audioCtx.createGain();
    lfoAmp.gain.value = (CFG.wind.fade.max - CFG.wind.fade.min) / 2;
    const bias = audioCtx.createConstantSource();
    bias.offset.value = (CFG.wind.fade.max + CFG.wind.fade.min) / 2;
    const windVCA = audioCtx.createGain();

    lfo.connect(lfoAmp);
    lfoAmp.connect(windVCA.gain);
    bias.connect(windVCA.gain);
    lfo.start(); bias.start(); lfoNodes.push(lfo, lfoAmp, bias);

    src.connect(bpf).connect(hpf).connect(windVCA).connect(windGain);
    src.start(0);
    windNode = src;
  }

  function dopplerWhoosh() {
    if (!audioCtx) return;
    const dur = CFG.whoosh.dur;
    const now = audioCtx.currentTime;

    // Whoosh via filtered noise + band sweep + pan sweep
    // Create short noise burst
    const len = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    // Bandpass with sweeping center frequency (descending)
    const bpf = audioCtx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.Q.value = 1.2;
    bpf.frequency.setValueAtTime(CFG.whoosh.bandStartHz, now);
    bpf.frequency.exponentialRampToValueAtTime(CFG.whoosh.bandEndHz, now + dur);

    // Stereo pan sweep
    const pan = new StereoPannerNode(audioCtx, { pan: CFG.whoosh.panStart });
    pan.pan.setValueAtTime(CFG.whoosh.panStart, now);
    pan.pan.linearRampToValueAtTime(CFG.whoosh.panEnd, now + dur);

    // Amplitude envelope
    const amp = audioCtx.createGain();
    amp.gain.setValueAtTime(0.0, now);
    amp.gain.linearRampToValueAtTime(0.9, now + 0.06);
    amp.gain.linearRampToValueAtTime(0.0, now + dur);

    src.connect(bpf).connect(amp).connect(whooshGain);
    amp.connect(pan).connect(masterGain);
    src.start(now);
  }

  // ---------- Controls -----------------------------------------------------
  async function toggleAudio() {
    await ensureAudio();
    if (!audioCtx) return;
    if (!isOn) {
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      isOn = true;
    } else {
      if (audioCtx.state === 'running') await audioCtx.suspend();
      isOn = false;
    }
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(isOn));
      btn.textContent = isOn ? 'Sound: On' : 'Sound: Off';
    }
  }

  function hookBubbles() {
    // Trigger Doppler on bubble click (if bubbles exist)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.shape');
      if (target && audioCtx && audioCtx.state === 'running') {
        dopplerWhoosh();
      }
    }, true);
  }

  // ---------- Boot ---------------------------------------------------------
  // Create the toggle and wait for first interaction to init context
  ensureToggle();
  function firstUserGesture() {
    ensureAudio();
    window.removeEventListener('pointerdown', firstUserGesture);
    window.removeEventListener('keydown', firstUserGesture);
  }
  window.addEventListener('pointerdown', firstUserGesture, { once: true });
  window.addEventListener('keydown', firstUserGesture, { once: true });

})();