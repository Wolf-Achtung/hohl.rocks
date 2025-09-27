/* public/js/ambient-radiohead.js — generative ambient (Radiohead-ish) */
(function(){
  let ctx, master, running=false, started=false;
  let nodes=[];
  function mkImpulse(ctx, seconds=3.2, decay=3.0){
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for(let ch=0; ch<2; ch++){
      const d = buf.getChannelData(ch);
      for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay);
    }
    return buf;
  }
  function start(){
    if(running) return;
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
      const conv = ctx.createConvolver(); conv.buffer = mkImpulse(ctx, 3.8, 2.6);
      const wet = ctx.createGain(); wet.gain.value = 0.65; const dry = ctx.createGain(); dry.gain.value = 0.55;
      wet.connect(master); dry.connect(master); master._wet = wet; master._dry = dry;
    }
    running = true; started = true;
    schedule();
    setLabel(true);
  }
  function stop(){
    running = false;
    nodes.forEach(n=>{ try{ n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} });
    nodes = [];
    setLabel(false);
  }
  function chord(root){ const base = 440 * Math.pow(2, (root-69)/12); const semis=[-7,0,3,7,14]; return semis.map(s=> base*Math.pow(2,s/12)); }
  function rnd(a,b){ return a + Math.random()*(b-a); }
  function pad(freq, dur, t0){
    const o = ctx.createOscillator(); o.type = Math.random()<.5?'sawtooth':'triangle';
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=rnd(800,1600);
    const lfo = ctx.createOscillator(); lfo.frequency.value=rnd(0.07,0.16);
    const lfoGain = ctx.createGain(); lfoGain.gain.value=rnd(8,18); lfo.connect(lfoGain); lfoGain.connect(f.detune); lfo.start(t0);
    o.frequency.setValueAtTime(freq*rnd(0.997,1.003), t0);
    o.connect(f); f.connect(g); g.connect(master._dry); const send=ctx.createGain(); send.gain.value=0.7; g.connect(send); send.connect(master._wet);
    const a=rnd(2.5,4.0), s=dur-a-1.5; g.gain.linearRampToValueAtTime(0.22, t0+a); g.gain.linearRampToValueAtTime(0.18, t0+a+Math.max(0.4,s)); g.gain.linearRampToValueAtTime(0.0001, t0+dur);
    o.start(t0); nodes.push(o,g,f,lfo,lfoGain,send); o.stop(t0+dur+0.1);
  }
  function schedule(){
    if(!running) return;
    const t0 = ctx.currentTime + 0.05; const roots=[62,57,59,55]; const freqs = chord(roots[(Math.random()*roots.length)|0]); const dur=rnd(8,12);
    freqs.forEach(f=>pad(f,dur,t0));
    const noise = ctx.createBufferSource(); const nb = ctx.createBuffer(1, ctx.sampleRate*dur, ctx.sampleRate);
    const data=nb.getChannelData(0); for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.0025; noise.buffer=nb; const ng=ctx.createGain(); ng.gain.setValueAtTime(0.18, t0); noise.connect(ng); ng.connect(master._wet); noise.start(t0); noise.stop(t0+dur); nodes.push(noise,ng);
    setTimeout(schedule, dur*1000*0.9);
  }
  let chip;
  function ensureChip(){
    if(chip) return chip;
    chip = document.createElement('button');
    chip.id='sound-chip'; chip.textContent='🔇 Klang';
    Object.assign(chip.style,{position:'fixed',right:'20px',bottom:'24px',zIndex:1500,background:'rgba(12,16,22,.60)',color:'#eaf2ff',border:'1px solid rgba(255,255,255,.18)',borderRadius:'999px',padding:'8px 12px',cursor:'pointer',backdropFilter:'blur(8px)'});
    chip.onclick=()=> running ? stop() : start();
    document.addEventListener('pointerdown', ()=>{ if(!started) try{ start(); }catch(e){} }, { once:true });
    document.body.appendChild(chip);
    return chip;
  }
  function setLabel(on){ ensureChip().textContent = on ? '🔊 Klang' : '🔇 Klang'; }
  window.addEventListener('DOMContentLoaded', ensureChip);
  window.Ambient = { ensureStart: ()=>{ ensureChip(); start(); }, start, stop };
})();