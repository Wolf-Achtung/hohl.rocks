/*! ambient-melody.js — Radiohead Mood */
(function(){
  'use strict';
  const A4=440, midiToHz=(m)=>A4*Math.pow(2,(m-69)/12);
  const note=(name)=>{ const m=name.match(/^([A-Ga-g])([#b]?)(-?\d)$/); if(!m) return 146.83;
    const N=m[1].toUpperCase(), acc=m[2], oct=parseInt(m[3],10), map={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    let sem=map[N]; if(acc==='#') sem+=1; else if(acc==='b') sem-=1; return midiToHz((oct+1)*12+sem); };
  const SCALES={ 'minor-pent':[0,3,5,7,10], 'dorian':[0,2,3,5,7,9,10], 'aeolian':[0,2,3,5,7,8,10], 'major-pent':[0,2,4,7,9] };
  function seeded(seed){ let x=(seed|0)||123456789; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; }
  class AmbientMelody{
    constructor(){ this.ctx=null; this.master=null; this.bus=null; this.running=false; this.bpm=80; this.rootHz=note('D3'); this.scaleName='aeolian';
      this.seedVal=42; this.rng=seeded(this.seedVal); this.lookahead=0.1; this.interval=null; this.nextTime=0; this.step=0; this.div=2;
      this.level={ pad:0.36, pluck:0.18, sub:0.10 }; }
    ensureCtx(){ if(this.ctx) return this.ctx; const Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return null;
      this.ctx=new Ctx(); this.master=this.ctx.createGain(); this.master.gain.value=0.25; this.master.connect(this.ctx.destination);
      this.bus=this.ctx.createGain(); this.bus.gain.value=0.8; this.bus.connect(this.master);
      const mkDelay=(t)=>{ const d=this.ctx.createDelay(2.0); d.delayTime.value=t; const g=this.ctx.createGain(); g.gain.value=0.35;
        const lp=this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=4200; d.connect(lp).connect(g).connect(d);
        const out=this.ctx.createGain(); out.gain.value=0.26; lp.connect(out); return {in:g,out}; };
      const d1=mkDelay(0.29), d2=mkDelay(0.23), d3=mkDelay(0.41); this.revSend=this.ctx.createGain(); this.revSend.gain.value=0.22;
      this.revSend.connect(d1.in); this.revSend.connect(d2.in); this.revSend.connect(d3.in); d1.out.connect(this.master); d2.out.connect(this.master); d3.out.connect(this.master);
      return this.ctx; }
    setMood(n){ const s=String(n||'').toLowerCase();
      if(s.includes('radiohead')){ this.scaleName='aeolian'; this.bpm=78; this.level={ pad:0.36, pluck:0.16, sub:0.12 }; }
      else if(s.includes('hopkins')||s.includes('neon')){ this.scaleName='minor-pent'; this.bpm=92; this.level={ pad:0.38, pluck:0.20, sub:0.10 }; }
      else { this.scaleName='minor-pent'; this.bpm=86; this.level={ pad:0.35, pluck:0.18, sub:0.08 }; } }
    pad(freq,t,len=2.0){ const c=this.ctx; const o1=c.createOscillator(), o2=c.createOscillator(); o1.type='sawtooth'; o2.type='sawtooth';
      o1.frequency.value=freq; o2.frequency.value=freq*(1+(this.rng()*0.008-0.004)); const lfo=c.createOscillator(); lfo.frequency.value=0.10+this.rng()*0.1;
      const lfg=c.createGain(); lfg.gain.value=6; lfo.connect(lfg); const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1600; lp.Q.value=0.6; lfg.connect(lp.frequency);
      const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(this.level.pad,t+0.22); g.gain.exponentialRampToValueAtTime(0.0001,t+len);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.bus); const rs=c.createGain(); rs.gain.value=0.75; lp.connect(rs); rs.connect(this.revSend);
      o1.start(t); o2.start(t); lfo.start(t); o1.stop(t+len+0.05); o2.stop(t+len+0.05); lfo.stop(t+len+0.05); }
    pluck(freq,t,len=0.38){ const c=this.ctx; const o=c.createOscillator(); o.type='triangle'; o.frequency.value=freq;
      const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(this.level.pluck,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+len);
      const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=180; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2300+this.rng()*600;
      o.connect(hp).connect(lp).connect(g).connect(this.bus); const rs=c.createGain(); rs.gain.value=0.35; lp.connect(rs); rs.connect(this.revSend); o.start(t); o.stop(t+len+0.05); }
    sub(freq,t,len=1.2){ const c=this.ctx, o=c.createOscillator(); o.type='sine'; o.frequency.value=freq/2;
      const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(this.level.sub,t+0.08); g.gain.exponentialRampToValueAtTime(0.0001,t+len);
      o.connect(g).connect(this.bus); o.start(t); o.stop(t+len+0.05); }
    scale(){ return SCALES[this.scaleName]||SCALES['minor-pent']; }
    degreeToHz(d){ const s=this.scale()[((d%this.scale().length)+this.scale().length)%this.scale().length]; return this.rootHz*Math.pow(2,s/12); }
    scheduleTick(){ const c=this.ctx, spb=60/this.bpm, step=spb/this.div;
      while(this.nextTime<c.currentTime+this.lookahead){ const t=this.nextTime;
        if(this.step%8===0){ const base=(this.step/8)%4===0?0:(this.rng()<0.5?2:3); this.pad(this.degreeToHz(base),t,2.2); if(this.rng()<0.6)this.sub(this.degreeToHz(base),t,1.8); }
        else { const jump=(this.rng()<0.2)?2:(this.rng()<0.5?1:0); const deg=(this.step%8<4)?(0+jump):(2+jump); if(this.rng()<0.8)this.pluck(this.degreeToHz(deg),t,0.32+this.rng()*0.2); }
        this.step++; this.nextTime+=step; } }
    start(mood){ const c=this.ensureCtx(); if(!c) return; if(mood) this.setMood(mood); if(this.running) return; this.running=true; this.nextTime=c.currentTime+0.12; this.interval=setInterval(()=>this.scheduleTick(),25); }
    stop(){ if(!this.running) return; this.running=false; clearInterval(this.interval); this.interval=null;
      try{ this.master.gain.linearRampToValueAtTime(0.0001,this.ctx.currentTime+0.6);}catch(e){} }
  }
  window.WolfMelody=new AmbientMelody();
})();