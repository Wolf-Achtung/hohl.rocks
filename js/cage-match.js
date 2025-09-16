/* cage-match.js — compare two models via backend */
(function(){
  async function loadModels(){
    try{ return await fetch('/api/models.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return []; }
  }
  async function openCageMatch(){
    const models = await loadModels();
    const names = models.map(m=>m.name);
    const prompt = window.prompt('Cage‑Match: Welcher Prompt soll verglichen werden?', 'Erkläre RAG in 3 Sätzen und gib ein deutsches Praxisbeispiel.');
    if(!prompt) return;
    const mA = (names[0]||'gpt-4o-mini');
    const mB = (names[1]||'gpt-4o');
    const res = await fetch('/llm/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt, modelA:mA, modelB:mB})}).then(r=>r.json()).catch(()=>({}));
    const rubric = (txt)=>{
      const clarity = Math.min(5, 1 + Math.round(txt.length/250));
      const brev = Math.max(1, 6 - Math.round(txt.length/280));
      const concrete = (txt.match(/\d|z\.|Bsp|Beispiel|Schritt|→|\|/gi)||[]).length>0 ? 4 : 2;
      return `Klarheit ${clarity}/5 · Kürze ${brev}/5 · Konkretion ${concrete}/5`;
    };
    const out = [
      `⚔️ Cage‑Match\nPrompt:\n${prompt}\n\n`,
      `A) ${res.modelA?.name||mA}\n${rubric(res.modelA?.text||'–')}

${res.modelA?.text||'(keine Antwort)'}\n\n`,
      `B) ${res.modelB?.name||mB}\n${rubric(res.modelB?.text||'–')}

${res.modelB?.text||'(keine Antwort)'}\n`
    ].join('');
    openAnswerPopup(out);
  }
  window.openCageMatch=openCageMatch;
})();