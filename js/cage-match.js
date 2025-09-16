/* cage-match.js — model dropdown UI with rubrics */
(function(){
  async function loadModels(){try{ return await fetch('/api/models.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return []; }}
  async function loadRubrics(){try{ return await fetch('/api/rubrics.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return ["Klarheit","Kürze","Konkretion"]; }}
  function scoreText(txt, rubric){
    const len=(txt||'').length;
    if(rubric==="Klarheit") return Math.min(5, 1 + Math.round((txt||'').split(/[.!?]/).length/3));
    if(rubric==="Kürze") return Math.max(1, 6 - Math.round(len/250));
    if(rubric==="Konkretion") return ((txt||'').match(/\d|Beispiel|Schritt|→|\|/gi)?4:2);
    if(rubric==="Struktur") return ((txt||'').match(/\n- |\n\d+\./g)?4:2);
    return 3;
  }
  function ui(models, rubrics){
    const opts = models.map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
    const rub = rubrics.map(r=>`<label><input type="checkbox" class="cm_rb" value="${r}" checked> ${r}</label>`).join(' &nbsp; ');
    const html = `
      <div style="display:grid;gap:10px">
        <label>Prompt<br/><textarea id="cm_prompt" rows="4" style="width:100%;">Erkläre RAG in 3 Sätzen und gib ein deutsches Praxisbeispiel.</textarea></label>
        <div>${rub}</div>
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
      const active = Array.from(document.querySelectorAll('.cm_rb:checked')).map(x=>x.value);
      const out = document.getElementById('cm_out');
      out.textContent = '⏳ vergleiche…';
      try{
        const r = await fetch('/llm/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,modelA,modelB})});
        const j = await r.json();
        function summarize(name, txt){
          const scores = active.map(r=>`${r} ${scoreText(txt,r)}/5`).join(' · ');
          return `${name}\n${scores}\n\n${txt||'(keine Antwort)'}\n`;
        }
        out.textContent = `⚔️ Cage‑Match\n\nA) ${summarize(j.modelA?.name||modelA, j.modelA?.text)}\nB) ${summarize(j.modelB?.name||modelB, j.modelB?.text)}`;
      }catch(e){ out.textContent = 'Fehler: '+e; }
    };
  }
  async function openCageMatch(){ const [m, r] = await Promise.all([loadModels(), loadRubrics()]); if(!m.length){ openAnswerPopup('Keine Modelle in /api/models.json'); return; } ui(m,r); }
  window.openCageMatch=openCageMatch;
})();