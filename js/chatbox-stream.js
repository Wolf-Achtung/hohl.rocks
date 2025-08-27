/*! chatbox-stream.js — ChatDock mit SSE + Exponential Backoff + Request-IDs */
(function () {
  'use strict';
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

  async function streamSSE({ message, systemPrompt, model, onDelta, onDone, rid }) {
    const res = await fetch(CHAT_BASE + SSE_PATH + '?rid=' + encodeURIComponent(rid||''), {
      method:'POST',
      headers:{'Content-Type':'application/json', 'X-Request-ID': (rid||'')},
      body: JSON.stringify({ message, systemPrompt, model, rid }),
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
          }catch(_){ /* ignore non-JSON */ }
        }
      }
    }
    onDone && onDone();
  }

  async function trySSEWithBackoff(opts){
    const maxTries = 4;
    for (let i=0;i<maxTries;i++){
      try{
        const attempt = i+1;
        try { window.dispatchEvent(new CustomEvent('chat:attempt', { detail: { rid: opts.rid, attempt } })); } catch(_){}
        await streamSSE(opts);
        return true;
      }catch(_){
        const base = 700; const jitter = 0.6 + Math.random()*0.6; // 0.6–1.2x
        const wait = Math.min(6500, Math.round(base * Math.pow(2,i) * jitter));
        await new Promise(r=>setTimeout(r, wait));
      }
    }
    return false;
  }

  async function fetchJSON({ message, systemPrompt, model, image, rid }) {
    const res = await fetch(CHAT_BASE + JSON_PATH + '?rid=' + encodeURIComponent(rid||''), {
      method:'POST',
      headers:{'Content-Type':'application/json', 'X-Request-ID': (rid||'')},
      body: JSON.stringify({ message, systemPrompt, model, image, rid }),
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
    const system = String(opts.systemPrompt || '').trim();
    const model  = opts.model || 'gpt-4o-mini';

    if (!output){
      output = document.createElement('div');
      output.id='chat-output';
      document.body.appendChild(output);
    }

    function bubble(role, text){
      const out = output;
      out.classList.add('show');
      const wrap = el('div', {class:'bubble-row '+role},
        el('div', {class:'b-inner'}, text||'')
      );
      out.appendChild(wrap);
      return wrap.querySelector('.b-inner');
    }

    async function send(message){
      const msg = String(message || input.value || '').trim();
      if (!msg) return;
      input.value='';
      button && (button.disabled=true);
      try { window.dispatchEvent(new CustomEvent('chat:send', { detail: { } })); } catch(_){}

      bubble('user', msg);
      const abot = bubble('assistant', 'Antwort kommt gleich …');
      let acc='';
      const rid = (Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6));
      window.ChatDock = Object.assign(window.ChatDock||{}, { lastRid: rid });
      try { window.dispatchEvent(new CustomEvent('chat:request', { detail: { rid } })); } catch(_){}
      const onDelta = (d)=>{ acc += d; abot.textContent = acc; try { window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: d } })); } catch(_){}};
      const onDone  = ()=>{ button && (button.disabled=false); try { window.dispatchEvent(new CustomEvent('chat:done', { detail: {} })); } catch(_){}};

      window.ChatDock = Object.assign(window.ChatDock||{}, { lastUser: msg });

      try{
        const ok = await trySSEWithBackoff({ message: msg, systemPrompt: system, model, onDelta, onDone, rid });
        if (!ok){
          const full = await fetchJSON({ message: msg, systemPrompt: system, model, rid });
          abot.textContent = full;
          onDone();
        }
      }catch(_){
        try{
          const full = await fetchJSON({ message: msg, systemPrompt: system, model, rid });
          abot.textContent = full;
        }catch(__){
          abot.textContent = 'Server gerade nicht erreichbar. Bitte kurz neu versuchen.';
        }finally{
          onDone();
        }
      }
    }

    async function sendAttachment({ dataUrl, prompt }){
      try { window.dispatchEvent(new CustomEvent('chat:send', { detail: { hasImage:true } })); } catch(_){}
      if(!dataUrl) return;
      const msg = (prompt||'Bitte bewerte dieses Bild seriös in 5 Punkten, inkl. möglicher nächster Schritte.');
      button && (button.disabled=true);

      const ub = bubble('user', '');
      const imgWrap = el('div', {class:'upl-img'} , el('img', {src:dataUrl, alt:'Upload'}));
      const txtNode = el('div', {class:'upl-txt'}, msg);
      ub.appendChild(imgWrap); ub.appendChild(txtNode);

      const abot = bubble('assistant', 'Antwort kommt gleich …');
      try{
        const full = await fetchJSON({ message: msg, systemPrompt: system, model, image: dataUrl });
        abot.textContent = (typeof full==='string') ? full : (full.answer || '');
      }catch(_){
        abot.textContent = 'Bild-Upload wird vom Server aktuell nicht unterstützt.';
      }finally{
        button && (button.disabled=false);
        try { window.dispatchEvent(new CustomEvent('chat:done', { detail: {} })); } catch(_){}
      }
    }

    if (button) button.addEventListener('click', e=>{ e.preventDefault(); send(); });
    if (input)  input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });

    window.ChatDock = Object.assign(window.ChatDock||{}, {
      config: { systemPrompt: system, model },
      send, sendAttachment,
      open: ()=>{ try{ input && input.focus(); }catch(_){}},
      focus: ()=>{ try{ input && input.focus(); }catch(_){}},
      initChatDock
    });
  }

  window.ChatDock = Object.assign(window.ChatDock||{}, { initChatDock });
})();
