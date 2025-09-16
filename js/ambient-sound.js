/* ambient-sound.js — Radiohead-ish ambient + output level */
(function(){
  let ctx, master, running=false, analyser, data;
  function gain(t,to,d=2){const n=ctx.currentTime;t.cancelScheduledValues(n);t.setValueAtTime(t.value,n);t.linearRampToValueAtTime(to,n+d);}
  function note(freq,dur,lv=0.06){const o=ctx.createOscillator();o.type='triangle';o.frequency.value=freq;const g=ctx.createGain();g.gain.value=0;o.connect(g).connect(master);
    const l=ctx.createOscillator(), lg=ctx.createGain(); l.frequency.value=0.09; lg.gain.value=freq*0.0075; l.connect(lg).connect(o.frequency);
    o.start(); l.start(); gain(g.gain,lv,1.8); setTimeout(()=>{gain(g.gain,0,2); setTimeout(()=>{o.stop();l.stop();g.disconnect();},2100);},dur*1000);}
  function noise(d=7,lv=0.02){const b=ctx.createBuffer(1,ctx.sampleRate*d,ctx.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*0.45;
    const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1100;const g=ctx.createGain();g.gain.value=lv;s.connect(f).connect(g).connect(master);
    s.start(); setTimeout(()=>{g.gain.linearRampToValueAtTime(0,ctx.currentTime+2); setTimeout(()=>s.stop(),2100);},d*1000);}
  function loop(){if(!running)return;const base=196,scale=[0,3,5,7,10];const v=2+Math.floor(Math.random()*2);for(let i=0;i<v;i++){const semi=scale[(Math.random()*scale.length)|0];note(base*Math.pow(2,semi/12),7+Math.random()*6,0.05+Math.random()*0.03);} if(Math.random()<0.7)noise(5+Math.random()*4,0.015+Math.random()*0.02); setTimeout(loop,3600+Math.random()*1800);}
  function build(){ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); master=ctx.createGain(); master.gain.value=0; analyser=ctx.createAnalyser(); analyser.fftSize=2048; data=new Uint8Array(analyser.frequencyBinCount); master.connect(analyser).connect(ctx.destination); (function meter(){ if(!analyser){ requestAnimationFrame(meter); return;} analyser.getByteTimeDomainData(data); let sum=0; for(let i=0;i<data.length;i++){const d=data[i]-128; sum+=d*d;} window.__ambientLevel=Math.min(1, Math.sqrt(sum/data.length)/20); requestAnimationFrame(meter); })(); }
  function start(){if(!ctx)build(); if(!running){running=true; gain(master.gain,0.6,3); loop();}}
  function stop(){if(!ctx)return; running=false; gain(master.gain,0,2);}
  function toggle(){(!ctx||!running)?start():stop();}
  document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('ambient'); if(!d)return; d.addEventListener('click',e=>{const b=e.target.closest('button'); if(!b)return; if(b.dataset.act==='toggle'){toggle(); b.classList.toggle('on');}});
    const first=()=>{document.removeEventListener('pointerdown',first);}; document.addEventListener('pointerdown',first);});
  window.Ambient={start,stop,toggle};
})();