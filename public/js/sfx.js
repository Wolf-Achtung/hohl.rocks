
let ctx = null;
let enabled = (localStorage.getItem('sfx_enabled') === 'true');
let master=null,bus=null,lowpass=null,delay=null,intervalId=null;
let voices=[];
function ensureCtx(){
  if (!enabled) return null;
  if (!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
  if (ctx.state==='suspended') ctx.resume();
  if (!master){
    master = ctx.createGain(); master.gain.value = 0.32;
    lowpass = ctx.createBiquadFilter(); lowpass.type='lowpass'; lowpass.frequency.value=3800; lowpass.Q.value=0.2;
    delay = ctx.createDelay(1.5); delay.delayTime.value=0.33;
    const fb = ctx.createGain(); fb.gain.value=0.28;
    master.connect(lowpass).connect(ctx.destination);
    lowpass.connect(delay); delay.connect(fb).connect(delay); delay.connect(master);
  }
  if (!bus){ bus = ctx.createGain(); bus.gain.value=0.9; bus.connect(master); }
  return ctx;
}
function makeVoice(freq, type='sine', gain=0.08){
  const o = ctx.createOscillator(); o.type=type; o.frequency.value=freq;
  const g = ctx.createGain(); g.gain.value=gain;
  const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=600; f.Q.value=0.6;
  o.connect(f).connect(g).connect(bus);
  o.start();
  return {osc:o,gain:g,filter:f};
}
function clearVoices(){ voices.forEach(v=>{ try{v.osc.stop();}catch{} try{v.osc.disconnect();}catch{} }); voices=[]; }
const CHORDS = [
  [220, 261.63, 329.63, 440*1.1225],
  [174.61, 220, 261.63, 349.23],
  [130.81*2, 164.81*2, 196*2, 246.94*2],
  [196, 246.94, 293.66, 392]
];
function playChord(idx){
  const c = ensureCtx(); if (!c) return;
  clearVoices();
  const chord = CHORDS[idx % CHORDS.length];
  chord.forEach((f,i)=>voices.push(makeVoice(f*(i===1?0.999:1.001), i%2?'triangle':'sine', 0.06+0.01*i)));
  const lfo = c.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.07;
  const lfoGain = c.createGain(); lfoGain.gain.value=1.3;
  lfo.connect(lfoGain); voices.forEach(v=>lfoGain.connect(v.osc.frequency));
  lfo.start(); voices.push({osc:lfo,gain:lfoGain,filter:null});
}
function startAmbient(){ const c=ensureCtx(); if(!c) return; stopAmbient(); let idx=0; playChord(idx); intervalId=setInterval(()=>{ idx=(idx+1)%CHORDS.length; playChord(idx); }, 12000); }
function stopAmbient(){ if(intervalId){ clearInterval(intervalId); intervalId=null; } clearVoices(); }
function blip(freq){ const c=ensureCtx(); if(!c) return; const o=c.createOscillator(); o.type='sine'; o.frequency.value=freq; const g=c.createGain(); g.gain.value=0.001; g.gain.exponentialRampToValueAtTime(0.4, c.currentTime+0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+0.14); o.connect(g).connect(bus); o.start(); o.stop(c.currentTime+0.16); }
export const sfx = {
  spawn(){ if(!enabled) return; blip(660); blip(880); },
  click(){ if(!enabled) return; blip(760); },
  nav(){ if(!enabled) return; blip(520); },
  enabled(){ return enabled; },
  set(on){ enabled = !!on; localStorage.setItem('sfx_enabled', String(enabled)); const btn=document.getElementById('sound-toggle'); if(btn) btn.setAttribute('aria-pressed', String(enabled)); if(!enabled && ctx){ stopAmbient(); try{ctx.close();}catch{} ctx=null; master=null; bus=null; } else if (enabled){ ensureCtx(); startAmbient(); } }
};
const btn=document.getElementById('sound-toggle');
if(btn){ btn.addEventListener('click',()=>{ sfx.set(!sfx.enabled()); }); btn.setAttribute('aria-pressed', String(enabled)); if(enabled){ setTimeout(()=>sfx.set(true),0); } }
