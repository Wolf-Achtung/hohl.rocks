/*
 * Streamende Antworten (SSE-ähnlich via fetch/ReadableStream) + Fallback
 * Erwartete Serverendpunkte:
 *   POST https://hohlrocks-production.up.railway.app/chat-sse  (stream)
 *   POST https://hohlrocks-production.up.railway.app/chat      (json)
 */
(function(){
  const ENDPOINT_BASE = 'https://hohlrocks-production.up.railway.app';
  const STREAM_PATH = '/chat-sse';
  const FALLBACK_PATH = '/chat';

  function qs(sel){return document.querySelector(sel)}
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

  async function streamAnswer(prompt){
    const pane = qs('#chat-output');
    const streamEl = el('div','stream');
    pane.innerHTML=''; pane.appendChild(streamEl); pane.classList.add('show');
    const ctrl = new AbortController();
    try{
      const res = await fetch(ENDPOINT_BASE+STREAM_PATH, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt}),
        signal: ctrl.signal,
        mode:'cors',
      });
      if(!res.ok || !res.body) throw new Error('no-stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        const chunk = decoder.decode(value, {stream:true});
        streamEl.textContent += chunk;
        pane.scrollTop = pane.scrollHeight;
      }
    }catch(e){
      // Fallback
      const r = await fetch(ENDPOINT_BASE+FALLBACK_PATH, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt}), mode:'cors'
      });
      const j = await r.json().catch(()=>({answer: 'Fehler beim Abruf.'}));
      streamEl.textContent = j.answer || String(j);
    }
    // Markiere Fertig
    try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
  }

  function init(){
    const input = qs('#chat-input'); const btn = qs('#chat-send'); const pane = qs('#chat-output');
    if(!input || !btn) return;

    const submit = ()=>{
      const prompt = input.value.trim();
      if(!prompt) return;
      try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}
      streamAnswer(prompt);
      input.value='';
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });

    // optional: close output on outside click
    document.addEventListener('click', (ev)=>{
      if(pane.classList.contains('show') && !ev.target.closest('#chat-output') && !ev.target.closest('.chat-dock')){
        pane.classList.remove('show');
      }
    });
  }
  if(document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  // Expose ChatDock methods for external send
  (function(){
    // Ensure global ChatDock
    const cd = window.ChatDock = window.ChatDock || {};
    // Config stub
    cd.config = cd.config || {};
    // send text prompt via streamAnswer
    cd.send = function(prompt){
      if(!prompt) return;
      try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}
      streamAnswer(String(prompt));
    };
    // focus or open chat (shows output panel)
    cd.open = cd.focus = function(){
      try{
        const pane = qs('#chat-output');
        if(pane) pane.classList.add('show');
      }catch{}
    };
    // send attachment (image) plus prompt (fallback: ignore image)
    cd.sendAttachment = function(opts){
      opts = opts || {};
      const prompt = opts.prompt || '';
      cd.send(prompt);
    };
  })();
})();
