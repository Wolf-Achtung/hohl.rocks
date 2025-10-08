// public/js/ambient-radiohead.js — robust, DSGVO‑freundlich Ambient Engine
// Gold‑Standard+ revision: unlock on first user gesture, resume() safety for Safari/iOS,
// persistent toggle via localStorage, and gentle feedback on enable.

(function () {
  const LS_KEY = 'ambient_on';

  class AmbientEngine {
    constructor() {
      this._ctx = null;
      this._gain = null;
      this._on = false;
      this._bootstrapped = false;
      this._unlockHandler = this._unlockHandler.bind(this);
    }

    async _unlockHandler() {
      // create context lazily on first real user gesture
      await this.ensureStart(true);
      window.removeEventListener('pointerdown', this._unlockHandler);
      window.removeEventListener('keydown', this._unlockHandler);
    }

    async ensureStart(fromGesture = false) {
      if (this._ctx) {
        try { await this._ctx.resume(); } catch {}
        return;
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      // require user gesture unless explicitly allowed
      if (!fromGesture && document.visibilityState !== 'visible') {
        // wait for user gesture
        if (!this._bootstrapped) {
          this._bootstrapped = true;
          window.addEventListener('pointerdown', this._unlockHandler, { once: true });
          window.addEventListener('keydown', this._unlockHandler, { once: true });
        }
        return;
      }

      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = 'sine'; o1.frequency.value = 110;
      o2.type = 'sine'; o2.frequency.value = 220;
      gain.gain.value = 0.0; // start silent; fade in

      o1.connect(gain); o2.connect(gain); gain.connect(ctx.destination);
      o1.start(); o2.start();

      try { await ctx.resume(); } catch {}
      this._ctx = ctx; this._gain = gain; this._on = true;

      // gentle fade-in
      const target = 0.15;
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(target, now + 0.6);
      } catch { gain.gain.value = target; }

      // persist state
      try { localStorage.setItem(LS_KEY, '1'); } catch {}
    }

    isOn() { return !!this._on; }

    async toggle() {
      if (!this._ctx) {
        await this.ensureStart(true);
        this._on = true;
        try { localStorage.setItem(LS_KEY, '1'); } catch {}
        return;
      }
      this._on = !this._on;
      const v = this._on ? 0.15 : 0.0;
      try {
        const now = this._ctx.currentTime;
        this._gain.gain.cancelScheduledValues(now);
        this._gain.gain.setValueAtTime(this._gain.gain.value, now);
        this._gain.gain.linearRampToValueAtTime(v, now + 0.25);
      } catch { this._gain.gain.value = v; }
      try { localStorage.setItem(LS_KEY, this._on ? '1' : '0'); } catch {}
    }
  }

  window.Ambient = new AmbientEngine();

  // restore preference once the user interacts (required by browsers)
  try {
    const wantOn = (localStorage.getItem(LS_KEY) === '1');
    if (wantOn) {
      window.addEventListener('pointerdown', () => {
        window.Ambient.ensureStart(true);
        document.getElementById('sound-toggle')?.setAttribute('aria-pressed', 'true');
      }, { once: true });
    }
  } catch {}

  // click binding (defensive)
  document.getElementById('sound-toggle')?.addEventListener('click', async () => {
    await window.Ambient.toggle();
    const on = window.Ambient.isOn();
    document.getElementById('sound-toggle')?.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
})();
