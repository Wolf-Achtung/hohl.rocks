// public/js/hero-shapes.js — Jellyfish Motion Bubbles (Gold‑Standard+)
import { __TICKER_ITEMS } from './ticker-items.js';
import { openInputBubble, openAnswerPopup } from './answer-popup.js';
import { fetchDaily } from './claude-stream.js';

const layer = document.getElementById('shape-layer');

const CFG = { MAX_CONCURRENT: 6, SPAWN_EVERY_MS: 3800, LIFE_MIN: 24000, LIFE_MAX: 39000, CLICK_EXTEND_MS: 22000, FADE_MS: 1400 };
const COLORS = ['rgba(255,240,0,.55)','rgba(255,80,160,.55)','rgba(0,210,140,.55)','rgba(90,160,255,.55)','rgba(250,120,70,.55)','rgba(180,120,255,.55)'];

function mkThread(label) { const b = new TextEncoder().encode(label || 'bubble'); let h = 0; for (let i = 0; i < b.length; i++) h = (h * 131 + b[i]) >>> 0; return `t_${h.toString(16)}`; }
function rand(a, b) { return a + Math.random() * (b - a); } function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

const entries = new Set(); let lastSpawn = 0;

// Daily‑Slot aktualisieren
(async () => { try { const daily = await fetchDaily(); const idx = __TICKER_ITEMS.findIndex(i => i.label?.toLowerCase?.().includes('heute neu')); if (idx >= 0 && daily?.title) { __TICKER_ITEMS[idx] = { label: `Heute neu: ${daily.title}`, explain: 'Frisches Micro‑Topic (aus News destilliert).', placeholder: '—', action: 'info', prompt: daily.body || 'Tagesinfo.' }; } } catch {} })();

function spawnOne() {
  if (!layer || entries.size >= CFG.MAX_CONCURRENT) return;
  const it = pick(__TICKER_ITEMS);
  const el = document.createElement('div'); el.className = 'shape'; el.style.background = pick(COLORS); el.style.filter = 'blur(8px) saturate(1.05)'; el.style.willChange = 'transform, opacity';
  el.dataset.label = it.label || ''; el.dataset.prompt = it.prompt || ''; el.dataset.explain = it.explain || ''; el.dataset.placeholder = it.placeholder || ''; el.dataset.action = it.action || 'input'; el.dataset.threadId = mkThread(it.label);
  const w = layer.clientWidth, h = layer.clientHeight; const x = rand(w * 0.15, w * 0.85), y = rand(h * 0.2, h * 0.85); const r = rand(110, 230);
  const label = document.createElement('div'); label.className = 'label'; label.textContent = it.label || ''; el.appendChild(label);
  if (it.explain) { const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = it.explain; el.appendChild(hint); }
  layer.appendChild(el);
  const entry = { el, born: performance.now(), x, y, r, vx: rand(-0.06, 0.06), vy: rand(-0.04, 0.04), sPhase: rand(0, Math.PI * 2), sSpeed: rand(0.0012, 0.0022), life: rand(CFG.LIFE_MIN, CFG.LIFE_MAX), fadeOut: false, fadeStart: 0, _clicks: 0 };
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${r * 2}px`; el.style.height = `${r * 2}px`; el.style.opacity = '0'; requestAnimationFrame(() => { el.style.opacity = '0.98'; });

  el.addEventListener('click', () => {
    try { window.Ambient && window.Ambient.ensureStart?.(); } catch {}
    document.querySelectorAll('.shape').forEach(s => { if (s !== el) s.style.opacity = '0.25'; }); setTimeout(() => document.querySelectorAll('.shape').forEach(s => { if (s !== el) s.style.opacity = '0.35'; }), 1200);
    if (entry._clicks < 2) { entry._clicks++; entry.life += CFG.CLICK_EXTEND_MS; }
    const action = el.dataset.action, label = el.dataset.label || '', prompt = el.dataset.prompt || '', explain = el.dataset.explain || '', placeholder = el.dataset.placeholder || '', threadId = el.dataset.threadId || '';
    if (action === 'input') openInputBubble({ title: label, explain, placeholder, prompt, threadId }); else openAnswerPopup({ title: label, explain, content: prompt });
  });

  entries.add(entry);
}

function update() {
  const t = performance.now(); if (t - lastSpawn > CFG.SPAWN_EVERY_MS) { spawnOne(); lastSpawn = t; }
  const w = layer?.clientWidth || 0, h = layer?.clientHeight || 0;
  for (const e of [...entries]) {
    const age = t - e.born; if (age > e.life && !e.fadeOut) { e.fadeOut = true; e.fadeStart = t; }
    e.x += e.vx; e.y += e.vy; if (e.x < 60 || e.x > w - 60) e.vx *= -1; if (e.y < 60 || e.y > h - 60) e.vy *= -1;
    e.sPhase += e.sSpeed; const s = 0.92 + Math.sin(e.sPhase) * 0.06; e.el.style.transform = `translate(-50%,-50%) scale(${s})`; e.el.style.left = `${e.x}px`; e.el.style.top = `${e.y}px`;
    if (e.fadeOut) { const k = Math.min(1, (t - e.fadeStart) / CFG.FADE_MS); e.el.style.opacity = String(0.98 * (1 - k)); if (k >= 1) { e.el.remove(); entries.delete(e); } }
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// leichte Resize‑Debounce
let rs; window.addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => {}, 120); });
