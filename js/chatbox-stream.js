/*
 * chatbox-stream.js — streamende Antworten mit Request‑IDs und Backoff
 *
 * Dieses Modul sendet Benutzereingaben an das Backend und empfängt die
 * Antwort entweder über einen Server‑Sent Events Stream oder als JSON‑Fallback.
 * Jede Anfrage erhält eine eindeutige Request‑ID (rid), die im Header und als
 * Query‑Parameter übertragen wird. Bei Netzwerkfehlern oder fehlenden
 * Antworten wird eine exponentielle Retry‑Strategie mit Jitter eingesetzt.
 */
(function(){
  'use strict';
  const ENDPOINT_BASE  = 'https://hohlrocks-production.up.railway.app';
  const STREAM_PATH    = '/chat-sse';
  const JSON_PATH      = '/chat';

  function qs(sel){ return document.querySelector(sel); }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
  // Generate a semi‑unique Request ID consisting of random base36 and timestamp
  function genRid(){ return Math.random().toString(36).slice(2,9) + '-' + Date.now().toString(36); }

  async function streamAnswer(prompt){
    const pane = qs('#chat-output');
    const streamEl = el('div','stream');
    pane.innerHTML = '';
    pane.appendChild(streamEl);
    pane.classList.add('show');
    const rid = genRid();
    try{
      window.ChatDock = window.ChatDock || {};
      window.ChatDock.lastRid = rid;
    }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('chat:request',{ detail:{ rid } })); }catch(_){}
    const maxAttempts = 4;
    const baseDelay = 700; // ms for backoff base
    for(let attempt=1; attempt<=maxAttempts; attempt++){
      try{ window.dispatchEvent(new CustomEvent('chat:attempt',{ detail:{ rid, attempt } })); }catch(_){}
      try{
        const res = await fetch(ENDPOINT_BASE + STREAM_PATH + '?rid=' + encodeURIComponent(rid), {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'X-Request-ID': rid
          },
          body: JSON.stringify({ prompt }),
          mode:'cors'
        });
        if(res.ok && res.body){
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          while(true){
            const { done, value } = await reader.read();
            if(done) break;
            const chunk = decoder.decode(value, { stream:true });
            streamEl.textContent += chunk;
            pane.scrollTop = pane.scrollHeight;
          }
          try{ window.dispatchEvent(new CustomEvent('chat:done',{ detail:{ rid } })); }catch(_){}
          return;
        }
      }catch(err){}
      // wait with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = delay * 0.3 * Math.random();
      await new Promise(res => setTimeout(res, delay + jitter));
    }
    // fallback to JSON endpoint
    try{
      const res = await fetch(ENDPOINT_BASE + JSON_PATH + '?rid=' + encodeURIComponent(rid), {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'X-Request-ID': rid
        },
        body: JSON.stringify({ prompt }),
        mode:'cors'
      });
      let data;
      try{ data = await res.json(); } catch(_){ data = null; }
      const ans = (data && (data.answer || data.text)) ? (data.answer || data.text) : String(data);
      streamEl.textContent = ans || 'Fehler beim Abruf.';
    }catch(err){
      streamEl.textContent = 'Fehler beim Abruf.';
    }
    try{ window.dispatchEvent(new CustomEvent('chat:done',{ detail:{ rid } })); }catch(_){}
  }

  function init(){
    const input = qs('#chat-input');
    const btn   = qs('#chat-send');
    const pane  = qs('#chat-output');
    if(!input || !btn) return;
    const submit = () => {
      const prompt = input.value.trim();
      if(!prompt) return;
      try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch(_){}
      streamAnswer(String(prompt));
      input.value = '';
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
    // optional: close output when clicking outside
    document.addEventListener('click', (ev)=>{
      if(pane.classList.contains('show') && !ev.target.closest('#chat-output') && !ev.target.closest('.chat-dock')){
        pane.classList.remove('show');
      }
    });
  }
  if(document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  // Expose ChatDock methods for external send
  (function(){
    const cd = window.ChatDock = window.ChatDock || {};
    cd.config = cd.config || {};
    cd.send = function(prompt){
      if(!prompt) return;
      try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch(_){}
      streamAnswer(String(prompt));
    };
    cd.open = cd.focus = function(){
      try{
        const pane = qs('#chat-output');
        if(pane) pane.classList.add('show');
      }catch(_){}
    };
    cd.sendAttachment = function(opts){
      opts = opts || {};
      const prompt = opts.prompt || '';
      cd.send(prompt);
    };
  })();
})();