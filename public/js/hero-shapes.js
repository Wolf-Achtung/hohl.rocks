// public/js/hero-shapes.js
import { __TICKER_ITEMS } from './ticker-items.js';
import { openInputBubble, openAnswerPopup } from './answer-popup.js';
import { fetchDaily } from './claude-stream.js';

const layer = document.getElementById('shape-layer');

const CFG = {
  MAX_CONCURRENT: 6,
  SPAWN_EVERY_MS: 3800,
  LIFE_MIN: 24000,
  LIFE_MAX: 39000,
  CLICK_EXTEND_MS: 22000,
  FADE_MS: 1400
};

const COLORS = [
  'rgba(255,240,0,.55)',
  'rgba(255,80,160,.55)',
  'rgba(0,210,140,.55)',
  'rgba(90,160,255,.55)',
  'rgba(250,120,70,.55)',
  'rgba(180,120,255,.55)'
];

function mkThread(label){
  // stabile thread-id aus label
  const b = new TextEncoder().encode(label);
  let h=0; for (let i=0;i<b.length;i++) h = (h*131 + b[i]) >>> 0;
  return `t_${h.toString(16)}`;
}

function rand(a,b){return a + Math.random()*(b-a)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}

const entries = new Set();
let lastSpawn = 0;

// Daily Spotlight ersetzen
(async ()=>{
  try{
    const daily = await fetchDaily(); // {title, body}
    const idx = __TICKER_ITEMS.findIndex(i=> i.label === 'Heute neu');
    if (idx>=0 && daily?.title){
      __TICKER_ITEMS[idx] = {
        label: `Heute neu: ${daily.title}`,
        explain: "Frisches Micro‑Topic (aus News destilliert).",
        placeholder: "—",
        action: "info",
        prompt: daily.body || "Tagesinfo."
      };
    }
  }catch{/* ignore */}
})();

function spawnOne(){
  if (entries.size >= CFG.MAX_CONCURRENT) return;
  const it = pick(__TICKER_ITEMS);
  const el = document.createElement('div');
  el.className = 'shape';
  el.style.background = pick(COLORS);
  el.style.filter = 'blur(8px) saturate(1.05)';
  el.dataset.label = it.label;
  el.dataset.prompt = it.prompt || '';
  el.dataset.explain = it.explain || '';
  el.dataset.placeholder = it.placeholder || '';
  el.dataset.action = it.action || 'input';
  el.dataset.threadId = mkThread(it.label);

  const w = layer.clientWidth, h = layer.clientHeight;
  const x = rand(w*0.15, w*0.85), y = rand(h*0.2, h*0.85);
  const r = rand(110, 230);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = it.label;
  el.appendChild(label);

  if (it.explain) {
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = it.explain;
    el.appendChild(hint);
  }

  layer.appendChild(el);

  const entry = {
    el, born: performance.now(),
    x, y, r, vx: rand(-.06,.06), vy: rand(-.04,.04),
    sPhase: rand(0, Math.PI*2), sSpeed: rand(0.0012, 0.0022),
    life: rand(CFG.LIFE_MIN, CFG.LIFE_MAX),
    fadeIn:true, fadeOut:false, alpha:0, extends:0, fadeTimer:null
  };
  el.style.left = `${x}px`; el.style.top = `${y}px`;
  el.style.width = `${r*2}px`; el.style.height = `${r*2}px`;

  el.style.opacity = 0;
  requestAnimationFrame(()=> el.style.opacity = .98);

  el.addEventListener('click', ()=>{
    try{ window.Ambient && Ambient.ensureStart(); }catch{}
    // Fokus-Highlight
    document.querySelectorAll('.shape').forEach(s=>{ if (s!==el) s.style.opacity = '0.18'; });
    setTimeout(()=> document.querySelectorAll('.shape').forEach(s=>{ if (s!==el) s.style.opacity = '0.30'; }), 1200);

    // Lebensdauer verlängern
    if (entry.extends < 2) {
      entry.extends++;
      if (entry.fadeTimer) { clearTimeout(entry.fadeTimer); entry.fadeTimer=null; }
      entry.life += CFG.CLICK_EXTEND_MS;
    }

    // Aktion
    const action = el.dataset.action;
    const label = el.dataset.label;
    const p = el.dataset.prompt || '';
    const explain = el.dataset.explain || '';
    const placeholder = el.dataset.placeholder || '';
    const threadId = el.dataset.threadId;

    if (action === 'input') {
      openInputBubble({ title: label, explain, placeholder, prompt: p, threadId });
    } else {
      openAnswerPopup({ title: label, explain, content: p });
    }
  });

  entries.add(entry);
}

function update(){
  const t = performance.now();
  if (t - lastSpawn > CFG.SPAWN_EVERY_MS) { spawnOne(); lastSpawn = t; }

  const w = layer.clientWidth, h = layer.clientHeight;

  for (const e of [...entries]) {
    const age = t - e.born;
    if (age > e.life && !e.fadeOut) { e.fadeOut = true; e.fadeStart = t; }

    // motion
    e.x += e.vx; e.y += e.vy;
    // sanfte Ränder
    if (e.x < 60 || e.x > w-60) e.vx *= -1;
    if (e.y < 60 || e.y > h-60) e.vy *= -1;

    // size oscillation
    e.sPhase += e.sSpeed;
    const s = 0.92 + Math.sin(e.sPhase)*0.06;

    const tr = `translate(-50%,-50%) scale(${s})`;
    e.el.style.transform = tr;
    e.el.style.left = `${e.x}px`; e.el.style.top = `${e.y}px`;

    // fading
    if (e.fadeOut) {
      const k = Math.min(1, (t - e.fadeStart) / CFG.FADE_MS);
      e.el.style.opacity = String(0.98*(1-k));
      if (k>=1) { e.el.remove(); entries.delete(e); }
    }
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Resize handling
let rs;
window.addEventListener('resize', ()=>{
  clearTimeout(rs); rs = setTimeout(()=>{}, 120);
});
