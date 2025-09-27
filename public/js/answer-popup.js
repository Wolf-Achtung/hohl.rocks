/* public/js/answer-popup.js — translucent popup with title, body, copy + try-it chipbar */
(function(){
  const cssBtn = { borderRadius:'999px', border:'1px solid rgba(255,255,255,.18)', padding:'8px 12px', cursor:'pointer' };
  function ensure(){
    let p = document.getElementById('answer-popup');
    if (p) return p;
    p = document.createElement('div');
    p.id = 'answer-popup';
    Object.assign(p.style, {
      position:'fixed', left:'50%', top:'9%', transform:'translateX(-50%)',
      width:'min(920px,92vw)', maxHeight:'78vh', overflow:'hidden',
      background:'rgba(12,16,22,.42)', border:'1px solid rgba(255,255,255,.14)',
      backdropFilter:'blur(12px)', borderRadius:'18px', padding:'14px',
      zIndex: 1400, color:'#eaf2ff', display:'none', boxShadow:'0 18px 60px rgba(0,0,0,.35)'
    });
    const h = document.createElement('div'); h.className='popup-head';
    Object.assign(h.style,{display:'flex',gap:'8px',justifyContent:'space-between',alignItems:'center',margin:'2px 4px 8px 4px'});
    const title = document.createElement('div'); title.className='popup-title';
    Object.assign(title.style,{fontWeight:'800',letterSpacing:'.2px'}); h.appendChild(title);
    const tools = document.createElement('div'); tools.style.display='flex'; tools.style.gap='8px';
    const copy = document.createElement('button'); copy.textContent='Kopieren'; Object.assign(copy.style, cssBtn);
    const close = document.createElement('button'); close.textContent='Schließen'; Object.assign(close.style, cssBtn);
    tools.appendChild(copy); tools.appendChild(close); h.appendChild(tools); p.appendChild(h);
    const chips = document.createElement('div'); chips.className='popup-chips';
    Object.assign(chips.style,{display:'flex',gap:'8px',flexWrap:'wrap',margin:'0 4px 8px 4px'});
    ['Kürzer','Beispiel','Checkliste'].forEach(label=>{
      const b=document.createElement('button'); b.textContent=label;
      Object.assign(b.style,{borderRadius:'999px',border:'1px solid rgba(255,255,255,.18)',padding:'6px 10px',cursor:'pointer',background:'rgba(255,255,255,.10)'});
      b.dataset.kind=label.toLowerCase(); chips.appendChild(b);
    });
    p.appendChild(chips);
    const body = document.createElement('div'); body.className='popup-body';
    Object.assign(body.style,{whiteSpace:'pre-wrap', maxHeight:'62vh', overflow:'auto', lineHeight:'1.55'});
    p.appendChild(body);
    document.body.appendChild(p);

    copy.onclick = ()=>{ const text = body.innerText || ''; navigator.clipboard.writeText(text); copy.textContent='Kopiert!'; setTimeout(()=>copy.textContent='Kopieren', 1200); };
    close.onclick = ()=>{ p.style.display='none'; };

    chips.addEventListener('click', (ev)=>{
      const b = ev.target.closest('button'); if(!b) return;
      if(!window.runClaudeToPopup || !window.__lastPrompt) return;
      const base = window.__lastPrompt;
      let mod = '';
      if (b.dataset.kind==='kürzer') mod = 'Fasse das Ergebnis in genau 5 kurzen Sätzen zusammen. Behalte alle harten Fakten.';
      if (b.dataset.kind==='beispiel') mod = 'Gib ein konkretes, realistisch wirkendes Beispiel mit plausiblen Zahlen/Variablen.';
      if (b.dataset.kind==='checkliste') mod = 'Wandle das Ergebnis in eine nummerierte, ausführbare Checkliste mit klaren Kriterien.';
      const prompt = base + "\n\n---\nZusatz:\n" + mod;
      window.runClaudeToPopup(window.__lastHeading || 'Weiterbearbeitung', prompt, {replace:true});
    });

    p._els = { title, body, chips };
    return p;
  }

  window.openAnswerPopup = function(content, asHTML=false, heading='Ergebnis'){
    const pop = ensure();
    const { title, body } = pop._els;
    title.textContent = String(heading || 'Ergebnis');
    if (asHTML) body.innerHTML = content;
    else body.textContent = content;
    pop.style.display = 'block';
  };

  window._ensureAnswerPopup = ensure;
})();