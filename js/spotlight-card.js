/*! spotlight-card.js — overlay card */
(function(){
  'use strict';
  const css = `
    .spotlight-backdrop{position:fixed;inset:0;background:rgba(8,12,18,.36);backdrop-filter:blur(6px);z-index:60;display:none;}
    .spotlight-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
      width:min(720px,92vw);background:rgba(18,24,32,.82);border:1px solid rgba(255,255,255,.14);
      border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45);color:#eaf2ff;font:500 15px/1.5 ui-sans-serif,system-ui;overflow:hidden;}
    .spotlight-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.12);}
    .spotlight-title{font:700 16px/1.2 ui-sans-serif;}
    .spotlight-body{padding:16px;}
    .spotlight-actions{display:flex;gap:10px;flex-wrap:wrap;padding:14px 16px;border-top:1px solid rgba(255,255,255,.12);}
    .btn{padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#eaf2ff;cursor:pointer}
    .btn:active{transform:translateY(1px)}
    .swatches{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:10px;margin-top:8px}
    .swatch{border-radius:12px;min-height:64px;border:1px solid rgba(255,255,255,.18);display:flex;align-items:flex-end;justify-content:center;padding:10px;color:#0b121a;background:#fff}
    .swatch small{background:rgba(0,0,0,.5);color:#fff;padding:2px 6px;border-radius:8px}
    @media(max-width:520px){.spotlight-body{padding:12px}.spotlight-actions{padding:12px}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const backdrop = document.createElement('div'); backdrop.className='spotlight-backdrop';
  const card = document.createElement('div'); card.className='spotlight-card';
  backdrop.appendChild(card);
  const head = document.createElement('div'); head.className='spotlight-head';
  const title = document.createElement('div'); title.className='spotlight-title'; head.appendChild(title);
  const close = document.createElement('button'); close.className='btn'; close.textContent='Schließen'; head.appendChild(close);
  const body = document.createElement('div'); body.className='spotlight-body';
  const actions = document.createElement('div'); actions.className='spotlight-actions';
  card.appendChild(head); card.appendChild(body); card.appendChild(actions);
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(backdrop));
  function open(opts){ title.textContent = opts.title || 'Spotlight'; body.innerHTML=''; actions.innerHTML=''; backdrop.style.display='block'; return { body, actions, close }; }
  function hide(){ backdrop.style.display='none'; }
  close.addEventListener('click', hide);
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) hide(); });
  window.SpotlightCard = { open, hide };
})();
