// Lightweight WebAudio SFX (spawn/click/nav). Toggle via #sound-toggle.
let ctx = null;
let enabled = (localStorage.getItem('sfx_enabled') === 'true');

function ensureCtx(){
  if (!enabled) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function env(src, duration=0.12, attack=0.005, release=0.08){
  const t0 = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.8, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
  const stopAt = t0 + Math.max(duration, attack + release + 0.02);
  src.connect(g).connect(ctx.destination);
  return { g, stopAt };
}

function tone(freq=440, type='sine', duration=0.12){
  const c = ensureCtx(); if (!c) return;
  const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
  const { stopAt } = env(o, duration);
  o.start(); o.stop(stopAt);
}

function noise(duration=0.2){
  const c = ensureCtx(); if (!c) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0;i<data.length;i++){ data[i] = Math.random()*2-1; }
  const src = c.createBufferSource(); src.buffer = buffer; src.playbackRate.value = 0.6;
  const { stopAt } = env(src, duration, 0.005, duration*0.9);
  src.start(); src.stop(stopAt);
}

export const sfx = {
  spawn(){ if (!enabled) return; tone(420, 'sine', 0.08); },
  click(){ if (!enabled) return; tone(640, 'triangle', 0.07); },
  nav(){ if (!enabled) return; noise(0.12); },
  enabled(){ return enabled; },
  set(on){ enabled = !!on; localStorage.setItem('sfx_enabled', String(enabled)); const btn=document.getElementById('sound-toggle'); if (btn){ btn.setAttribute('aria-pressed', String(enabled)); } if (!enabled && ctx){ try{ctx.close();}catch{} ctx=null; } else if (enabled){ ensureCtx(); } }
};

// Wire toggle button (explicit user gesture unlocks AudioContext)
const btn = document.getElementById('sound-toggle');
if (btn){
  btn.addEventListener('click', () => { sfx.set(!sfx.enabled()); sfx.nav(); });
  btn.setAttribute('aria-pressed', String(enabled));
}
