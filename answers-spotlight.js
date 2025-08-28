/*! answers-spotlight.js — Spotlight Card mit Follow‑up‑Chips */
(function(){
  'use strict';
  // Nur aktivieren, wenn der Spotlight‑Modus gewählt ist oder keine Modus‑Einschränkung gesetzt ist
  if(typeof window.__ANSWER_MODE !== 'undefined' && window.__ANSWER_MODE !== 'spotlight') return;

  // Basisspezifische Styles: Positionierung, Look & Feel und Follow‑up‑Chips
  const css = `
    .spotlight-card{ position: fixed; left: 24px; bottom: 15vh; width: min(540px, 46vw); z-index: 41;
      background: rgba(20, 28, 36, 0.78); border: 1px solid rgba(255,255,255,0.16); border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.45); color: #EAF2FF; backdrop-filter: blur(12px); padding: 16px;
      opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
    .spotlight-card.show{ opacity: 1; transform: translateY(0); }
    .spot-title{ font: 700 14px/1.2 ui-sans-serif,system-ui; margin: 0 0 6px 0; opacity: .95; }
    .spot-body{ font: 600 15px/1.35 ui-sans-serif,system-ui; white-space: pre-wrap; max-height: 38vh; overflow:auto; }
    .spot-row{ display:flex; gap:8px; justify-content: flex-end; margin-top: 10px; flex-wrap:wrap; }
    .spot-btn{ border-radius: 999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18);
      color:#f1f6ff; padding:6px 10px; font:600 12px/1 ui-sans-serif; cursor:pointer; }
    .spot-btn:hover{ background: rgba(255,255,255,.18); }
    .spot-followups{ display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.5rem; padding-top:.5rem;
      border-top:1px solid rgba(255,255,255,0.14); }
    .spot-followups .chip{ line-height:1; padding:.55rem .8rem; border-radius:9999px;
      border: 1px solid rgba(255,255,255,0.20); background: rgba(255,255,255,0.10);
      backdrop-filter: blur(6px); cursor:pointer; font:600 12px/1 ui-sans-serif; color:#eaf2ff; }
    .spot-followups .chip:hover{ filter:brightness(1.08); }
    @media (max-width: 880px){ .spotlight-card{ left: 16px; width: 86vw; bottom: calc(16vh + 80px); } }
    @media (max-width: 390px){
      .spotlight-card{ left: 12px; width: 90vw; bottom: calc(22vh + 64px); padding: 12px; }
      .spot-body{ font: 600 14px/1.35 ui-sans-serif,system-ui; max-height: 34vh; }
      .spot-row{ gap:6px; }
      .spot-btn{ padding:5px 9px; font-size:11px; }
    }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  let card = null;
  let answerAcc = '';

  function ensureCard(){
    if(card) return card;
    card = document.createElement('div'); card.className='spotlight-card';
    const titleEl = document.createElement('div'); titleEl.className='spot-title'; titleEl.textContent='Antwort';
    const bodyEl  = document.createElement('div'); bodyEl.className='spot-body'; bodyEl.textContent='…';
    const follow   = document.createElement('div'); follow.className='spot-followups';
    const btnRow = document.createElement('div'); btnRow.className='spot-row';
    const btnOpen  = document.createElement('button'); btnOpen.className='spot-btn'; btnOpen.textContent='Weiter im Chat ⟶';
    btnOpen.addEventListener('click', ()=>{ try{ if(window.ChatDock && (ChatDock.open||ChatDock.focus)){ (ChatDock.open||ChatDock.focus).call(ChatDock); } }catch(_){}; });
    const btnClose = document.createElement('button'); btnClose.className='spot-btn'; btnClose.textContent='Schließen';
    btnClose.addEventListener('click', ()=>{ if(card){ card.classList.remove('show'); setTimeout(()=>{ card && card.remove(); card=null; }, 300); } });
    btnRow.appendChild(btnClose); btnRow.appendChild(btnOpen);
    card.appendChild(titleEl);
    card.appendChild(bodyEl);
    card.appendChild(follow);
    card.appendChild(btnRow);
    document.body.appendChild(card);
    requestAnimationFrame(()=> card.classList.add('show'));
    return card;
  }

  function updateBody(){
    const c = ensureCard();
    const bodyEl = c.querySelector('.spot-body');
    const txt = (answerAcc.length > 540 ? answerAcc.slice(0,520) + ' …' : answerAcc);
    bodyEl.textContent = txt;
  }

  function showFollowups(){
    const c = ensureCard();
    const follow = c.querySelector('.spot-followups');
    if(!follow) return;
    follow.innerHTML = '';
    const excerpt = answerAcc.length > 800 ? answerAcc.slice(0,800) + ' …' : answerAcc;
    const defs = [
      { type:'more', label:'Noch konkreter?' },
      { type:'risk', label:'Risiko/Trade-off?' },
      { type:'mini', label:'Mini-Beispiel' }
    ];
    defs.forEach(({ type, label })=>{
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = label;
      b.addEventListener('click', ()=>{
        let prompt;
        if(type==='more'){
          prompt = `Noch konkreter, bitte. Liefere präzise Schritte (1–3), je Schritt ein Outcome.\n\nAuszug letzte Antwort:\n${excerpt}`;
        } else if(type==='risk'){
          prompt = `Gegencheck zur letzten Antwort: Risiken, Trade‑offs, Abhängigkeiten und typische Fehlannahmen. Schließe mit einer kurzen Prüf‑Checkliste.\n\nAuszug letzte Antwort:\n${excerpt}`;
        } else {
          prompt = `Gib ein kompaktes Mini‑Beispiel (realistisch, 5–8 Sätze) zur letzten Antwort. Verwende Namen/Variablen neutral und ersetze Platzhalter sinnvoll.\n\nAuszug letzte Antwort:\n${excerpt}`;
        }
        try{ ChatDock.send(prompt); }catch(_){}
      });
      follow.appendChild(b);
    });
  }

  // Ereignisse aus dem Chat
  window.addEventListener('chat:send', ()=>{
    answerAcc = '';
    const c = ensureCard();
    const follow = c.querySelector('.spot-followups');
    if(follow) follow.innerHTML = '';
    updateBody();
  });
  window.addEventListener('chat:delta', (ev)=>{
    const delta = (ev.detail && ev.detail.delta) ? ev.detail.delta : '';
    answerAcc += delta;
    updateBody();
  });
  window.addEventListener('chat:done', ()=>{
    showFollowups();
  });
})();