/* ambient-sound.js — generative Ambient (Radiohead/Hopkins inspiriert) */
(function(){
  let ctx, master, running=false, current='radiohead', nodes=[];

  function gain(target, to, t=2){ const now=ctx.currentTime; target.cancelScheduledValues(now); target.setValueAtTime(target.value, now); target.linearRampToValueAtTime(to, now+t); }
  function note(freq, dur, type='sine', level=0.06){
    const o=ctx.createOscillator(); o.type=type; o.frequency.value=freq;
    const g=ctx.createGain(); g.gain.value=0; o.connect(g).connect(master);
    const lfo=ctx.createOscillator(); const lfoGain=ctx.createGain(); lfo.frequency.value=0.08; lfoGain.gain.value=freq*0.008; lfo.connect(lfoGain).connect(o.frequency);
    o.start(); lfo.start();
    gain(g.gain, level, 2.0);
    setTimeout(()=>{ gain(g.gain, 0.0, 2.0); setTimeout(()=>{ o.stop(); lfo.stop(); g.disconnect(); }, 2100); }, dur*1000);
    nodes.push(o,g,lfo,lfoGain);
  }

  function noise(duration=6, level=0.02){
    const b=ctx.createBuffer(1, ctx.sampleRate*duration, ctx.sampleRate); const data=b.getChannelData(0);
    for(let i=0;i<data.length;i++){ data[i]=(Math.random()*2-1)*0.5; }
    const s=ctx.createBufferSource(); s.buffer=b; const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1200;
    const g=ctx.createGain(); g.gain.value=level; s.connect(f).connect(g).connect(master); s.start();
    setTimeout(()=>{ g.gain.linearRampToValueAtTime(0, ctx.currentTime+2); setTimeout(()=>{ s.stop(); }, 2100); }, duration*1000);
    nodes.push(s,f,g);
  }

  function tick(){
    if(!running) return;
    const base = (current==='radiohead'? 196 : current==='hopkins'? 174.61 : 207.65); // G3 / F3 / G#3
    const scale = current==='radiohead' ? [0,3,5,7,10] : current==='hopkins' ? [0,2,5,7,9] : [0,2,7,9,12];
    // 2–3 Pads
    const voices = 2 + Math.floor(Math.random()*2);
    for(let i=0;i<voices;i++){
      const semi = scale[(Math.random()*scale.length)|0];
      const freq = base * Math.pow(2, semi/12);
      note(freq, 7+Math.random()*6, (i%2?'sine':'triangle'), 0.05+Math.random()*0.03);
    }
    // Texture
    if(Math.random()<0.7) noise(5+Math.random()*4, 0.015+Math.random()*0.02);
    // Next schedule
    setTimeout(tick, 3000+Math.random()*1500);
  }

  function build(){
    ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
  }

  function start(mode){
    current = mode || current;
    if(!ctx) build();
    if(!running){ running=true; gain(master.gain, 0.6, 3); tick(); }
  }
  function stop(){ if(!ctx) return; running=false; gain(master.gain, 0.0, 2); }
  function toggle(){ if(!ctx || !running){ start(current); } else { stop(); } }

  // UI wiring
  addEventListener('DOMContentLoaded', ()=>{
    const dock=document.getElementById('ambient'); if(!dock) return;
    dock.addEventListener('click', (e)=>{
      const b=e.target.closest('button'); if(!b) return;
      if(b.dataset.act==='toggle'){ toggle(); b.classList.toggle('on'); return; }
      if(b.dataset.mode){ current=b.dataset.mode; if(running){ stop(); setTimeout(()=>start(current), 300); } }
    });
    // First user gesture starts audio if toggled on
    const first=()=>{ document.removeEventListener('pointerdown', first); /* don’t autostart by default */ };
    document.addEventListener('pointerdown', first);
  });

  // Expose for debugging
  window.Ambient={ start, stop, toggle };
})();