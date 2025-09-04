/* chatbox-stream.js — ChatDock with GET SSE streaming and JSON fallback.
 *
 * This module wires up a simple chat interface to a back‑end that exposes
 * two endpoints:
 *   GET  /chat-sse?message=...&systemPrompt=...&model=...  — returns a server‑sent
 *                                                            events stream
 *   POST /chat                                        — returns a JSON response
 *
 * It exposes a global `ChatDock` object with the following methods:
 *   - initChatDock(opts): configure the system prompt, model and optionally
 *                         bind an input & button
 *   - send(prompt): send a prompt immediately and stream the response
 *   - open()/focus(): show the chat output pane
 *   - sendAttachment(opts): currently forwards the prompt to send()
 *
 * The module dispatches DOM events to allow other UI components to react:
 *   - chat:send — emitted when a message starts streaming
 *   - chat:delta — emitted with { detail: { delta: string } } for every chunk
 *                  of content
 *   - chat:done — emitted once the stream has finished or on error
 */
(function(){
  'use strict';

  // Determine the API base from the global variable, trimming trailing slashes.
  // Trim only trailing slashes. Do not collapse internal double slashes so that
  // protocols like "https://" remain valid. Collapsing all slashes would
  // inadvertently turn "https://" into "https:/" and break requests.
  const API_BASE = (window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/, '');
  const SSE_PATH  = '/chat-sse';
  const JSON_PATH = '/chat';

  // Configuration options (systemPrompt and model) are stored here and
  // updated whenever initChatDock() is called.
  const configOpts = { systemPrompt: '', model: '' };

  // Helper to select a single element
  function qs(sel){ return document.querySelector(sel); }

  /**
   * Stream an answer from the server. It first tries the SSE endpoint via
   * a GET request with query parameters. If that fails, it falls back to
   * the JSON endpoint with a POST request. During the stream it dispatches
   * events so that other modules (e.g. answer overlays) can update.
   *
   * @param {string} message - the user's prompt/question
   */
  function streamAnswer(message){
    const pane = qs('#chat-output');
    if(!pane) return;
    // Reset pane and show it
    pane.innerHTML = '';
    const streamEl = document.createElement('div');
    streamEl.className = 'stream';
    pane.appendChild(streamEl);
    pane.classList.add('show');

    // Emit chat:send so listeners can react (e.g. pause the ticker)
    try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch{}

    // Build query parameters for SSE
    const params = new URLSearchParams();
    params.set('message', message);
    if(configOpts.systemPrompt) params.set('systemPrompt', configOpts.systemPrompt);
    if(configOpts.model) params.set('model', configOpts.model);

    // Helper for processing SSE chunks. The SSE endpoint sends lines
    // beginning with "data: ..." followed by a newline. A [DONE] marker
    // indicates completion. We buffer incomplete lines across chunks.
    let buffer = '';
    function handleChunk(text){
      buffer += text;
      let idx;
      while((idx = buffer.indexOf('\n')) >= 0){
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if(!line.trim()) continue;
        const prefix = 'data: ';
        if(!line.startsWith(prefix)) continue;
        const dataStr = line.slice(prefix.length);
        if(dataStr === '[DONE]'){
          try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
          return;
        }
        // The SSE may deliver either a plain text delta or a JSON object
        // (as returned by the OpenAI streaming API). Attempt to parse JSON
        // and extract the delta content. Fall back to raw text on error.
        let deltaContent = '';
        try {
          const json = JSON.parse(dataStr);
          if(json && json.choices && json.choices.length > 0){
            const choice = json.choices[0];
            if(choice.delta && typeof choice.delta.content === 'string'){
              deltaContent = choice.delta.content;
            } else if(choice.message && typeof choice.message.content === 'string'){
              deltaContent = choice.message.content;
            } else {
              deltaContent = '';
            }
          } else if(typeof json === 'string'){
            deltaContent = json;
          } else {
            deltaContent = '';
          }
        } catch(e){
          // Not JSON; treat as raw text
          deltaContent = dataStr;
        }
        if(deltaContent){
          streamEl.textContent += deltaContent;
          pane.scrollTop = pane.scrollHeight;
          try{
            window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: deltaContent } }));
          }catch{}
        }
      }
    }

    // Attempt to fetch the SSE stream
    fetch(`${API_BASE}${SSE_PATH}?${params.toString()}`, { method:'GET', mode:'cors' }).then(res=>{
      if(!res.ok || !res.body) throw new Error('no stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      function read(){
        return reader.read().then(({ done, value }) => {
          if(done){
            try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
            return;
          }
          const chunk = decoder.decode(value, { stream:true });
          handleChunk(chunk);
          return read();
        });
      }
      return read();
    }).catch(() => {
      // Fallback: plain JSON POST
      const body = { message: message };
      if(configOpts.systemPrompt) body.systemPrompt = configOpts.systemPrompt;
      if(configOpts.model) body.model = configOpts.model;
      fetch(`${API_BASE}${JSON_PATH}`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(body),
        mode:'cors'
      }).then(r => r.json()).then(json => {
        const answer = json && (json.answer || json.text || json.message || '');
        streamEl.textContent = answer || '';
        pane.scrollTop = pane.scrollHeight;
        try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
      }).catch(() => {
        streamEl.textContent = 'Fehler beim Abruf.';
        pane.scrollTop = pane.scrollHeight;
        try{ window.dispatchEvent(new CustomEvent('chat:done')); }catch{}
      });
    });
  }

  /**
   * Initialise the chat dock. Stores configuration values and, if an input
   * and button are provided, wires up event handlers. You can call this
   * without inputSel/buttonSel to only configure systemPrompt and model.
   *
   * @param {object} opts
   * @param {string} [opts.inputSel]  - selector for the input field
   * @param {string} [opts.buttonSel] - selector for the submit button
   * @param {string} [opts.systemPrompt] - system prompt to include in every
   *                                       request
   * @param {string} [opts.model] - model name to pass to the backend
   */
  function initChatDock(opts){
    opts = opts || {};
    // Save config; do not overwrite existing values with empty strings
    if(opts.systemPrompt) configOpts.systemPrompt = opts.systemPrompt;
    if(opts.model) configOpts.model = opts.model;
    const inputSel  = opts.inputSel || '#chat-input';
    const buttonSel = opts.buttonSel || '#chat-send';
    const input  = qs(inputSel);
    const button = qs(buttonSel);
    if(input && button){
      function submit(){
        const prompt = input.value.trim();
        if(!prompt) return;
        input.value = '';
        streamAnswer(prompt);
      }
      button.addEventListener('click', submit);
      input.addEventListener('keydown', e => {
        if(e.key === 'Enter'){ e.preventDefault(); submit(); }
      });
    }
    // Close the pane when clicking outside, except within the dock or ticker input
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

  // Expose the ChatDock API globally
  const cd = window.ChatDock = window.ChatDock || {};
  cd.config = configOpts;
  cd.initChatDock = function(opts){ initChatDock(opts); };
  cd.send = function(prompt){ if(prompt) streamAnswer(String(prompt)); };
  cd.open = cd.focus = function(){ const pane = qs('#chat-output'); if(pane) pane.classList.add('show'); };
  cd.sendAttachment = function(opts){ opts = opts || {}; const prompt = opts.prompt || ''; cd.send(prompt); };
})();