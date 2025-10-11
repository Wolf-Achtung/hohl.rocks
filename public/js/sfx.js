
let ctx = null;
let enabled = (localStorage.getItem('sfx_enabled') === 'true');
let master = null, bus = null, padOsc = [], padLFO = null, noiseSrc = null, noiseF = null, delay = null;

function ensureCtx(){
  if (!enabled) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  if (!master){
    master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(master);
    delay = ctx.createDelay(1.2); delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    delay.connect(fb).connect(delay); // feedback
    bus.connect(delay).connect(master);
  }
  return ctx;
}

function env(src, tA=0.005, tR=0.18, peak=0.8){
  const t0 = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + tA);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(tR, 0.05));
  src.connect(g).connect(bus);
}

function tone(freq=440, type='sine', tA=0.005, tR=0.18, peak=0.8){
  const c = ensureCtx(); if (!c) return;
  const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
  env(o, tA, tR, peak);
  const stopAt = c.currentTime + tA + tR + 0.02;
  o.start(); o.stop(stopAt);
}

function noise(duration=0.3){
  const c = ensureCtx(); if (!c) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0;i<data.length;i++){ data[i] = Math.random()*2-1; }
  const src = c.createBufferSource(); src.buffer = buffer;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 0.5;
  src.connect(f); env(f, 0.008, duration*0.9, 0.6);
  src.start(); src.stop(c.currentTime + duration + 0.1);
}

// --- Ambient engine (Radiohead/Jon Hopkins-ish, ohne Samples, CPU-sparsam) ---
function startAmbient(){
  const c = ensureCtx(); if (!c) return;
  stopAmbient();

  // Two detuned saw pads with slow filter sweep
  const base = 110; // A2
  const freqs = [base, base*1.25, base*1.5, base*2]; // A-D-F#-A
  padLFO = c.createOscillator(); padLFO.type = 'sine'; padLFO.frequency.value = 0.06;
  const lfoGain = c.createGain(); lfoGain.gain.value = 120; // Hz sweep
  padLFO.connect(lfoGain);

  freqs.forEach((f, i) => {
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f + (i%2 ? -0.4 : 0.4);
    const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 420 + i*20; filt.Q.value = 0.8;
    lfoGain.connect(filt.frequency);
    const g = c.createGain(); g.gain.value = 0.08 + i*0.02;
    o.connect(filt).connect(g).connect(bus);
    o.start();
    padOsc.push(o, filt, g);
  });
  padLFO.start();

  // Soft noise bed
  noiseSrc = c.createBufferSource();
  const dur = 2.0;
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0;i<data.length;i++){ data[i] = (Math.random()*2-1) * 0.45; }
  noiseSrc.buffer = buffer; noiseSrc.loop = true;
  noiseF = c.createBiquadFilter(); noiseF.type = 'bandpass'; noiseF.frequency.value = 600; noiseF.Q.value = 0.6;
  noiseSrc.connect(noiseF).connect(bus);
  noiseSrc.start();
}

function stopAmbient(){
  if (!ctx) return;
  try{ padOsc.forEach(n => { if (n.stop) n.stop(ctx.currentTime + 0.03); if (n.disconnect) n.disconnect(); }); }catch{}
  padOsc = [];
  try{ if (padLFO){ padLFO.stop(); padLFO.disconnect(); } }catch{}
  padLFO = null;
  try{ if (noiseSrc){ noiseSrc.stop(); noiseSrc.disconnect(); } }catch{}
  noiseSrc = null; noiseF = null;
}

function arpeggio(){
  const c = ensureCtx(); if (!c) return;
  const scale = [0, 3, 7, 10]; // A minor vibes
  const base = 440;
  for (let i=0;i<3;i++){
    const s = scale[(Math.random()*scale.length)|0];
    const f = base * Math.pow(2, (s-12)/12);
    setTimeout(() => tone(f, 'triangle', 0.01, 0.18, 0.35), i*120);
  }
}

export const sfx = {
  spawn(){ if (!enabled) return; arpeggio(); },
  click(){ if (!enabled) return; tone(700, 'sine', 0.008, 0.12, 0.5); },
  nav(){ if (!enabled) return; noise(0.15); },
  enabled(){ return enabled; },
  set(on){ enabled = !!on; localStorage.setItem('sfx_enabled', String(enabled)); const btn=document.getElementById('sound-toggle'); if (btn){ btn.setAttribute('aria-pressed', String(enabled)); } if (!enabled && ctx){ stopAmbient(); try{ctx.close();}catch{} ctx=null; } else if (enabled){ ensureCtx(); startAmbient(); } }
};

// Toggle button
const btn = document.getElementById('sound-toggle');
if (btn){
  btn.addEventListener('click', () => { sfx.set(!sfx.enabled()); sfx.nav(); });
  btn.setAttribute('aria-pressed', String(enabled));
  if (enabled) { // auto-resume ambient if remembered on
    setTimeout(() => { sfx.set(true); }, 0);
  }
}
