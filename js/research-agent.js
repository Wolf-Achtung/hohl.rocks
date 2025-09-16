/* research-agent.js — SSE client for /research-sse */
(function(){
  function s(el,txt){ el.textContent=txt; }
  function ensurePanel(){
    const p=document.createElement('div'); p.style.whiteSpace='pre-wrap';
    return p;
  }
  async function startResearch(q){
    const panel = ensurePanel(); openAnswerPopup('Recherche gestartet…'); document.querySelector('#answer-popup .popup-content').replaceChildren(panel);
    const url = `/research-sse?q=${encodeURIComponent(q)}`;
    const ev = new EventSource(url);
    ev.onmessage = (e)=>{
      try{
        const {chunk}=JSON.parse(e.data||'{}');
        if(!chunk) return;
        if(chunk.phase==='plan'){
          s(panel, '🧭 Plan:\n- '+chunk.steps.join('\n- '));
        }else if(chunk.phase==='triage'){
          s(panel, panel.textContent + '\n\n🔎 Triage:\n' + chunk.items.map((it,i)=>`${i+1}. ${it.title}\n   ${it.url}\n   Gist: ${it.gist}`).join('\n'));
        }else if(chunk.phase==='synthesis'){
          s(panel, panel.textContent + '\n\n🧪 Synthese:\n' + chunk.text + '\n\n🔗 Quellen:\n' + chunk.cites.map(c=>'- '+c).join('\n'));
        }
      }catch(err){/* ignore */}
    };
    ev.addEventListener('done', ()=>ev.close());
    ev.onerror = ()=>{ ev.close(); s(panel, panel.textContent + '\n\n(Verbindung beendet)'); };
  }
  document.addEventListener('keydown', (e)=>{ if(e.key==='r' && (e.metaKey||e.ctrlKey)){ const q=prompt('Recherchethema?'); if(q) startResearch(q); } });
  window.startResearch=startResearch;
})();