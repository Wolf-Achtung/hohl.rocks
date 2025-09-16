/* ambient-sound.js — Radiohead-leaning Ambient (single toggle) */
(function(){
  let ctx, master, running=false, nodes=[];

  function gain(target, to, t=2){ const now=ctx.currentTime; target.cancelScheduledValues(now); target.setValueAtTime(target.value, now); target.linearRampToValueAtTime(to, now+t); }
  function note(freq, dur, level=0.06){
    const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=freq;
    const g=ctx.createGain(); g.gain.value=0; o.connect(g).connect(master);
    const lfo=ctx.createOscillator(); const lfoGain=ctx.createGain(); lfo.frequency.value=0.09; lfoGain.gain.value=freq*0.0075; lfo.connect(lfoGain).connect(o.frequency);
    o.start(); lfo.start();
    gain(g.gain, level, 1.8);
    setTimeout(()=>{ gain(g.gain, 0.0, 2.0); setTimeout(()=>{ o.stop(); lfo.stop(); g.disconnect(); }, 2100); }, dur*1000);
    nodes.push(o,g,lfo,lfoGain);
  }
  function noise(duration=7, level=0.02){
    const b=ctx.createBuffer(1, ctx.sampleRate*duration, ctx.sampleRate); const data=b.getChannelData(0);
    for(let i=0;i<data.length;i++){ data[i]=(Math.random()*2-1)*0.45; }
    const s=ctx.createBufferSource(); s.buffer=b; const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1100;
    const g=ctx.createGain(); g.gain.value=level; s.connect(f).connect(g).connect(master); s.start();
    setTimeout(()=>{ g.gain.linearRampToValueAtTime(0, ctx.currentTime+2); setTimeout(()=>{ s.stop(); }, 2100); }, duration*1000);
    nodes.push(s,f,g);
  }
  function tick(){
    if(!running) return;
    const base=196; const scale=[0,3,5,7,10]; // Radiohead-ish minor-ish palette
    const voices=2 + Math.floor(Math.random()*2);
    for(let i=0;i<voices;i++){
      const semi=scale[(Math.random()*scale.length)|0];
      const freq=base*Math.pow(2,semi/12);
      note(freq, 7+Math.random()*6, 0.05+Math.random()*0.03);
    }
    if(Math.random()<0.7) noise(5+Math.random()*4, 0.015+Math.random()*0.02);
    setTimeout(tick, 3200+Math.random()*1600);
  }
  function build(){
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
  }
  function start(){ if(!ctx) build(); if(!running){ running=true; gain(master.gain, 0.6, 3); tick(); } }
  function stop(){ if(!ctx) return; running=false; gain(master.gain, 0.0, 2); }
  function toggle(){ if(!ctx || !running){ start(); } else { stop(); } }

  addEventListener('DOMContentLoaded', ()=>{
    const dock=document.getElementById('ambient'); if(!dock) return;
    dock.addEventListener('click', (e)=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.act==='toggle'){ toggle(); b.classList.toggle('on'); }});
    const first=()=>{ document.removeEventListener('pointerdown', first); /* user gesture gate */ };
    document.addEventListener('pointerdown', first);
  });
  window.Ambient={ start, stop, toggle };
})();