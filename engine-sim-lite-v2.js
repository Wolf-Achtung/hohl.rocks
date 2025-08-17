(function(){
  class EngineSimLite {
    constructor(ctx){
      this.ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.0001;
      this.hp=this.ctx.createBiquadFilter(); this.hp.type='highpass'; this.hp.frequency.value=40;
      this.lp=this.ctx.createBiquadFilter(); this.lp.type='lowpass'; this.lp.frequency.value=180;
      this.comp=this.ctx.createDynamicsCompressor(); this.comp.threshold.value=-24; this.comp.knee.value=24; this.comp.ratio.value=6; this.comp.attack.value=0.003; this.comp.release.value=0.25;
      this.master.connect(this.hp).connect(this.lp).connect(this.comp);
      this.panner=this.ctx.createStereoPanner(); this.comp.connect(this.panner).connect(this.ctx.destination);
      this.autoPan=this.ctx.createOscillator(); this.autoPan.frequency.value=0.05; this.autoPanGain=this.ctx.createGain(); this.autoPanGain.gain.value=0.6; this.autoPan.connect(this.autoPanGain).connect(this.panner.pan); this.autoPan.start();
      this.lfo=this.ctx.createOscillator(); this.lfo.frequency.value=0.7; this.lfoGain=this.ctx.createGain(); this.lfoGain.gain.value=0.05; this.lfo.connect(this.lfoGain).connect(this.master.gain); this.lfo.start();
      const buf=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.5;
      this.noise=this.ctx.createBufferSource(); this.noise.buffer=buf; this.noise.loop=true; this.noiseGain=this.ctx.createGain(); this.noiseGain.gain.value=0.0001; this.noise.connect(this.noiseGain).connect(this.master); this.noise.start();
      this.rpm=900; this.targetRPM=900; this.running=false; this.schedulerId=null; this.smootherId=null;
    }
    _thump(t){ const g=this.noiseGain.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(0.8,t+0.002); g.exponentialRampToValueAtTime(0.05,t+0.12); }
    _schedule(){ if(this.schedulerId) return; const ctx=this.ctx; let next=ctx.currentTime; const look=0.025,ahead=0.12;
      const step=()=>{ if(!this.running){ this.schedulerId=null; return; }
        while(next<ctx.currentTime+ahead){ const period=60/(this.rpm/2), close=period*0.35; this._thump(next); this._thump(next+close); next+=period*1.6; }
        this.schedulerId=setTimeout(step,look*1000);
      }; step();
    }
    _smoothRPM(){ const ease=()=>{ if(!this.running){ this.smootherId=null; return; } this.rpm += (this.targetRPM - this.rpm) * 0.08; this.smootherId=setTimeout(ease,60); }; ease(); }
    setRPM(r){ this.targetRPM=Math.max(600, Math.min(2200, (r|0))); }
    start(){ if(this.running) return; this.running=true; const now=this.ctx.currentTime; this.master.gain.cancelScheduledValues(now); this.master.gain.setValueAtTime(0.0001, now); this.master.gain.setTargetAtTime(0.28, now, 0.45); this._schedule(); this._smoothRPM(); }
    stop(){ if(!this.running) return; const now=this.ctx.currentTime; this.master.gain.cancelScheduledValues(now); this.master.gain.setTargetAtTime(0.0001, now, 0.35); }
    connect(node){ this.panner.disconnect(); this.panner.connect(node||this.ctx.destination); }
    get output(){ return this.master; }
  }
  window.EngineSimLite=EngineSimLite;
})();