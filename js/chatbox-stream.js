/*! chatbox-stream.js — streaming chat (SSE) + fallback JSON */
(function () {
  'use strict';
  // Set your server base in HTML before loading this script:
  //   window.HOHLROCKS_CHAT_BASE = 'https://<your>.railway.app';
  const CHAT_BASE = window.HOHLROCKS_CHAT_BASE || 'https://hohlrocks-production.up.railway.app';
  const SSE_PATH  = '/chat-sse';
  const JSON_PATH = '/chat';

  const $ = (sel, root=document) => root.querySelector(sel);
  function el(tag, attrs={}, ...children){
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})){
      if (k==='class') n.className = v;
      else if (k==='style') Object.assign(n.style, v);
      else n.setAttribute(k, v);
    }
    for (const c of children){
      if (c == null) continue;
      n.appendChild(typeof c==='string'? document.createTextNode(c): c);
    }
    return n;
  }

  async function streamSSE({ message, systemPrompt, model, onDelta, onDone, image }) {
    const res = await fetch(CHAT_BASE + SSE_PATH, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message, systemPrompt, model, image }),
      mode:'cors'
    });
    if (!res.ok || !res.body) throw new Error('SSE failed');
    const reader = res.body.getReader();
    const dec = new TextDecoder('utf-8');
    let buf='';
    while(true){
      const {value, done} = await reader.read();
      if (done) break;
      buf += dec.decode(value, {stream:true});
      let idx;
      while((idx = buf.indexOf('\n\n')) !== -1){
        const chunk = buf.slice(0, idx); buf = buf.slice(idx+2);
        const lines = chunk.split('\n').map(s=>s.trim()).filter(Boolean);
        for (const line of lines){
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') { onDone && onDone(); return; }
          try{
            const obj = JSON.parse(payload);
            if (obj.done) { onDone && onDone(); return; }
            if (obj.delta) onDelta && onDelta(obj.delta);
          }catch{ /* ignore non-JSON */ }
        }
      }
    }
    onDone && onDone();
  }

  async function fetchJSON({ message, systemPrompt, model, image }) {
    const res = await fetch(CHAT_BASE + JSON_PATH, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message, systemPrompt, model, image }),
      mode:'cors'
    });
    if (!res.ok) throw new Error('JSON failed');
    const j = await res.json();
    return j.answer || '';
  }

  function initChatDock(opts = {}){
    const input  = $(opts.inputSel  || '#chat-input');
    const button = $(opts.buttonSel || '#chat-send');
    let output   = $(opts.outputSel || '#chat-output');
    const system = opts.systemPrompt || 'Antworte präzise, deutsch, knapp, KI-Management & EU AI Act.';

    if (!input || !button){
      console.warn('[chatbox] input/button nicht gefunden.'); return;
    }
    if (!output){
      output = el('div',{id:'chat-output','class':'chat-output'});
      document.body.appendChild(output);
    }

    function bubble(role, text){
      const node = el('div',{class:'msg '+role}, el('div',{class:'bubble'}, text||''));
      output.appendChild(node);
      output.scrollTop = output.scrollHeight;
      return node.querySelector('.bubble');
    }

    async function send(){
      // Notify listeners that a message is being sent
      try { window.dispatchEvent(new CustomEvent('chat:send', { detail: { } })); } catch{};

      const msg = (input.value||'').trim(); if(!msg) return;
      input.value=''; button.disabled=true;
      bubble('user', msg);
      const abot = bubble('assistant', '');
      let acc='';
      const onDelta = d => {  acc += d; abot.textContent = acc; output.classList.add('show'); output.scrollTop = output.scrollHeight;  try { window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: d } })); } catch{}; };
      const onDone = () => {  button.disabled=false;  try { window.dispatchEvent(new CustomEvent('chat:done', { detail: { } })); } catch{}; };

      try{
        await streamSSE({ message: msg, systemPrompt: system, onDelta, onDone });
      }catch(e){
        try{
          const full = await fetchJSON({ message: msg, systemPrompt: system });
          abot.textContent = full;
          output.classList.add('show');
        }catch(err){
          abot.textContent = 'Server nicht erreichbar.';
        }finally{
          button.disabled=false;
        }
      }
    }

    // Expose a helper on ChatDock so external callers can send a message directly.
    // This function focuses the input, populates it with the provided text and triggers send().
    if(window.ChatDock){
      try{
        // Only set if not already provided
        if(typeof window.ChatDock.send !== 'function'){
          window.ChatDock.send = function(text){
            try{
              const m = (text||'').trim(); if(!m) return;
              input.focus();
              input.value = m;
              // Immediately dispatch input event so any reactive bindings update
              input.dispatchEvent(new Event('input',{bubbles:true}));
              // Use the internal send() to process the message
              send();
            }catch(err){ console.error('[ChatDock.send] Error:', err); }
          };
        }
      }catch(err){ /* ignore */ }
    }

    
    // --- NEW: sendAttachment({dataUrl, prompt}) — prefers JSON route for images ---
    async function sendAttachment({ dataUrl, prompt }){
      try { window.dispatchEvent(new CustomEvent('chat:send', { detail: { hasImage:true } })); } catch{};
      if(!dataUrl) return;
      const msg = (prompt||'Bitte bewerte dieses Bild seriös und knappe 5 Punkte, inkl. möglicher nächsten Schritte.');
      button.disabled=true;

      // User bubble with preview
      const ub = bubble('user', '');
      const imgWrap = el('div', {class:'upl-img'} , el('img', {src:dataUrl, alt:'Upload'}));
      const txtNode = el('div', {class:'upl-txt'}, msg);
      ub.appendChild(imgWrap); ub.appendChild(txtNode);

      // Assistant bubble + streaming or JSON fallback
      const abot = bubble('assistant', '');
      let acc='';
      const onDelta = d => { acc += d; abot.textContent = acc; try { window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: d } })); } catch{}; };
      const onDone = () => { button.disabled=false; try { window.dispatchEvent(new CustomEvent('chat:done', { detail: { } })); } catch{}; };

      // Prefer JSON for images
      try{
        const full = await fetchJSON({ message: msg, systemPrompt: system, image: dataUrl });
        abot.textContent = (typeof full==='string') ? full : (full.answer || ''); 
        output.classList.add('show');
      }catch(err){
        // Try SSE text-only as fallback (image not supported server-side)
        try{
          await streamSSE({ message: msg + "\n(Hinweis: Der Client hat ein Bild hochgeladen.)", systemPrompt: system, onDelta, onDone });
        }catch(e){
          abot.textContent = 'Bild-Upload wird vom Server aktuell nicht unterstützt.';
        }finally{
          button.disabled=false;
        }
      }
    }
button.addEventListener('click', e=>{ e.preventDefault(); send(); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
  }

  window.ChatDock = Object.assign(window.ChatDock||{}, { initChatDock, sendAttachment });
})();
