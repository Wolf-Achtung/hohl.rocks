// public/js/ambient-radiohead.js
// Subtiler On-Device-Ambientsound. Start erst nach User-Geste (DSGVO-freundlich).
class RadioheadAmbient {
  constructor(){
    this.ctx = null;
    this.master = null;
    this.noise = null;
    this.lfo = null;
    this.filter = null;
    this.started = false;
    this.gainTarget = .0;
  }
  ensureStart(){
    if (this.started) return;
    try{
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.0;
      this.filter = this.ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 900;
      this.master.connect(this.filter); this.filter.connect(this.ctx.destination);

      // noise
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.15;
      const src = this.ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
      src.connect(this.master); src.start();
      this.noise = src;

      // lfo
      this.lfo = {phase:0, speed:0.0009};

      const tick = ()=>{
        if (!this.ctx) return;
        this.lfo.phase += this.lfo.speed * (1 + Math.random()*0.05);
        const lfoVal = (Math.sin(this.lfo.phase)+1)/2; // 0..1
        const f = 800 + lfoVal*500;
        this.filter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.08);

        // smooth gain
        const gNow = this.master.gain.value;
        const gNext = gNow + (this.gainTarget - gNow) * 0.02;
        this.master.gain.setTargetAtTime(gNext, this.ctx.currentTime, 0.05);

        requestAnimationFrame(tick);
      };
      tick();

      this.started = true;
    }catch(e){/* ignore */}
  }
  setActive(active){
    if (!this.started) return;
    this.gainTarget = active ? 0.18 : 0.0;
  }
}
const Ambient = new RadioheadAmbient();
window.Ambient = Ambient;

// Start über Button
const btn = document.getElementById('sound-toggle');
btn?.addEventListener('click', ()=>{
  Ambient.ensureStart();
  const pressed = btn.getAttribute('aria-pressed') === 'true';
  Ambient.setActive(!pressed);
  btn.setAttribute('aria-pressed', (!pressed) ? 'true':'false');
});

// Mini-Reaktion auf Scroll/Move
let lastY = 0;
window.addEventListener('scroll', ()=>{
  if (!Ambient.started) return;
  const dy = Math.abs(window.scrollY - lastY); lastY = window.scrollY;
  Ambient.filter && (Ambient.filter.Q.value = Math.min(18, 2 + dy*0.01));
}, {passive:true});
