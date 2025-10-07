/* public/js/hero-shapes.js — Neon Jellyfish v2
 * - wenige gleichzeitige Bubbles (Desktop 6, Mobile 4)
 * - langsames Ein-/Ausblenden (3s / 3.6s)
 * - elegantes Nachspawnen (alle 4–9s 1 Bubble, manchmal 2)
 * - sehr sanfte, quallenartige Bewegung (Lissajous + Atmung)
 * - Kollision-Vermeidung beim Spawn
 * - Klick: Fokus + Lebensdauer-Verlängerung
 * - Stateful Session je Bubble (threadId pro label)
 * - kompatibel mit __TICKER_ITEMS (label, hint, prompt, action, placeholder, explain)
 */
(function () {
  // ────────────────────────────────────────────────────────────────────────────
  // Konfiguration
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CFG = {
    MAX: (innerWidth < 820) ? 4 : 6,            // max sichtbare Bubbles
    SPAWN_MIN: 4000,                             // min Wartezeit bis zur nächsten Bubble (ms)
    SPAWN_MAX: 9000,                             // max Wartezeit bis zur nächsten Bubble (ms)
    FADE_IN: 3000,                               // Einblendung
    FADE_OUT: 3600,                              // Ausblendung
    LIFE_MIN: 65000,                             // Lebensdauer
    LIFE_MAX: 98000,
    LIFE_EXTEND_CLICK: 55000,                    // Verlängerung nach Klick
    MAX_EXTENDS: 1,                              // wie oft verlängern?
    PAD: 60,                                     // Abstand zum Rand
    SAFE: 36,                                    // Abstand zwischen Bubbles
    SIZE: [0.26, 0.50],                          // min/max relativ zur kleineren Screen-Kante
    DRIFT: {                                     // langsamer Drift
      ax: [22, 58],                              // Amplitude X
      ay: [20, 52],                              // Amplitude Y
      tx: [900, 1500],                           // Perioden X (ms)
      ty: [980, 1600],                           // Perioden Y (ms)
      speed: [0.0015, 0.0035],                   // globale Tempovariation
      breatheAmp: [0.006, 0.016],                // Atmung (Scale)
      breatheT: [18, 28]                         // Atmungsperiode (s)
    }
  };

  if (reduceMotion) {
    // ruhiger, barriereärmer
    CFG.DRIFT.ax = [8, 14];
    CFG.DRIFT.ay = [8, 14];
    CFG.DRIFT.speed = [0.0004, 0.0007];
    CFG.FADE_IN = 1200;
    CFG.FADE_OUT = 1200;
  }

  // Farben & Utilities
  const NEON = ['#00F5D4', '#7CF4FF', '#FFD400', '#FF4FA3', '#00E676', '#A0FF1A', '#9C64FF', '#FFA26B'];
  const pick = () => NEON[(Math.random() * NEON.length) | 0];
  const rnd = (min, max) => min + Math.random() * (max - min);

  const BUBBLES = [];     // aktive Bubbles (für Kollisionsprüfung)
  let running = false;
  let spawnTimer = null;

  // Persistente Threads je Label
  const threadStore = (window.__threadByLabel = window.__threadByLabel || {});
  const mkThread = (label) => threadStore[label] || (threadStore[label] = 't_' + (crypto?.getRandomValues
    ? [...crypto.getRandomValues(new Uint8Array(6))].map(b => b.toString(16).padStart(2, '0')).join('')
    : Math.random().toString(36).slice(2, 10)));

  function holder() {
    let h = document.getElementById('shapes');
    if (!h) { h = document.createElement('div'); h.id = 'shapes'; document.body.appendChild(h); }
    return h;
  }

  // einfache Kollisionsprüfung (Kreis zu Kreis)
  function collides(cx, cy, r) {
    for (const b of BUBBLES) {
      const dx = cx - b.cx, dy = cy - b.cy;
      if (Math.hypot(dx, dy) < (r + b.r + CFG.SAFE)) return true;
    }
    return false;
  }

  // Organische Kontur
  function blobPath(cx, cy, r = 150, points = 16, variance = 0.12) {
    const TAU = Math.PI * 2, step = TAU / points, pts = [];
    for (let i = 0; i < points; i++) {
      const ang = i * step, rad = r * (1 - variance / 2 + Math.random() * variance);
      pts.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad });
    }
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % pts.length];
      const cxp = (p0.x + p1.x) / 2, cyp = (p0.y + p1.y) / 2;
      d += ` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`;
    }
    return d + ' Z';
  }

  function spawnOne(h) {
    if (!running) return;
    if (BUBBLES.length >= CFG.MAX) return;

    const W = innerWidth, H = innerHeight, B = Math.min(W, H);
    const size = B * rnd(CFG.SIZE[0], CFG.SIZE[1]);
    const r = size / 2;

    // Position suchen (max 24 Versuche)
    let cx, cy, ok = false, tries = 24;
    while (tries--) {
      cx = rnd(CFG.PAD, W - CFG.PAD);
      cy = rnd(CFG.PAD + 40, H - CFG.PAD - 120);
      if (!collides(cx, cy, r)) { ok = true; break; }
    }
    if (!ok) { cx = rnd(CFG.PAD, W - CFG.PAD); cy = rnd(CFG.PAD + 40, H - CFG.PAD - 120); }

    // DOM
    const color = pick();
    const el = document.createElement('div');
    el.className = 'shape';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Interaktive Bubble');
    Object.assign(el.style, {
      position: 'absolute',
      left: `${(cx - r) | 0}px`,
      top: `${(cy - r) | 0}px`,
      width: `${size}px`,
      height: `${size}px`,
      zIndex: String(500 + ((Math.random() * 500) | 0)),
      opacity: '0',
      transition: `opacity ${CFG.FADE_IN}ms ease`,
      willChange: 'transform,opacity'
    });

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.style.mixBlendMode = 'screen';
    const fill = document.createElementNS(ns, 'path');
    const stroke = document.createElementNS(ns, 'path');
    fill.setAttribute('fill', color); fill.setAttribute('opacity', '0.78');
    stroke.setAttribute('stroke', color); stroke.setAttribute('fill', 'none'); stroke.setAttribute('opacity', '0.55');
    const d = blobPath(200, 200, 150, 16, 0.12); fill.setAttribute('d', d); stroke.setAttribute('d', d);
    svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);

    // Label/Hint/Aktion aus __TICKER_ITEMS
    if (Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length) {
      if (typeof window.__bubbleIndex !== 'number') window.__bubbleIndex = 0;
      const it = window.__TICKER_ITEMS[(window.__bubbleIndex++) % window.__TICKER_ITEMS.length];

      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;';
      const title = document.createElement('div'); title.textContent = it.label;
      Object.assign(title.style, { color: '#0a1118', fontWeight: '800', fontSize: '14px', background: 'rgba(255,255,255,.35)', padding: '6px 10px', borderRadius: '10px', textShadow: '0 1px 2px rgba(255,255,255,.6)' });
      const hint = document.createElement('div'); hint.textContent = it.hint || 'Klick – Ergebnis im Fenster';
      Object.assign(hint.style, { marginTop: '6px', fontSize: '11px', opacity: .9, background: 'rgba(12,16,22,.35)', color: '#eaf2ff', padding: '4px 8px', borderRadius: '8px' });
      wrap.appendChild(title); wrap.appendChild(hint); el.appendChild(wrap);

      // Daten an Bubble hängen
      el.dataset.prompt = it.prompt || '';
      el.dataset.action = it.action || '';
      el.dataset.placeholder = it.placeholder || '';
      el.dataset.explain = it.explain || '';     // ⟵ neu: Kurz-Erklärung
      el.dataset.threadId = mkThread(it.label);  // ⟵ neu: stabile Thread-ID je Label
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        try { window.Ambient && Ambient.ensureStart && Ambient.ensureStart(); } catch (e) { }

        // Fokus: andere Bubbles abdunkeln, diese betonen
        document.querySelectorAll('.shape').forEach(s => { if (s !== el) s.style.opacity = '0.18'; });
        setTimeout(() => { document.querySelectorAll('.shape').forEach(s => { if (s !== el) s.style.opacity = '0.28'; }); }, 1200);

        // Lebensdauer verlängern (nur begrenzt oft)
        if (entry.extends < CFG.MAX_EXTENDS) {
          entry.extends++;
          if (entry.fadeTimer) { clearTimeout(entry.fadeTimer); entry.fadeTimer = null; }
          scheduleFade(entry, CFG.LIFE_EXTEND_CLICK); // neu planen
        }

        // Aktionen routen
        const act = el.dataset.action;
        const label = it.label;
        const p = el.dataset.prompt || '';
        const options = {
          placeholder: el.dataset.placeholder || 'Text hier einfügen…',
          explain: el.dataset.explain || '',
          threadId: el.dataset.threadId || mkThread(it.label)
        };

        if (act === 'research' && typeof window.startResearch === 'function') {
          const q = prompt('Thema für Live-Recherche?');
          if (q) startResearch(q, { threadId: options.threadId, explain: options.explain });
          return;
        }
        if (act === 'cage-match' && typeof window.openCageMatch === 'function') {
          return openCageMatch({ threadId: options.threadId, explain: options.explain });
        }
        if (act === 'claude-input' && typeof window.openInputBubble === 'function') {
          return openInputBubble(label, p, options); // ⟵ explain + threadId kommen im Popup an
        }
        if (act && window.VisualLab && typeof VisualLab.handle === 'function') {
          return VisualLab.handle(act, options);
        }

        // Fallback: Antwort-Popup
        if (typeof window.openAnswerPopup === 'function') {
          return openAnswerPopup(p, false, label, options);
        }
      });
    }

    // zur Seite hinzufügen & weich einblenden
    h.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '0.96'; });

    // Bewegungs-Parameter (sehr langsam + Atmung)
    const drift = {
      ax: rnd(CFG.DRIFT.ax[0], CFG.DRIFT.ax[1]),
      ay: rnd(CFG.DRIFT.ay[0], CFG.DRIFT.ay[1]),
      tx: rnd(CFG.DRIFT.tx[0], CFG.DRIFT.tx[1]),
      ty: rnd(CFG.DRIFT.ty[0], CFG.DRIFT.ty[1]),
      speed: rnd(CFG.DRIFT.speed[0], CFG.DRIFT.speed[1]),
      breatheAmp: rnd(CFG.DRIFT.breatheAmp[0], CFG.DRIFT.breatheAmp[1]),
      breatheT: rnd(CFG.DRIFT.breatheT[0], CFG.DRIFT.breatheT[1]),
      phase: Math.random() * Math.PI * 2
    };
    const t0 = performance.now() * drift.speed;

    // Lebenszyklus registrieren
    const entry = { el, cx, cy, r, raf: null, fadeTimer: null, extends: 0 };
    BUBBLES.push(entry);

    function animate() {
      if (!running) return;
      const t = (performance.now() * drift.speed) - t0;
      const dx = Math.sin(t / drift.tx) * drift.ax;
      const dy = Math.cos(t / drift.ty) * drift.ay;
      const breath = 1 + Math.sin(t / drift.breatheT + drift.phase) * drift.breatheAmp;
      el.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${breath.toFixed(3)})`;
      entry.raf = requestAnimationFrame(animate);
    }
    animate();

    // Fade-Out planen
    scheduleFade(entry, rnd(CFG.LIFE_MIN, CFG.LIFE_MAX));

    function scheduleFade(ent, delay) {
      ent.fadeTimer = setTimeout(() => {
        ent.el.style.transition = `opacity ${CFG.FADE_OUT}ms ease`;
        ent.el.style.opacity = '0';
        setTimeout(() => {
          try { cancelAnimationFrame(ent.raf); } catch (e) { }
          const i = BUBBLES.indexOf(ent);
          if (i >= 0) BUBBLES.splice(i, 1);
          ent.el.remove();
        }, CFG.FADE_OUT + 40);
      }, delay);
    }
  }

  // Spawner: alle 4–9 s eine neue Bubble (mit 25 % Chance auf 2)
  function schedule() {
    if (!running) return;
    const h = holder();
    const toSpawn = (BUBBLES.length < CFG.MAX) ? 1 + (Math.random() < 0.25 ? 1 : 0) : 0;
    for (let i = 0; i < toSpawn; i++) {
      if (BUBBLES.length < CFG.MAX) spawnOne(h);
    }
    const wait = rnd(CFG.SPAWN_MIN, CFG.SPAWN_MAX);
    spawnTimer = setTimeout(schedule, wait);
  }

  // Start: mit 1–2 initialen Bubbles loslegen
  function init() {
    if (running) return;
    running = true;
    const h = holder();
    const initial = (innerWidth < 820) ? 1 : 2;
    for (let i = 0; i < initial; i++) spawnOne(h);
    schedule();

    // Pre-Msg nach kurzer Zeit ausblenden (falls vorhanden)
    setTimeout(() => { const pm = document.getElementById('pre-msg'); if (pm) pm.remove(); }, 9000);
  }

  // Stop (bei Bedarf)
  function stop() {
    running = false;
    clearTimeout(spawnTimer);
    BUBBLES.slice().forEach(b => {
      try { cancelAnimationFrame(b.raf); } catch (e) { }
      clearTimeout(b.fadeTimer);
      b.el.remove();
    });
    BUBBLES.length = 0;
  }

  if (document.readyState !== 'loading') init();
  else window.addEventListener('DOMContentLoaded', init);

  // optional global
  window.Bubbles = { init, stop, state: () => ({ count: BUBBLES.length }) };
})();
