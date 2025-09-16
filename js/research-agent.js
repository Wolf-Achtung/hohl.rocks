/* research-agent.js — SSE client */
(function(){
  function setText(el, t){ el.textContent=t; }
  function panel(){ const p=document.createElement('div'); p.style.whiteSpace='pre-wrap'; return p; }
  async function startResearch(q){
    const p=panel(); openAnswerPopup('Recherche gestartet…'); document.querySelector('#answer-popup .popup-content').replaceChildren(p);
    const ev=new EventSource(`/research-sse?q=${encodeURIComponent(q)}`);
    ev.onmessage=(e)=>{ try{ const {chunk}=JSON.parse(e.data||'{}'); if(!chunk) return;
      if(chunk.phase==='plan'){ setText(p, '🧭 Plan:\n- '+chunk.steps.join('\n- ')); }
      else if(chunk.phase==='triage'){ setText(p, p.textContent+'\n\n🔎 Triage (gefiltert):\n'+chunk.items.map((it,i)=>`${i+1}. ${it.title}\n   ${it.url}\n   Gist: ${it.gist}`).join('\n')); }
      else if(chunk.phase==='synthesis'){ setText(p, p.textContent+'\n\n🧪 Synthese:\n'+chunk.text+'\n\n🔗 Quellen:\n'+chunk.cites.map(c=>'- '+c).join('\n')); }
    }catch(_){}};
    ev.addEventListener('done', ()=>ev.close());
    ev.onerror=()=>{ ev.close(); setText(p, p.textContent+'\n\n(Verbindung beendet)'); };
  }
  document.addEventListener('keydown',(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key==='r'){ const q=prompt('Recherchethema?'); if(q) startResearch(q);} });
  window.startResearch=startResearch;
})();