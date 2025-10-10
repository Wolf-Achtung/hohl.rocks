// File: public/js/hero-shapes.js
// Bubble/Jellyfish motion with readable labels inside the shape (desktop 24, mobile 10)

import { __TICKER_ITEMS } from './ticker-items.js';
import { openCustomPopup } from './answer-popup.js';

const layer = document.querySelector('.shape-layer');

const BUBBLE_SIZE_MIN = 140;
const BUBBLE_SIZE_MAX = 260;

function deviceCount() {
  const isMobile = Math.max(window.innerWidth, window.innerHeight) < 768;
  return isMobile ? 10 : 24; // per Wolf
}
const COLORS = [
  'rgba(250, 255, 150, .55)',
  'rgba(122, 241, 216, .55)',
  'rgba(168, 199, 255, .55)',
  'rgba(255, 179, 214, .55)',
  'rgba(201, 255, 175, .55)'
];

function clamp2Lines(el) {
  el.style.display = '-webkit-box';
  el.style.webkitBoxOrient = 'vertical';
  el.style.webkitLineClamp = '2';
  el.style.overflow = 'hidden';
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

function createBubble(item, i) {
  const el = document.createElement('div');
  el.className = 'shape';
  const r = Math.round(BUBBLE_SIZE_MIN + Math.random()*(BUBBLE_SIZE_MAX - BUBBLE_SIZE_MIN));
  el.style.width = `${r}px`;
  el.style.height = `${r}px`;
  el.style.setProperty('--bubble-color', pick(COLORS));

  const label = document.createElement('div');
  label.className = 'label';

  const title = document.createElement('div');
  title.style.fontWeight = '800';
  title.style.marginBottom = '2px';
  title.textContent = item.label;

  const sub = document.createElement('div');
  sub.style.fontWeight = '600';
  sub.style.opacity = '.9';
  sub.textContent = (item.explain || '').trim();
  clamp2Lines(sub);

  label.append(title, sub);
  el.appendChild(label);

  const w = layer.clientWidth, h = layer.clientHeight;
  const x = Math.random() * (w - r) + r/2;
  const y = Math.random() * (h - r) + r/2;

  const entity = {
    el, r: r/2,
    x, y,
    dx: (Math.random()*0.8 + 0.25) * (Math.random() < 0.5 ? -1 : 1),
    dy: (Math.random()*0.6 + 0.25) * (Math.random() < 0.5 ? -1 : 1),
    wob: Math.random()*Math.PI*2,
    item
  };

  el.addEventListener('click', () => openItem(entity.item), { passive: true });
  return entity;
}

function openItem(item) {
  const box = openCustomPopup({
    title: item.label,
    explain: item.explain,
    placeholder: item.placeholder || '',
    help: item.help || ''
  });
  box.ok.addEventListener('click', () => {
    box.send({
      prompt: (item.prompt || '').replace('{{input}}', box.input.value || ''),
      system: 'Bitte in gutem, präzisem Deutsch antworten. Klare Struktur, Überschriften und Bulletpoints, wenn sinnvoll.',
      model: '',
      thread: item.thread || ''
    });
  }, { once: true });
}

let entities = [];
let COUNT = deviceCount();

function init() {
  if (!layer) return;
  layer.innerHTML = '';
  COUNT = deviceCount();
  entities = [];
  for (let i=0;i<COUNT;i++) {
    const item = __TICKER_ITEMS[i % __TICKER_ITEMS.length];
    const ent = createBubble(item, i);
    layer.appendChild(ent.el);
    ent.el.style.transform = `translate3d(${ent.x - ent.r}px, ${ent.y - ent.r}px, 0)`;
    entities.push(ent);
  }
}

function tick() {
  const w = layer.clientWidth, h = layer.clientHeight;
  for (const e of entities) {
    const wobbleX = Math.sin(e.wob += 0.01) * 0.4;
    const wobbleY = Math.cos(e.wob) * 0.3;

    e.x += e.dx + wobbleX;
    e.y += e.dy + wobbleY;

    const margin = e.r + 6;
    if (e.x < margin || e.x > w - margin) e.dx *= -1;
    if (e.y < margin || e.y > h - margin) e.dy *= -1;

    e.el.style.transform = `translate3d(${Math.round(e.x - e.r)}px, ${Math.round(e.y - e.r)}px, 0)`;
  }
  rafId = requestAnimationFrame(tick);
}

let rafId = 0;
function start(){ cancelAnimationFrame(rafId); rafId = requestAnimationFrame(tick); }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else start();
});

window.addEventListener('resize', () => { init(); }, { passive:true });

init();
start();
