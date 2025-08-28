/*! ambient-melody.js — WolfMelody v1 (ambient, Jon-Hopkins-like)
 *
 * Dieses Skript implementiert eine kleine generative Ambient‑Engine im Stile
 * von Jon Hopkins. Es erzeugt langsame Pads, Plucks und Sub‑Bässe, die sich
 * über eine einfache Pentatonik oder dorische Tonleiter bewegen. Ein
 * Feedback‑Hall sorgt für eine sanfte Atmosphäre. Die Engine exportiert
 * sich als globales Objekt `window.WolfMelody` mit den Methoden
 * `.start(mood)`, `.stop()`, `.setTempo(bpm)`, `.setMood(name)`, `.setSeed(val)`,
 * `.tempoDelta(pct)` und `.gptPlan(theme)` (optional: holt Plan vom Backend).
 */
(function(){
  'use strict';

  const A4 = 440;
  const midiToHz = (m)=> A4 * Math.pow(2, (m-69)/12);
  const note = (name)=>{ // 'D3' etc.
    const m = name.match(/^([A-Ga-g])([#b]?)(-?\d)$/); if(!m) return 146.83;
    const N = m[1].toUpperCase(), acc = m[2], oct = parseInt(m[3],10);
    const map = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
    let sem = map[N]; if(acc==='#') sem+=1; else if(acc==='b') sem-=1;
    return midiToHz((oct+1)*12 + sem);
  };

  const SCALES = {
    'minor-pent' : [0,3,5,7,10],
    'dorian'     : [0,2,3,5,7,9,10],
    'aeolian'    : [0,2,3,5,7,8,10],
    'major-pent' : [0,2,4,7,9]
  };

  function seeded(seed){ // xorshift32
    let x = (seed|0) || 123456789;
    return ()=>{ x ^= x<<13; x ^= x>>>17; x ^= x<<5; return (x>>>0)/4294967296; };
  }

  class AmbientMelody {
    constructor(){
      this.ctx = null;
      this.master = null;
      this.bus = null;
      this.running = false;

      this.bpm = 86;
      this.rootHz = note('D3');
      this.scaleName = 'minor-pent';
      this.seedVal = 42;
      this.rng = seeded(this.seedVal);

      this.lookahead = 0.1; // s
      this.interval = null;
      this.nextTime = 0;
      this.step = 0;
      this.div = 2; // steps per beat (eighths)

      this.level = { pad:0.35, pluck:0.18, sub:0.08 };
    }

    ensureCtx(){
      if (this.ctx) return this.ctx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      // master
      this.master = this.ctx.createGain(); this.master.gain.value = 0.28;
      this.master.connect(this.ctx.destination);
      // bus
      this.bus = this.ctx.createGain(); this.bus.gain.value = 0.8;
      this.bus.connect(this.master);
      // simple FDN‑ish reverb: 3 feedback delays + lowpass
      const mkDelay = (t)=> {
        const d = this.ctx.createDelay(2.0); d.delayTime.value = t;
        const g = this.ctx.createGain(); g.gain.value = 0.35;
        const lp = this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 4500;
        d.connect(lp).connect(g).connect(d);
        const out = this.ctx.createGain(); out.gain.value = 0.28;
        lp.connect(out);
        return {in:g, out};
      };
      const d1 = mkDelay(0.31), d2 = mkDelay(0.23), d3 = mkDelay(0.41);
      this.revSend = this.ctx.createGain(); this.revSend.gain.value = 0.22;
      this.revSend.connect(d1.in); this.revSend.connect(d2.in); this.revSend.connect(d3.in);
      d1.out.connect(this.master); d2.out.connect(this.master); d3.out.connect(this.master);
      return this.ctx;
    }

    setSeed(s){ this.seedVal = (s|0)||42; this.rng = seeded(this.seedVal); }
    setTempo(b){ this.bpm = Math.max(48, Math.min(140, b|0)); }
    tempoDelta(pct){ this.setTempo(this.bpm * (1 + (pct/100))); }
    setMood(name){
      const n = (name||'').toLowerCase();
      if (n.includes('hopkins') || n.includes('neon')){
        this.scaleName='minor-pent'; this.setTempo(92);
        this.level = { pad:0.38, pluck:0.20, sub:0.10 };
      } else if (n.includes('dawn') || n.includes('calm')){
        this.scaleName='major-pent'; this.setTempo(74);
        this.level = { pad:0.34, pluck:0.14, sub:0.06 };
      } else if (n.includes('fast') || n.includes('drive')){
        this.scaleName='dorian'; this.setTempo(108);
        this.level = { pad:0.30, pluck:0.22, sub:0.10 };
      } else {
        this.scaleName='minor-pent'; this.setTempo(86);
        this.level = { pad:0.35, pluck:0.18, sub:0.08 };
      }
    }

    // ------- synth voices -------
    pad(freq, t, len=1.8){
      const ctx=this.ctx;
      const o1=ctx.createOscillator(), o2=ctx.createOscillator();
      o1.type='sawtooth'; o2.type='sawtooth';
      o1.frequency.value=freq; o2.frequency.value=freq* (1 + (this.rng()*0.008 - 0.004));
      const lfo=ctx.createOscillator(); lfo.frequency.value = 0.12 + this.rng()*0.1;
      const lfoGain=ctx.createGain(); lfoGain.gain.value=6; lfo.connect(lfoGain);
      const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1600; lp.Q.value=0.6;
      lfoGain.connect(lp.frequency);
      const g=ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(this.level.pad, t+0.22);
      g.gain.exponentialRampToValueAtTime(0.0001, t+len);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.bus);
      // send to reverb
      const rs = ctx.createGain(); rs.gain.value=0.8; lp.connect(rs); rs.connect(this.revSend);
      o1.start(t); o2.start(t); lfo.start(t);
      o1.stop(t+len+0.05); o2.stop(t+len+0.05); lfo.stop(t+len+0.05);
    }

    pluck(freq, t, len=0.38){
      const ctx=this.ctx;
      const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=freq;
      const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(this.level.pluck, t+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t+len);
      const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=180;
      const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2400 + this.rng()*800;
      o.connect(hp).connect(lp).connect(g).connect(this.bus);
      const rs = ctx.createGain(); rs.gain.value=0.35; lp.connect(rs); rs.connect(this.revSend);
      o.start(t); o.stop(t+len+0.05);
    }

    sub(freq, t, len=1.2){
      const ctx=this.ctx, o=ctx.createOscillator(); o.type='sine'; o.frequency.value=freq/2;
      const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(this.level.sub, t+0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t+len);
      o.connect(g).connect(this.bus); o.start(t); o.stop(t+len+0.05);
    }

    // ------- generator -------
    scale(){ return SCALES[this.scaleName] || SCALES['minor-pent']; }
    degreeToHz(deg){ const semis=this.scale()[((deg%this.scale().length)+this.scale().length)%this.scale().length]; return this.rootHz * Math.pow(2, semis/12); }
    scheduleTick(){
      const ctx=this.ctx; const spb = 60/this.bpm; const stepDur = spb/this.div;
      while (this.nextTime < ctx.currentTime + this.lookahead){
        const t=this.nextTime;
        // chord every 8 steps
        if (this.step % 8 === 0){
          const base = (this.step/8)%4===0 ? 0 : (this.rng()<0.5?2:3);
          this.pad(this.degreeToHz(base), t, 2.2);
          if (this.rng()<0.6) this.sub(this.degreeToHz(base), t, 1.8);
        } else {
          const jump = (this.rng()<0.2)? 2 : (this.rng()<0.5?1:0);
          const deg = (this.step%8<4) ? (0 + jump) : (2 + jump);
          if (this.rng()<0.8) this.pluck(this.degreeToHz(deg), t, 0.32 + this.rng()*0.2);
        }
        this.step++; this.nextTime += stepDur;
      }
    }
    start(mood){
      const ctx=this.ensureCtx(); if(!ctx) return;
      if (mood) this.setMood(mood);
      if (this.running) return;
      this.running=true; this.nextTime = ctx.currentTime + 0.12;
      this.interval = setInterval(()=> this.scheduleTick(), 25);
    }
    stop(){ if(!this.running) return; this.running=false; clearInterval(this.interval); this.interval=null;
      try{ this.master.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime+0.6); }catch(_){} }
    // ---- optional: holt bpm/scale/motif vom Backend (GPT Plan) ----
    async gptPlan(theme){
      try{
        const base = window.HOHLROCKS_CHAT_BASE || '';
        const body = {
          system: "Gib strikt JSON ohne erläuternden Text zurück. Schema: {\"bpm\": number, \"root\": \"D3\", \"scale\": \"minor-pent|dorian|major-pent|aeolian\", \"mood\": string, \"motif\": [ints -4..+4]}",
          message: `Erzeuge einen Ambient-Plan im Stil von Jon Hopkins. Thema: ${theme||'winterklarer Highway, Neon'}.`
        };
        const res = await fetch(base + '/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
        const txt = await res.text();
        const json = JSON.parse(txt);
        if (json.bpm) this.setTempo(json.bpm);
        if (json.root) this.rootHz = note(json.root);
        if (json.scale && SCALES[json.scale]) this.scaleName = json.scale;
        if (json.mood) this.setMood(json.mood);
        // optional motif: could be used to change scale degrees per step
      }catch(_){ /* ignore */ }
    }
  }
  window.WolfMelody = new AmbientMelody();
})();