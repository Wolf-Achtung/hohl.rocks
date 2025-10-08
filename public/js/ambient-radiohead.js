// public/js/ambient-radiohead.js — minimal, DSGVO-freundlich
class AmbientEngine {
  constructor() { this._ctx = null; this._gain = null; this._on = false; }
  async ensureStart() {
    if (this._ctx) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain(); gain.gain.value = 0.15;
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 110;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 220;
    o1.connect(gain); o2.connect(gain); gain.connect(ctx.destination);
    o1.start(); o2.start();
    this._ctx = ctx; this._gain = gain; this._on = true;
  }
  toggle() {
    if (!this._ctx) { this.ensureStart(); return; }
    this._on = !this._on;
    if (this._gain) this._gain.gain.value = this._on ? 0.15 : 0.0;
  }
  isOn() { return !!this._on; }
}
window.Ambient = new AmbientEngine();

document.getElementById('sound-toggle')?.addEventListener('click', () => {
  window.Ambient.toggle();
  const on = window.Ambient.isOn();
  document.getElementById('sound-toggle')?.setAttribute('aria-pressed', on ? 'true' : 'false');
});
