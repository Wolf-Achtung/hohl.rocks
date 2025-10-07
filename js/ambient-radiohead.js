/* public/js/ambient-radiohead.js — generative ambient (Radiohead-ish) */
(function(){
  let ctx, master, running=false, started=false;
  let nodes=[];
  function mkImpulse(ctx, seconds=3.2, decay=3.0){
    const rate = ctx.sampleRate;
    const len = rate * seconds;
    const impulse = ctx.createBuffer(2, len, rate);
    for (let ch=0; ch<2; ch++){
      const data = impulse.getChannelData(ch);
      for (let i=0;i<len;i++){
        data[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay);
      }
    }
    return impulse;
  }
  function startAudio(){
    if (running) return;
    if (!ctx) {
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
      // Global reverb
      const conv = ctx.createConvolver(); conv.buffer = mkImpulse(ctx, 3.8, 2.6);
      const wet = ctx.createGain(); wet.gain.value = 0.65;
      const dry = ctx.createGain(); dry.gain.value = 0.55;
      wet.connect(master); dry.connect(master);
      master._busWet = wet; master._busDry = dry;
    }
    running = true; started = true;
    schedulePads();
    uiSet(true);
  }
  function stopAudio(){
    running = false;
    nodes.forEach(n=>{ try{ n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} });
    nodes = [];
    uiSet(false);
  }
  function chordFreqs(root){
    // minor‑add9-ish: [0, 3, 7, 14] with a 5th below
    const base = 440 * Math.pow(2, (root-69)/12); // MIDI to Hz
    const semis = [-7, 0, 3, 7, 14];
    return semis.map(s => base * Math.pow(2, s/12));
  }
  function rnd(a,b){ return a + Math.random()*(b-a); }
  function mkPad(freq, dur, t0){
    const o = ctx.createOscillator(); o.type = Math.random() < .5 ? 'sawtooth' : 'triangle';
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
    const lfo = ctx.createOscillator(); lfo.frequency.value = rnd(0.07, 0.16);
    const lfoGain = ctx.createGain(); lfoGain.gain.value = rnd(8, 18);
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value = rnd(800, 1600);
    // detune slight
    o.frequency.setValueAtTime(freq * rnd(0.997,1.003), t0);
    lfo.connect(lfoGain); lfoGain.connect(f.detune); lfo.start(t0);
    o.connect(f); f.connect(g);
    // send to buses
    g.connect(master._busDry);
    const send = ctx.createGain(); send.gain.value = 0.7;
    g.connect(send); send.connect(master._busWet);
    o.start(t0);
    // envelope
    const a = rnd(2.5, 4.0), s = dur - a - 1.5;
    g.gain.linearRampToValueAtTime(0.22, t0 + a);
    g.gain.linearRampToValueAtTime(0.18, t0 + a + Math.max(0.4, s));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    nodes.push(o, g, f, lfo, lfoGain, send);
    o.stop(t0 + dur + 0.1);
  }
  function schedulePads(){
    if (!running) return;
    const t0 = ctx.currentTime + 0.05;
    // choose a root progression (Radiohead-ish): D, A, B, G  (MIDI 62, 57, 59, 55)
    const roots = [62, 57, 59, 55];
    const root = roots[Math.floor(Math.random()*roots.length)];
    const freqs = chordFreqs(root);
    const dur = rnd(8, 12);
    freqs.forEach((f)=> mkPad(f, dur, t0));
    // subtle noise
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0); for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.0025;
    noise.buffer = buf; const ng = ctx.createGain(); ng.gain.setValueAtTime(0.18, t0);
    noise.connect(ng); ng.connect(master._busWet); noise.start(t0); noise.stop(t0+dur);
    nodes.push(noise, ng);
    setTimeout(schedulePads, dur*1000*0.9);
  }
  // --- UI chip (bottom-right) ---
  let chip;
  function uiEnsure(){
    if (chip) return chip;
    chip = document.createElement('button');
    chip.id = 'sound-chip';
    chip.textContent = '🔇 Klang';
    Object.assign(chip.style, {
      position:'fixed', right:'20px', bottom:'24px', zIndex: 1500,
      background:'rgba(12,16,22,.60)', color:'#eaf2ff',
      border:'1px solid rgba(255,255,255,.18)', borderRadius:'999px',
      padding:'8px 12px', cursor:'pointer', backdropFilter:'blur(8px)'
    });
    chip.onclick = ()=> running ? stopAudio() : startAudio();
    document.addEventListener('pointerdown', ()=>{ if (!started) try { startAudio(); } catch(e){} }, { once:true });
    document.body.appendChild(chip);
    return chip;
  }
  function uiSet(on){ uiEnsure().textContent = on ? '🔊 Klang' : '🔇 Klang'; }
  // expose (so other scripts can trigger start on any user action)
  window.Ambient = { ensureStart: ()=>{ uiEnsure(); startAudio(); }, start: startAudio, stop: stopAudio };
  // lazy create chip
  window.addEventListener('DOMContentLoaded', uiEnsure);
})();