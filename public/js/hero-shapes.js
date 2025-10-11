import { tickerItemsFor } from './ticker-items.js';
import { openCustomPopup } from './answer-popup.js';
import { lang } from './i18n.js';

const layer = document.getElementById('shape-layer');

const SIZE_MIN = 150;
const SIZE_MAX = 280;
const NEON = ['#d7ffe1', '#e2e7ff', '#ffd7f7', '#98fbff', '#fff2cc', '#ffe4e1', '#e0ffe9'];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function maxActive() {
  const isMobile = Math.max(window.innerWidth, window.innerHeight) < 768;
  const perf = Number(localStorage.getItem('perf_bucket') || '60');
  let base = isMobile ? 4 : 10;
  if (perf < 30) base = Math.max(3, Math.round(base * 0.6));
  else if (perf < 45) base = Math.max(4, Math.round(base * 0.8));
  return base;
}

function makeBubble(item){
  const el = document.createElement('button');
  el.className = 'shape';
  const size = Math.round(SIZE_MIN + Math.random()*(SIZE_MAX-SIZE_MIN));
  el.style.width = el.style.height = size + 'px';
  // position (px) within layer bounds
  const W = layer.clientWidth, H = layer.clientHeight;
  const x = Math.max(8, Math.floor(Math.random() * Math.max(8, W - size - 8)));
  const y = Math.max(8, Math.floor(Math.random() * Math.max(8, H - size - 8)));
  el.style.left = x + 'px'; el.style.top = y + 'px';

  const c = pick(NEON);
  el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,.96), ${c})`;

  el.setAttribute('aria-label', item.label);
  el.addEventListener('click', () => openCustomPopup(item));

  const label = document.createElement('div');
  label.className = 'label';
  const t = document.createElement('div'); t.className = 'title'; t.textContent = item.label;
  const s = document.createElement('div'); s.className = 'sub'; s.textContent = item.explain || '';
  label.append(t, s); el.append(label);
  return el;
}

let queue = tickerItemsFor(lang());
let idx = 0;
let running = false;

function nextItem(){
  if (!queue.length) queue = tickerItemsFor(lang());
  const it = queue[idx % queue.length];
  idx += 1;
  return it;
}

const live = new Set();

function spawnOne(){
  if (live.size >= maxActive()) return;
  const item = nextItem();
  const el = makeBubble(item);
  layer.append(el);
  // enter → live
  requestAnimationFrame(() => el.classList.add('live'));
  live.add(el);

  const lifetime = 10000 + Math.floor(Math.random()*5000); // 10–15s
  setTimeout(() => retire(el), lifetime);
}

function retire(el){
  if (!live.has(el)) return;
  el.classList.add('exit');
  live.delete(el);
  setTimeout(() => el.remove(), 1200);
}

function tick(){
  spawnOne();
  setTimeout(tick, 1400 + Math.floor(Math.random()*1000)); // alle ~1.4–2.4s
}

function start(){
  if (running) return;
  running = true;
  // bootstrap 1–2 bubbles sofort
  spawnOne(); setTimeout(spawnOne, 800);
  tick();
}

function resetForLang(){
  queue = tickerItemsFor(lang());
  idx = 0;
  // existierende bleiben und laufen aus; neue entstehen in neuer Sprache
}

start();
window.addEventListener('resize', () => { /* Positionen bleiben; neue Bubbles berücksichtigen Größe automatisch */ });
document.addEventListener('lang-changed', resetForLang);
