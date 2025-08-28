/*
 * chatbox-stream.js — Streaming-Chat mit Request‑IDs & Backoff
 *
 * Diese Version sendet Chat‑Nachrichten an das Backend und verarbeitet
 * serverseitige Antworten sowohl über Server‑Sent Events (SSE) als auch
 * über ein JSON‑Fallback. Jede Anfrage erhält eine eindeutige
 * Request‑ID (rid), die im Header und als Queryparameter übertragen wird.
 * Bei fehlgeschlagenen Verbindungen wird eine exponentielle Retry‑Strategie
 * mit Jitter angewendet. Außerdem exponiert sie ein `ChatDock`‑Objekt
 * mit den Methoden `.initChatDock()`, `.send()`, `.open()`/`.focus()` und
 * `.sendAttachment()` zur Integration in die Benutzeroberfläche.
 */
(function(){
  'use strict';
  // Basis-URL des Chat‑Backends; kann per window.HOHLROCKS_CHAT_BASE überschrieben werden
  const BASE = window.HOHLROCKS_CHAT_BASE || 'https://hohlrocks-production.up.railway.app';
  const SSE_PATH  = '/chat-sse';
  const JSON_PATH = '/chat';

  const $ = (sel, root=document) => root.querySelector(sel);
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

  // Erzeuge semi‑eindeutige Request‑IDs (Base36 + Zeitstempel)
  function genRid(){ return Math.random().toString(36).slice(2,9) + '-' + Date.now().toString(36); }

  async function streamAnswer(prompt){
    const pane = $('#chat-output');
    const streamEl = el('div','stream');
    if(pane){ pane.innerHTML=''; pane.appendChild(streamEl); pane.classList.add('show'); }
    const rid = genRid();
    // Registriere Request-ID global
    try{ window.ChatDock = window.ChatDock || {}; window.ChatDock.lastRid = rid; }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('chat:request',{ detail:{ rid } })); }catch(_){}
    const maxAttempts = 4;
    const baseDelay = 700; // ms
    for(let attempt=1; attempt<=maxAttempts; attempt++){
      try{ window.dispatchEvent(new CustomEvent('chat:attempt',{ detail:{ rid, attempt } })); }catch(_){}
      try{
        const res = await fetch(BASE + SSE_PATH + '?rid=' + encodeURIComponent(rid), {
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
          const dec = new TextDecoder('utf-8');
          while(true){
            const { done, value } = await reader.read();
            if(done) break;
            const chunk = dec.decode(value, { stream:true });
            streamEl.textContent += chunk;
            if(pane) pane.scrollTop = pane.scrollHeight;
          }
          try{ window.dispatchEvent(new CustomEvent('chat:done',{ detail:{ rid } })); }catch(_){}
          return;
        }
      }catch(_err){}
      // Backoff: exponentiell + Jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = delay * 0.3 * Math.random();
      await new Promise(r => setTimeout(r, delay + jitter));
    }
    // Fallback auf JSON Endpunkt
    try{
      const res = await fetch(BASE + JSON_PATH + '?rid=' + encodeURIComponent(rid), {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'X-Request-ID': rid
        },
        body: JSON.stringify({ prompt }),
        mode:'cors'
      });
      let data;
      try{ data = await res.json(); }catch(_){ data = null; }
      const ans = (data && (data.answer || data.text)) ? (data.answer || data.text) : String(data);
      streamEl.textContent = ans || 'Fehler beim Abruf.';
    }catch(_err){
      streamEl.textContent = 'Fehler beim Abruf.';
    }
    try{ window.dispatchEvent(new CustomEvent('chat:done',{ detail:{ rid } })); }catch(_){}
  }

  function initChatDock(opts={}){
    const input  = $(opts.inputSel  || '#chat-input');
    const button = $(opts.buttonSel || '#chat-send');
    let output   = $(opts.outputSel || '#chat-output');
    const system = opts.systemPrompt || 'Antworte präzise, deutsch, knapp, KI-Management & EU AI Act.';
    if(!input || !button){ console.warn('[ChatDock] Eingabefelder nicht gefunden.'); return; }
    if(!output){ output = el('div','chat-output'); output.id='chat-output'; document.body.appendChild(output); }
    // Hilfsfunktion für Chatbubble
    function bubble(role, text){
      const node = el('div','msg '+role);
      const bub  = el('div','bubble');
      bub.textContent = text || '';
      node.appendChild(bub);
      output.appendChild(node);
      output.scrollTop = output.scrollHeight;
      return bub;
    }
    async function handleSend(msg, hasImage){
      // dispatch event: chat:send
      try{ window.dispatchEvent(new CustomEvent('chat:send',{ detail:{ hasImage: !!hasImage } })); }catch(_){}
      const abot = bubble('assistant','');
      let acc='';
      const onDelta = d => { acc += d; abot.textContent = acc; output.classList.add('show'); output.scrollTop = output.scrollHeight; try{ window.dispatchEvent(new CustomEvent('chat:delta',{ detail:{ delta: d } })); }catch(_){}; };
      const onDone  = () => { try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch(_){}; };
      try{
        await streamAnswer(msg);
      }catch(err){
        abot.textContent = 'Serverfehler.';
      }
    }
    async function send(){
      const msg = (input.value || '').trim(); if(!msg) return;
      const userBub = bubble('user', msg);
      input.value = '';
      button.disabled=true;
      await handleSend(msg);
      button.disabled=false;
    }
    async function sendAttachment({ dataUrl, prompt }){
      const p = prompt || 'Bitte analysiere dieses Bild respektvoll in 5 Sätzen.';
      // Userbubble mit Bild
      const ub = bubble('user','');
      const imgWrap = el('div','upl-img'); const img = el('img'); img.src = dataUrl; img.alt='Upload'; imgWrap.appendChild(img);
      const txt = el('div','upl-txt'); txt.textContent = p;
      ub.appendChild(imgWrap); ub.appendChild(txt);
      await handleSend(p, true);
    }
    button.addEventListener('click', e=>{ e.preventDefault(); send(); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
    // Close output on outside click
    document.addEventListener('click', (ev)=>{
      if(output.classList.contains('show') && !ev.target.closest('#chat-output') && !ev.target.closest('.chat-dock')){
        output.classList.remove('show');
      }
    });
    // expose send, sendAttachment, open/focus on ChatDock
    const cd = window.ChatDock = window.ChatDock || {};
    cd.sendAttachment = sendAttachment;
    // override send only if not set (allows custom send to call our send)
    if(typeof cd.send !== 'function'){
      cd.send = (text)=>{ if(!text) return; input.focus(); input.value = text; input.dispatchEvent(new Event('input',{bubbles:true})); send(); };
    }
    cd.open = cd.focus = () => { try{ output.classList.add('show'); }catch(_){}; };
    cd.initChatDock = initChatDock;
  }
  // sofort initialisieren, wenn DOM bereit
  if(document.readyState !== 'loading') initChatDock(); else document.addEventListener('DOMContentLoaded', () => initChatDock());
})();