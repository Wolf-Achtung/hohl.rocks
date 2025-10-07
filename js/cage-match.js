/* cage-match.js — weighting */
(function(){
  async function models(){ try{ return await fetch('/api/models.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return []; } }
  const RUB=['Klarheit','Kürze','Konkretion','Struktur'];
  function score(txt, r){ const len=(txt||'').length;
    if(r==='Klarheit') return Math.min(5,1+Math.round((txt||'').split(/[.!?]/).length/3));
    if(r==='Kürze') return Math.max(1,6-Math.round(len/250));
    if(r==='Konkretion') return ((txt||'').match(/\d|Beispiel|Schritt|→|\|/gi)?4:2);
    if(r==='Struktur') return ((txt||'').match(/\n- |\n\d+\./g)?4:2); return 3; }
  function ui(ms){
    const opts=ms.map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
    const weights=RUB.map(r=>`<label>${r}<input type="range" min="0" max="3" value="1" step="1" data-r="${r}" /></label>`).join(' &nbsp; ');
    const html=`<div style="display:grid;gap:10px">
      <label>Prompt<br/><textarea id="cm_p" rows="4" style="width:100%;">Erkläre RAG in 3 Sätzen und gib ein deutsches Praxisbeispiel.</textarea></label>
      <div>${weights}</div>
      <div style="display:flex;gap:10px;"><label style="flex:1">Modell A<br/><select id="cm_a">${opts}</select></label><label style="flex:1">Modell B<br/><select id="cm_b">${opts}</select></label></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;"><button id="cm_run" style="border-radius:999px;border:1px solid rgba(255,255,255,.18);padding:8px 12px;">Vergleichen</button></div>
      <div id="cm_out" style="white-space:pre-wrap;"></div></div>`;
    openAnswerPopup(html,true);
    document.getElementById('cm_run').onclick=async()=>{
      const prompt=document.getElementById('cm_p').value.trim(); const modelA=document.getElementById('cm_a').value; const modelB=document.getElementById('cm_b').value;
      const out=document.getElementById('cm_out'); out.textContent='⏳ vergleiche…';
      const res=await fetch('/llm/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,modelA,modelB})}).then(r=>r.json());
      const W={}; document.querySelectorAll('input[type=range][data-r]').forEach(x=>W[x.dataset.r]=Number(x.value));
      function render(name, txt){ const rows=RUB.map(r=>`${r} ${score(txt,r)}/5 ×${W[r]}`).join(' · '); const total=RUB.reduce((s,r)=>s+score(txt,r)*W[r],0); return `${name}\n${rows}\nGesamt: ${total.toFixed(1)}\n\n${txt||'(keine Antwort)'}\n`; }
      out.textContent=`⚔️ Cage‑Match\n\nA) ${render(res.modelA?.name||modelA, res.modelA?.text)}\nB) ${render(res.modelB?.name||modelB, res.modelB?.text)}`;
    };
  }
  async function openCageMatch(){ const m=await models(); if(!m.length){ openAnswerPopup('Keine Modelle in /api/models.json'); return; } ui(m); }
  window.openCageMatch=openCageMatch;
})();