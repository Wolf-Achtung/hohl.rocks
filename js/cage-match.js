/* cage-match.js — model dropdown UI */(function(){
  async function loadModels(){try{ return await fetch('/api/models.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return []; }}
  function ui(models){
    const opts = models.map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
    const html = `
      <div style="display:grid;gap:10px">
        <label>Prompt<br/><textarea id="cm_prompt" rows="4" style="width:100%;">Erkläre RAG in 3 Sätzen und gib ein deutsches Praxisbeispiel.</textarea></label>
        <div style="display:flex;gap:10px;">
          <label style="flex:1">Modell A<br/><select id="cm_a" style="width:100%">${opts}</select></label>
          <label style="flex:1">Modell B<br/><select id="cm_b" style="width:100%">${opts}</select></label>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="cm_run" style="border-radius:999px;border:1px solid rgba(255,255,255,.18);padding:8px 12px;cursor:pointer;">Vergleichen</button>
        </div>
        <div id="cm_out" style="white-space:pre-wrap;"></div>
      </div>`;
    openAnswerPopup(html,true);
    document.getElementById('cm_run').onclick = async ()=>{
      const prompt = document.getElementById('cm_prompt').value.trim();
      const modelA = document.getElementById('cm_a').value;
      const modelB = document.getElementById('cm_b').value;
      const out = document.getElementById('cm_out');
      out.textContent = '⏳ vergleiche…';
      try{
        const r = await fetch('/llm/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,modelA,modelB})});
        const j = await r.json();
        const rubric = (txt)=>{
          const len = (txt||'').length;
          const clarity = Math.min(5, 1 + Math.round(len/250));
          const brev = Math.max(1, 6 - Math.round(len/280));
          const concrete = (txt||'').match(/\d|Beispiel|Schritt|→|\|/gi) ? 4 : 2;
          return `Klarheit ${clarity}/5 · Kürze ${brev}/5 · Konkretion ${concrete}/5`;
        };
        out.textContent = `⚔️ Cage‑Match\n\nA) ${j.modelA?.name||modelA}\n${rubric(j.modelA?.text||'–')}\n\n${j.modelA?.text||'(keine Antwort)'}\n\nB) ${j.modelB?.name||modelB}\n${rubric(j.modelB?.text||'–')}\n\n${j.modelB?.text||'(keine Antwort)'}`;
      }catch(e){ out.textContent = 'Fehler: '+e; }
    };
  }
  async function openCageMatch(){ const m = await loadModels(); if(!m.length){ openAnswerPopup('Keine Modelle in /api/models.json'); return; } ui(m); }
  window.openCageMatch=openCageMatch;
})();