/* public/js/claude-stream.js — runClaude with SSE + JSON fallback + threads */
(function(){
  function streamToPopup(label, prompt, opts){
    const thread = opts && opts.thread;
    window.__lastPrompt = prompt; window.__lastHeading = label;
    const pop = window._ensureAnswerPopup && window._ensureAnswerPopup();
    const body = pop.querySelector('.popup-body'); const ttl = pop.querySelector('.popup-title');
    if (ttl) ttl.textContent = label || 'Ergebnis';
    body.textContent = '⏳ Wird generiert …';
    pop.style.display = 'block';

    const params = new URLSearchParams({ prompt, model:(opts&&opts.model)||'', system:(opts&&opts.system)||'' });
    if(thread) params.set('thread', thread);
    const url = `/claude-sse?` + params.toString();

    let acc='';
    try {
      const ev = new EventSource(url);
      ev.onmessage = (e)=>{ try{ const j=JSON.parse(e.data); if(j.delta){ acc += j.delta; body.textContent = acc; } }catch(_){ /* ignore */ } };
      ev.addEventListener('done', ()=> ev.close());
      ev.onerror = ()=>{ ev.close(); // fallback
        fetch('/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt, thread}) })
          .then(r=>r.json()).then(j=>{ body.textContent = j.text || '[Fehler: keine Antwort]'; })
          .catch(_=>{ body.textContent = '[Netzwerkfehler]'; });
      };
    } catch (e){
      // Safari < 16
      fetch('/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt, thread}) })
        .then(r=>r.json()).then(j=>{ body.textContent = j.text || '[Fehler: keine Antwort]'; })
        .catch(_=>{ body.textContent = '[Netzwerkfehler]'; });
    }
  }

  function jsonToCanvas(label, prompt, schemaHint){
    const payload = { prompt, schemaHint };
    fetch('/claude-json', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      .then(r=>r.json()).then(j=>{
        if(j.ok && j.json){
          window.openAnswerPopup && openAnswerPopup(label + ' — Parameter geladen.', false, label);
          window.dispatchEvent(new CustomEvent('renderVisualParams',{ detail: j.json }));
        }else{
          window.openAnswerPopup && openAnswerPopup(j.rawText || 'Fehler: Keine JSON‑Parameter', false, label);
        }
      }).catch(_=> window.openAnswerPopup && openAnswerPopup('Netzwerkfehler','',label));
  }

  window.runClaudeToPopup = streamToPopup;
  window.runClaudeJSONToCanvas = jsonToCanvas;
})();