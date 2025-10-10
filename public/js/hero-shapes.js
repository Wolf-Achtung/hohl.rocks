import { tickerItemsFor } from './ticker-items.js';
import { openCustomPopup } from './answer-popup.js';
import { lang } from './i18n.js';

const layer = document.getElementById('shape-layer');

const BUBBLE_SIZE_MIN = 150;
const BUBBLE_SIZE_MAX = 280;
const NEON = ['#d7ffe1', '#e2e7ff', '#ffd7f7', '#98fbff', '#fff2cc', '#ffe4e1', '#e0ffe9'];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function computeCount() {
  const isMobile = Math.max(window.innerWidth, window.innerHeight) < 768;
  const perf = Number(localStorage.getItem('perf_bucket') || '60');
  const base = isMobile ? 12 : 28;
  if (perf < 30) return Math.round(base * 0.6);
  if (perf < 45) return Math.round(base * 0.8);
  return base;
}

function makeBubble(item, idx){
  const el = document.createElement('button');
  el.className = 'shape';
  const c = pick(NEON);
  el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,.96), ${c})`;
  const size = Math.round(BUBBLE_SIZE_MIN + Math.random()*(BUBBLE_SIZE_MAX-BUBBLE_SIZE_MIN));
  el.style.width = el.style.height = size + 'px';
  el.style.left = Math.round(Math.random()*80 + 10) + 'vw';
  el.style.top  = Math.round(Math.random()*70 + 10) + 'vh';
  el.setAttribute('aria-label', item.label);
  el.style.animationDelay = (Math.random()*2).toFixed(2) + 's';
  el.addEventListener('click', () => openCustomPopup(item));

  const label = document.createElement('div');
  label.className = 'label';
  const t = document.createElement('div'); t.className = 'title'; t.textContent = item.label;
  const s = document.createElement('div'); s.className = 'sub'; s.textContent = item.explain || '';
  label.append(t, s); el.append(label);
  return el;
}

function populate(){
  layer.innerHTML = '';
  const items = tickerItemsFor(lang()).slice(0, computeCount());
  items.forEach((it, i) => layer.append(makeBubble(it, i)));
}

populate();
window.addEventListener('resize', populate);
document.addEventListener('lang-changed', populate);
