// /public/js/ambient-radiohead.js
(() => {
  const Ambient = {
    ctx: null, master: null, noise: null, filt: null, lfo: null, lfoGain: null, started: false,
    ensureStart() {
      if (this.started) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.12; // sehr leise
        // Rauschbett
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
        this.noise = this.ctx.createBufferSource(); this.noise.buffer = noiseBuf; this.noise.loop = true;

        // Filter + LFO
        this.filt = this.ctx.createBiquadFilter(); this.filt.type = "lowpass"; this.filt.frequency.value = 900;
        this.lfo = this.ctx.createOscillator(); this.lfo.type = "sine"; this.lfo.frequency.value = 0.08; // sehr langsam
        this.lfoGain = this.ctx.createGain(); this.lfoGain.gain.value = 260; // Modulationshub
        this.lfo.connect(this.lfoGain); this.lfoGain.connect(this.filt.frequency);

        this.noise.connect(this.filt); this.filt.connect(this.master); this.master.connect(this.ctx.destination);
        this.noise.start(); this.lfo.start();

        // Reaktion auf Scroll/Bewegung
        let lastY = window.scrollY, lastX = 0, lastT = performance.now();
        window.addEventListener("scroll", () => {
          const dy = Math.abs(window.scrollY - lastY); lastY = window.scrollY;
          // kleines Puls‑Gefühl bei Scroll
          this.master.gain.cancelScheduledValues(this.ctx.currentTime);
          this.master.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 0.02);
          this.master.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.25 + Math.min(0.25, dy / 2000));
        }, { passive: true });

        window.addEventListener("pointermove", (e) => {
          const now = performance.now(); const dt = now - lastT; lastT = now;
          const speed = Math.hypot(e.movementX || (e.clientX - lastX), e.movementY || 0) / Math.max(8, dt);
          lastX = e.clientX;
          const targetFreq = 600 + Math.min(1200, speed * 240);
          this.filt.frequency.cancelScheduledValues(this.ctx.currentTime);
          this.filt.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.05);
          this.filt.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.7);
        }, { passive: true });

        this.started = true;
      } catch { /* Audio nicht verfügbar */ }
    },
    stop() {
      try { this.noise?.stop(); this.ctx?.close(); } catch {}
      this.started = false;
    }
  };
  window.Ambient = Ambient;
})();
