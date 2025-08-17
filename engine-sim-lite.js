// engine-sim-lite.js — procedural V‑Twin idle (Harley‑like) via WebAudio
// Starts on user gesture; no external assets required.
(function(){
  class EngineSimLite {
    constructor(ctx){
      this.ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.0;
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -24; this.comp.knee.value = 24; this.comp.ratio.value = 6;
      this.comp.attack.value = 0.003; this.comp.release.value = 0.25;
      this.master.connect(this.comp); this.comp.connect(this.ctx.destination);

      this.lpf = this.ctx.createBiquadFilter(); this.lpf.type="lowpass"; this.lpf.frequency.value=160;
      this.lpf.Q.value = 0.8;
      this.master.connect(this.lpf); // for potential post-FX chain later

      // Noise source for 'thumps'
      const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate*2, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*0.5;
      this.noise = this.ctx.createBufferSource(); this.noise.buffer=noiseBuf; this.noise.loop=true;
      this.noiseGain = this.ctx.createGain(); this.noiseGain.gain.value = 0.0001;
      this.noise.connect(this.noiseGain).connect(this.master);
      this.noise.start();

      this.rpm = 900; // idle
      this.running=false;
      this.schedulerId=null;
    }
    _thump(time){
      const g = this.noiseGain.gain;
      const now = time || this.ctx.currentTime;
      // very short attack, slow decay = 'potato'
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0.9, now + 0.0015);
      g.exponentialRampToValueAtTime(0.05, now + 0.11);
    }
    _schedule(){
      if (this.schedulerId) return;
      const ctx = this.ctx;
      const lookAhead = 0.025, ahead = 0.12;
      let next = ctx.currentTime;
      const loop = () => {
        if (!this.running){ this.schedulerId=null; return; }
        while (next < ctx.currentTime + ahead){
          const period = 60/(this.rpm/2);        // two cylinder events per rev
          const close = period * 0.33;           // close pair
          this._thump(next);
          this._thump(next + close);
          next += period * 1.65;                 // longer gap -> "potato" feel
        }
        this.schedulerId = setTimeout(loop, lookAhead*1000);
      };
      loop();
    }
    setRPM(r){ this.rpm = Math.max(600, Math.min(2200, (r|0))); }
    start(){
      if (this.running) return;
      this.running = true;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(0.4, t+0.25);
      this._schedule();
    }
    stop(){
      if (!this.running) return;
      this.running = false;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(0.0001, t+0.25);
    }
    connect(node){
      this.comp.disconnect();
      (node||this.ctx.destination) && this.comp.connect(node||this.ctx.destination);
    }
    get output(){ return this.master; }
  }
  window.EngineSimLite = EngineSimLite;
})();
