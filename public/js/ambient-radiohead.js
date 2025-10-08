// public/js/ambient-radiohead.js — Techno‑Ambient Engine („Open‑Eye“-Vibe)
// On‑device, DSGVO‑freundlich. No samples, minimal CPU.
// Creates a gentle 125 BPM groove: kick, noise hats, soft bass pulses, pad,
// light delay and sidechain‑like ducking.

(function () {
  const LS_KEY = 'ambient_on';

  class TechnoAmbient {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.duck = null;
      this.delayIn = null;
      this.isRunning = false;

      this.tempo = 125;          // BPM
      this.currentStep = 0;      // 16th notes
      this.nextTime = 0;

      this.lookahead = 25 / 1000;   // 25ms
      this.scheduleAhead = 0.10;    // 100ms
      this.timer = null;
    }

    async ensureStart(fromGesture = false) {
      if (this.ctx) { try { await this.ctx.resume(); } catch {} return; }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!fromGesture && document.visibilityState !== 'visible') return;

      const ctx = new AudioCtx();
      this.ctx = ctx;

      // Master chain
      const duck = ctx.createGain(); duck.gain.value = 1.0;
      const master = ctx.createGain(); master.gain.value = 0.14;
      const delay = ctx.createDelay(0.6); delay.delayTime.value = 0.28;
      const fb = ctx.createGain(); fb.gain.value = 0.24;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 35;

      // delay feedback
      delay.connect(fb); fb.connect(delay);

      // chain: sources -> duck -> master -> delay -> master -> destination
      const merger = ctx.createGain();
      merger.connect(duck);
      duck.connect(master);
      master.connect(delay);
      delay.connect(master);
      master.connect(hp);
      hp.connect(ctx.destination);

      this.duck = duck;
      this.master = master;
      this.delayIn = merger;

      // pad (slow movement)
      this._startPad();

      // schedule transport
      this.nextTime = ctx.currentTime + 0.05;
      this.currentStep = 0;
      this.timer = setInterval(() => this._scheduler(), this.lookahead * 1000);
      this.isRunning = true;
    }

    isOn() { return !!(this.ctx && this.master && this.master.gain.value > 0.001); }

    async toggle() {
      if (!this.ctx) { await this.ensureStart(true); return; }
      const target = this.isOn() ? 0.0 : 0.14;
      try {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.linearRampToValueAtTime(target, now + 0.3);
      } catch { this.master.gain.value = target; }
      try { localStorage.setItem(LS_KEY, target > 0 ? '1' : '0'); } catch {}
    }

    _scheduler() {
      if (!this.ctx) return;
      while (this.nextTime < this.ctx.currentTime + this.scheduleAhead) {
        this._scheduleStep(this.currentStep, this.nextTime);
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextTime += 0.25 * secondsPerBeat; // 16th
        this.currentStep = (this.currentStep + 1) & 0x0f;
      }
    }

    _scheduleStep(step, time) {
      // Kick on quarters
      if (step % 4 === 0) this._kick(time);

      // Hats on 8ths with slight swing
      if (step % 2 === 1) this._hat(time + (step % 4 === 1 ? 0.003 : -0.003));

      // Bass pulses (pattern)
      const pattern = [0, 3, 5, 8, 10, 12, 14];
      if (pattern.includes(step)) this._bass(time, step);

      // light ducking each quarter
      if (step % 4 === 0) this._duck(time);
    }

    _kick(time) {
      const ctx = this.ctx;
      const o = ctx.createOscillator(); o.type = 'sine';
      const g = ctx.createGain();
      o.connect(g); g.connect(this.delayIn);

      // pitch & amp env
      o.frequency.setValueAtTime(140, time);
      o.frequency.exponentialRampToValueAtTime(50, time + 0.12);

      g.gain.setValueAtTime(0.001, time);
      g.gain.exponentialRampToValueAtTime(0.9, time + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      o.start(time); o.stop(time + 0.24);
    }

    _hat(time) {
      const ctx = this.ctx;
      const buffer = ctx.createBuffer(1, 2048, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource(); src.buffer = buffer;
      const bp = ctx.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 8000;
      const g = ctx.createGain(); g.gain.value = 0.05;
      src.connect(bp); bp.connect(g); g.connect(this.delayIn);

      const t = time;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      src.start(t); src.stop(t + 0.06);
    }

    _bass(time, step) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
      const g = ctx.createGain(); g.gain.value = 0.0;
      osc.connect(lp); lp.connect(g); g.connect(this.delayIn);

      // simple minor scale around A (55Hz)
      const notes = [55, 62.04, 65.41, 73.42, 82.41];
      const n = notes[(step % notes.length)];
      osc.frequency.setValueAtTime(n * 2, time); // one octave up

      // envelope
      g.gain.setValueAtTime(0.0, time);
      g.gain.linearRampToValueAtTime(0.22, time + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      // slight cutoff movement
      lp.frequency.setValueAtTime(280, time);
      lp.frequency.linearRampToValueAtTime(380, time + 0.18);

      osc.start(time); osc.stop(time + 0.25);
    }

    _startPad() {
      const ctx = this.ctx;
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth';
      const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.detune.value = +7;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.06;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 420;
      const g = ctx.createGain(); g.gain.value = 0.06;

      lfo.connect(lfoGain); lfoGain.connect(lp.frequency);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.delayIn);

      o1.frequency.value = 220; o2.frequency.value = 220;

      o1.start(); o2.start(); lfo.start();
    }

    _duck(time) {
      // sidechain‑like duck: lower master briefly
      const g = this.duck; if (!g) return;
      try {
        g.gain.cancelScheduledValues(time);
        g.gain.setValueAtTime(0.84, time);
        g.gain.linearRampToValueAtTime(1.0, time + 0.22);
      } catch {}
    }
  }

  const engine = new TechnoAmbient();
  window.Ambient = {
    ensureStart: (...a) => engine.ensureStart(...a),
    toggle: (...a) => engine.toggle(...a),
    isOn: (...a) => engine.isOn(...a)
  };

  // Restore preference on first gesture
  try {
    if (localStorage.getItem(LS_KEY) === '1') {
      window.addEventListener('pointerdown', () => engine.ensureStart(true), { once: true });
    }
  } catch {}
})();
