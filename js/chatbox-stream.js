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

    // Helper to parse SSE lines
    const readSSE = (url) => {
      fetch(url).then(res => {
        if(!res.ok || !res.body){ throw new Error('no stream'); }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        function process(){
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';
          for(const line of lines){
            if(!line.trim()) continue;
            if(line.startsWith('data:')){
              const dataStr = line.slice(5).trim();
              if(!dataStr) continue;
              let data;
              try { data = JSON.parse(dataStr); } catch { continue; }
              if(data && typeof data.text !== 'undefined'){
                streamEl.textContent += data.text;
                pane.scrollTop = pane.scrollHeight;
                try{ window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: data.text } })); }catch{};
              }
              if(data && data.done){
                try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{};
                return;
              }
            }
          }
        }
        function read(){
          return reader.read().then(({ done, value }) => {
            if(done){ process(); try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}; return; }
            buffer += decoder.decode(value, { stream:true });
            process();
            return read();
          });
        }
        return read();
      }).catch(() => {
        // Fallback to JSON endpoint on error
        postJson(prompt);
      });
    };
    // Build query parameters for SSE
    const params = new URLSearchParams();
    params.set('message', String(prompt));
    const cfg = (window.ChatDock && ChatDock.config) || {};
    if(cfg.systemPrompt) params.set('systemPrompt', cfg.systemPrompt);
    if(cfg.model) params.set('model', cfg.model);
    const url = API_BASE + SSE_PATH + '?' + params.toString();
    readSSE(url);
  }

  // Send a non-streaming JSON request to /chat as fallback
  function postJson(prompt){
    const pane = qs('#chat-output');
    if(!pane) return;
    pane.innerHTML = '';
    const streamEl = document.createElement('div');
    streamEl.className = 'stream';
    pane.appendChild(streamEl);
    pane.classList.add('show');
    const body = { message: String(prompt) };
    const cfg = (window.ChatDock && ChatDock.config) || {};
    if(cfg.systemPrompt) body.systemPrompt = cfg.systemPrompt;
    if(cfg.model) body.model = cfg.model;
    fetch(API_BASE + JSON_PATH, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).then(json => {
      const answer = json && (json.answer || json.text || json.message || '');
      streamEl.textContent = answer || '';
      pane.scrollTop = pane.scrollHeight;
    }).catch(() => {
      streamEl.textContent = 'Fehler beim Abruf.';
      pane.scrollTop = pane.scrollHeight;
    }).finally(() => {
      try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{};
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
