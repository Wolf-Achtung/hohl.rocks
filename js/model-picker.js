/* model-picker.js — loads models (auto-refresh) */
(function(){
  const LS_KEY='models_last_fetch';
  async function fetchModels(){
    const now=Date.now(); const last=parseInt(localStorage.getItem(LS_KEY)||'0',10);
    const maxAge=24*60*60*1000; // 24h
    const noStore={cache:'no-store'};
    if(!last || (now-last)>maxAge){
      try{ const r=await fetch('/api/models-live',{cache:'no-store'}); if(r.ok){ const j=await r.json(); localStorage.setItem(LS_KEY,String(now)); return j; } }catch(e){/*ignore*/}
    }
    try{ const res=await fetch('/api/models.json',noStore); return await res.json(); }catch(e){ return []; }
  }
  async function openModelPicker(){
    const arr = await fetchModels();
    if(!arr.length){ openAnswerPopup('Model‑Picker: keine Daten in /api/models.json (oder /api/models-live).'); return; }
    const lines = arr.map(m=>`• ${m.name} — ${m.tier}\n  Stärken: ${m.strengths.join(', ')}\n  Bestens für: ${m.best_for.join(', ')}\n  Beispiel: ${m.sample_prompt}`).join('\n\n');
    openAnswerPopup('Model‑Picker\n\n'+lines);
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    const newsBtn=document.querySelector('#nav-buttons .news');
    if(newsBtn){ newsBtn.addEventListener('dblclick', openModelPicker); }
    window.openModelPicker=openModelPicker;
  });
})();