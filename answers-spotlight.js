/*! answers-spotlight.js — Spotlight-Karte mit Follow‑ups (Clear‑on‑Send) */
(function(){
  if (window.__ANSWER_MODE !== 'spotlight'){ return; }

  const css = `
  .spotlight-card{ position: fixed; left: 24px; bottom: 15vh; width: min(520px, 44vw); z-index: 41;
    background: rgba(20, 28, 36, 0.72); border: 1px solid rgba(255,255,255,0.16); border-radius: 18px;
    box-shadow: 0 18px 60px rgba(0,0,0,0.35); color: #EAF2FF; backdrop-filter: blur(12px); padding: 14px;
    transform: translateY(8px); opacity: 0; transition: opacity .35s ease, transform .35s ease; }
  .spotlight-card.show{ opacity: 1; transform: translateY(0); }
  .spot-title{ font: 700 14px/1.2 ui-sans-serif,system-ui; margin: 0 0 6px 0; opacity: .95; }
  .spot-body{ font: 600 15px/1.35 ui-sans-serif,system-ui; white-space: pre-wrap; max-height: 38vh; overflow:auto; }
  .spot-row{ display:flex; gap:8px; justify-content: space-between; margin-top: 8px; flex-wrap: wrap; }
  .spot-follow{ display:flex; gap:8px; flex-wrap: wrap; }
  .spot-chip{ border-radius:999px; border:1px solid rgba(255,255,255,.18); padding:6px 10px;
    background:rgba(255,255,255,.08); color:#eaf2ff; cursor:pointer; font:600 12px/1 ui-sans-serif; }
  .spot-chip:active{ transform: translateY(1px); }
  .spot-btn{ border-radius:999px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.18);
    color:#f1f6ff; padding:6px 10px; font:600 12px/1 ui-sans-serif; cursor:pointer; }
  .spot-btn:hover{ background: rgba(255,255,255,.18); }
  @media (max-width: 880px){ .spotlight-card{ left: 16px; width: 86vw; bottom: calc(16vh + 80px); } }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  let card=null, acc='';

  function ensureCard(){
    if (!card){
      card = document.createElement('div'); card.className='spotlight-card';
      const h = document.createElement('div'); h.className='spot-title'; h.textContent='Antwort';
      const b = document.createElement('div'); b.className='spot-body'; b.textContent='…';

      const row = document.createElement('div'); row.className='spot-row';
      const follow = document.createElement('div'); follow.className='spot-follow';
      const actionsRight = document.createElement('div');

      // Follow‑up Chips
      const chips = [
        {t:'Noch konkreter?', q:'Bitte noch konkreter, mit 1 Kennzahl und 1 Umsetzungsschritt.'},
        {t:'Risiko/Trade‑off?', q:'Welche Risiken/Trade‑offs gibt es — und wie minimiere ich sie?'},
        {t:'Mini‑Beispiel', q:'Gib ein kurzes, realistisches Beispiel (≤ 40 Wörter).'}
      ];
      chips.forEach(c=>{
        const btn = document.createElement('button'); btn.className='spot-chip'; btn.textContent=c.t;
        btn.addEventListener('click', ()=>{ try{ window.ChatDock?.send(c.q); }catch(_){ } });
        follow.appendChild(btn);
      });

      // Actions
      const open = document.createElement('button'); open.className='spot-btn'; open.textContent='Weiter im Chat ⟶';
      open.addEventListener('click', ()=>{ try{ (window.ChatDock?.open||window.ChatDock?.focus)?.call(window.ChatDock); }catch{} });
      const close = document.createElement('button'); close.className='spot-btn'; close.textContent='Schließen';
      close.addEventListener('click', ()=>{ try{ card.classList.remove('show'); setTimeout(()=>{ card?.remove(); card=null; }, 300);}catch{} });

      actionsRight.appendChild(close); actionsRight.appendChild(open);
      row.appendChild(follow); row.appendChild(actionsRight);

      card.appendChild(h); card.appendChild(b); card.appendChild(row);
      document.body.appendChild(card);
      requestAnimationFrame(()=> card.classList.add('show'));
    }
    return card;
  }

  // Events
  window.addEventListener('chat:send', ()=>{
    acc=''; const c=ensureCard(); c.querySelector('.spot-body').textContent='…';
  });
  window.addEventListener('chat:delta', (ev)=>{
    const d = (ev.detail && ev.detail.delta) ? ev.detail.delta : '';
    acc += d;
    ensureCard().querySelector('.spot-body').textContent = (acc.length>540 ? acc.slice(0,520)+' …' : acc);
  });
  window.addEventListener('chat:done', ()=>{ /* keep visible for a while — no auto-hide here */ });
})();
