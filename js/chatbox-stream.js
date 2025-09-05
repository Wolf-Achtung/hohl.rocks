/* chatbox-stream.js — ChatDock with GET SSE streaming and JSON fallback
 *
 * Fixes in this version:
 *  - Robust SSE parser: extracts only textual content from JSON events (choices[0].delta.content)
 *  - Keeps protocol intact when trimming base URL (does not collapse "https://")
 *  - Spotlight mode: hides legacy chat pane while streaming
 */
(function(){
  'use strict';

  // --- Configuration --------------------------------------------------------
  // Trim ONLY trailing slashes. Do not collapse internal double slashes
  // (or you break "https://").
  const API_BASE = (window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/, '');
  const SSE_PATH  = '/chat-sse';
  const JSON_PATH = '/chat';

  const configOpts = { systemPrompt: '', model: '' };

  // Helper
  function qs(sel){ return document.querySelector(sel); }

  // Append text and dispatch delta event
  function appendText(pane, streamEl, text){
    if (!text) return;
    streamEl.textContent += text;
    pane.scrollTop = pane.scrollHeight;
    try{ window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: text } })); }catch{}
  }

  // --- Streaming ------------------------------------------------------------
  function streamAnswer(message){
    const pane = qs('#chat-output');
    if(!pane) return;

    // Reset panel
    pane.innerHTML = '';
    const streamEl = document.createElement('div');
    streamEl.className = 'stream';
    pane.appendChild(streamEl);

    // Spotlight zeigt die Antwort; Chat-Pane nicht einblenden
    if (window.__ANSWER_MODE !== 'spotlight'){
      pane.classList.add('show');
    }

    // Notify: send started
    try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}

    // Build query
    const params = new URLSearchParams();
    params.set('message', message);
    if(configOpts.systemPrompt) params.set('systemPrompt', configOpts.systemPrompt);
    if(configOpts.model)        params.set('model',        configOpts.model);

    // Robust SSE line handler
    let buffer = '';
    function handleChunk(text){
      buffer += text;
      let idx;
      while((idx = buffer.indexOf('\n')) >= 0){
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if(!line.startsWith('data:')) continue;

        const payload = line.slice('data:'.length).trim();
        if(!payload) continue;
        if(payload === '[DONE]'){
          try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
          return;
        }


    // Try SSE first
    fetch(`${API_BASE}${SSE_PATH}?${params.toString()}`, { method:'GET', mode:'cors' })
      .then(res => {
        if(!res.ok || !res.body) throw new Error('no stream');
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        function read(){
          return reader.read().then(({ done, value }) => {
            if(done){
              try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
              return;
            }
            handleChunk(decoder.decode(value, { stream:true }));
            return read();
          });
        }
        return read();
      })
      .catch(() => {
        // Fallback: plain JSON POST
        const body = { message };
        if(configOpts.systemPrompt) body.systemPrompt = configOpts.systemPrompt;
        if(configOpts.model)        body.model        = configOpts.model;

        fetch(`${API_BASE}${JSON_PATH}`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(body),
          mode:'cors'
        })
        .then(r => r.json())
        .then(json => {
          const answer = (json && (json.answer || json.text || json.message || json.content || '')) || '';
          streamEl.textContent = answer;
          pane.scrollTop = pane.scrollHeight;
          try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
        })
        .catch(() => {
          streamEl.textContent = 'Fehler beim Abruf.';
          pane.scrollTop = pane.scrollHeight;
          try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
        });
      });
  }

  // --- Bootstrap ------------------------------------------------------------
  function initChatDock(opts){
    opts = opts || {};
    if(opts.systemPrompt) configOpts.systemPrompt = opts.systemPrompt;
    if(opts.model)        configOpts.model        = opts.model;

    const inputSel  = opts.inputSel  || '#chat-input';
    const buttonSel = opts.buttonSel || '#chat-send';
    const input  = qs(inputSel);
    const button = qs(buttonSel);

    if(input && button){
      function submit(){
        const prompt = (input.value || '').trim();
        if(!prompt) return;
        input.value = '';
        streamAnswer(prompt);
      }
      button.addEventListener('click', submit);
      input.addEventListener('keydown', e => {
        if(e.key === 'Enter'){ e.preventDefault(); submit(); }
      });
    }

    // Optional: Klick außerhalb schließt Chat-Pane (wenn genutzt)
    document.addEventListener('click', ev => {
      const pane = qs('#chat-output');
      if(!pane) return;
      if(pane.classList.contains('show') &&
         !ev.target.closest('#chat-output') &&
         !ev.target.closest('.chat-dock') &&
         !ev.target.closest('.ticker-ask')){
        pane.classList.remove('show');
      }
    });
  }

  // Expose API
  const cd = window.ChatDock = window.ChatDock || {};
  cd.config        = configOpts;
  cd.initChatDock  = function(opts){ initChatDock(opts); };
  cd.send          = function(prompt){ if(prompt) streamAnswer(String(prompt)); };
  cd.open = cd.focus = function(){
    const pane = qs('#chat-output');
    if(pane) pane.classList.add('show');
  };
  cd.sendAttachment = function(opts){
    opts = opts || {};
    const prompt = opts.prompt || '';
    cd.send(prompt);
  };
})();
