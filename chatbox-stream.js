/* chatbox-stream.js — improved ChatDock with SSE streaming and fallbacks.
 *  - Uses window.HOHLROCKS_CHAT_BASE to determine API base.
 *  - Dispatches chat:send, chat:delta and chat:done events so answer overlays can react.
 *  - Exposes ChatDock global with send(), open()/focus() and sendAttachment() methods.
 */
(function(){
  'use strict';
  // Determine API base from global or fallback
  const API_BASE = (window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/,'');
  const SSE_PATH  = '/chat-sse';
  const JSON_PATH = '/chat';

  // Helper query selector
  function qs(sel){ return document.querySelector(sel); }

  /**
   * Stream an answer from the server. It will try the SSE endpoint first and
   * falls back to the JSON endpoint if streaming isn't available. During the
   * stream it will dispatch "chat:delta" events with a `detail.delta` field
   * containing the newest chunk. When the stream completes or fails it will
   * dispatch a "chat:done" event.
   * @param {string} prompt
   */
  function streamAnswer(prompt){
    const pane = qs('#chat-output');
    if(!pane) return;
    // Clear previous contents and prepare output area
    pane.innerHTML = '';
    const streamEl = document.createElement('div');
    streamEl.className = 'stream';
    pane.appendChild(streamEl);
    pane.classList.add('show');
    // Emit chat:send event (in case caller didn't)
    try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}

    // Try the SSE-ish endpoint using fetch + ReadableStream
    const fetchOpts = {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ prompt }),
      mode:'cors'
    };
    fetch(API_BASE + SSE_PATH, fetchOpts).then(res=>{
      if(!res.ok || !res.body){ throw new Error('no stream'); }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      function read(){
        return reader.read().then(({done, value})=>{
          if(done){
            try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
            return;
          }
          const chunk = decoder.decode(value, { stream:true });
          // Append new content
          streamEl.textContent += chunk;
          pane.scrollTop = pane.scrollHeight;
          // Notify listeners (e.g. spotlight-card) about incremental delta
          try{ window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: chunk } })); }catch{}
          return read();
        });
      }
      return read();
    }).catch(()=>{
      // Fallback: use plain JSON endpoint
      fetch(API_BASE + JSON_PATH, fetchOpts).then(r=>r.json()).then(json=>{
        const answer = json && (json.answer || json.text || json.message || '');
        streamEl.textContent = answer || '';
        pane.scrollTop = pane.scrollHeight;
        try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
      }).catch(()=>{
        streamEl.textContent = 'Fehler beim Abruf.';
        pane.scrollTop = pane.scrollHeight;
        try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
      });
    });
  }

  /**
   * Initialise the chat dock by wiring up input and send button. It accepts
   * optional selectors for the input and button. When the user submits a prompt
   * the prompt is sent to the API and the input is cleared.
   * @param {object} opts
   * @param {string} opts.inputSel
   * @param {string} opts.buttonSel
   */
  function initChatDock(opts){
    opts = opts || {};
    const inputSel  = opts.inputSel  || '#chat-input';
    const buttonSel = opts.buttonSel || '#chat-send';
    const input  = qs(inputSel);
    const button = qs(buttonSel);
    if(!input || !button) return;
    function submit(){
      const prompt = input.value.trim();
      if(!prompt) return;
      input.value = '';
      // Emit chat:send and stream answer
      try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}
      streamAnswer(prompt);
    }
    button.addEventListener('click', submit);
    input.addEventListener('keydown', e=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        submit();
      }
    });
    // Optional: close panel on outside click
    document.addEventListener('click', ev=>{
      const pane = qs('#chat-output');
      if(!pane) return;
      if(pane.classList.contains('show') && !ev.target.closest('#chat-output') && !ev.target.closest('.chat-dock')){
        pane.classList.remove('show');
      }
    });
  }

  // Expose ChatDock API
  const cd = window.ChatDock = window.ChatDock || {};
  cd.config = cd.config || {};
  /**
   * Initialise ChatDock. Accepts selectors and other options (currently unused).
   */
  cd.initChatDock = function(opts){ initChatDock(opts); cd.config = opts || {}; };
  /**
   * Send a prompt immediately. This triggers streaming and events.
   * @param {string} prompt
   */
  cd.send = function(prompt){
    if(!prompt) return;
    streamAnswer(String(prompt));
  };
  /**
   * Focus or open the chat output panel.
   */
  cd.open = cd.focus = function(){
    const pane = qs('#chat-output');
    if(pane) pane.classList.add('show');
  };
  /**
   * Send an attachment with an optional prompt. For now attachments are ignored.
   * @param {object} opts
   * @param {string} opts.prompt
   */
  cd.sendAttachment = function(opts){
    opts = opts || {};
    const prompt = opts.prompt || '';
    cd.send(prompt);
  };
})();
