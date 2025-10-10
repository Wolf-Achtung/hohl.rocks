// File: public/js/hero-shapes.js
import { getItems } from './ticker-items.js';
import { openCustomPopup } from './answer-popup.js';
import { getLang } from './i18n.js';

const layer = document.getElementById('shape-layer');

const BUBBLE_SIZE_MIN = 140;
const BUBBLE_SIZE_MAX = 260;
const COLORS = ['#e6fffa','#ffeecb','#ffd5e5','#e0e7ff','#e3ffe3','#f1eaff','#dff9ff'];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
let desiredCount = 24;

function computeCount(){
  const area = window.innerWidth * window.innerHeight;
  const base = Math.max(12, Math.min(40, Math.round(area / 40000))); // 12..40 depending on area
  return base;
}

function makeBubble(item){
  const el = document.createElement('button');
  el.className = 'shape';
  el.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), ' + pick(COLORS) + ')';
  el.style.width = el.style.height = Math.round(BUBBLE_SIZE_MIN + Math.random()*(BUBBLE_SIZE_MAX-BUBBLE_SIZE_MIN)) + 'px';
  el.style.left = Math.round(Math.random()*80 + 10) + 'vw';
  el.style.top  = Math.round(Math.random()*70 + 10) + 'vh';
  el.setAttribute('aria-label', item.label || 'Bubble');
  el.addEventListener('click', () => openCustomPopup(item));

  const label = document.createElement('div');
  label.className = 'label';
  const t = document.createElement('div');
  t.className = 'title'; t.textContent = item.label;
  const s = document.createElement('div');
  s.className = 'sub'; s.textContent = item.explain || '';
  label.appendChild(t); label.appendChild(s);
  el.appendChild(label);
  return el;
}

function populate(){
  layer.innerHTML = '';
  const items = getItems(getLang()).slice(0, desiredCount);
  for (const item of items){
    layer.appendChild(makeBubble(item));
  }
}

// Motion loop with FPS monitor
let last = performance.now();
let fsum = 0, fcnt = 0;
function tick(now){
  const dt = now - last; last = now;
  const fps = 1000 / Math.max(1, dt);
  fsum += fps; fcnt++;
  if (fcnt >= 60){ // every ~1s
    const avg = fsum / fcnt;
    if (avg < 30 && desiredCount > 14){ desiredCount -= 2; populate(); }
    if (avg > 50 && desiredCount < computeCount()){ desiredCount += 1; populate(); }
    fsum = 0; fcnt = 0;
  }

  const children = layer.children;
  for (let i=0;i<children.length;i++){
    const el = children[i];
    const off = Math.sin((now/1000) + i) * 4;
    el.style.transform = 'translateY(' + off + 'px)';
  }
  requestAnimationFrame(tick);
}

desiredCount = computeCount();
populate();
requestAnimationFrame(tick);

window.addEventListener('resize', () => { desiredCount = computeCount(); populate(); });
