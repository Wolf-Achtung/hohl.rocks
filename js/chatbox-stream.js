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

  async function streamSSE({ message, systemPrompt, model, onDelta, onDone }) {
    const res = await fetch(CHAT_BASE + SSE_PATH, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message, systemPrompt, model }),
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

  async function fetchJSON({ message, systemPrompt, model }) {
    const res = await fetch(CHAT_BASE + JSON_PATH, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message, systemPrompt, model }),
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
      const msg = (input.value||'').trim(); if(!msg) return;
      input.value=''; button.disabled=true;
      bubble('user', msg);
      const abot = bubble('assistant', '');
      let acc='';
      const onDelta = d => { acc += d; abot.textContent = acc; output.classList.add('show'); output.scrollTop = output.scrollHeight; };
      const onDone  = () => { button.disabled=false; };

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

    button.addEventListener('click', e=>{ e.preventDefault(); send(); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
  }

  window.ChatDock = { initChatDock };
})();
