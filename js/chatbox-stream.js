/*! chatbox-stream.js — Gold Edition
 *
 * Purpose
 * -------
 *  Frontend helper that streams assistant answers from a backend exposing:
 *    GET  /chat-sse?message=...&systemPrompt=...&model=...   (Server-Sent Events)
 *    POST /chat                                              (JSON fallback)
 *
 * Key points
 * ----------
 *  - Robust SSE parser: extracts only textual content (choices[0].delta.content)
 *  - No JSON garbage in the UI
 *  - Keeps protocol intact when trimming HOHLROCKS_CHAT_BASE (no https:/ bug)
 *  - Spotlight-friendly: Chat pane stays hidden when Spotlight mode is active
 *  - No optional chaining (works on slightly older browsers)
 */
(function(){
  'use strict';

  /* ------------------------------------------------------------------------
   * Configuration
   * ---------------------------------------------------------------------- */
  // Trim ONLY trailing slashes; do not collapse internal double slashes.
  // Collapsing "//" would break "https://".
  var API_BASE  = String(window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/, '');
  var SSE_PATH  = '/chat-sse';
  var JSON_PATH = '/chat';

  // Stored options for system prompt and model
  var configOpts = { systemPrompt: '', model: '' };

  /* ------------------------------------------------------------------------
   * Small helpers
   * ---------------------------------------------------------------------- */
  function qs(sel){ return document.querySelector(sel); }

  function appendText(pane, streamEl, text){
    if (!text) return;
    streamEl.textContent += text;
    pane.scrollTop = pane.scrollHeight;
    try {
      window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: text } }));
    } catch(e){ /* ignore */ }
  }

  /* ------------------------------------------------------------------------
   * Streaming logic
   * ---------------------------------------------------------------------- */
  function streamAnswer(message){
    var pane = qs('#chat-output');
    if(!pane) return;

    // Reset/render a minimal stream container
    pane.innerHTML = '';
    var streamEl = document.createElement('div');
    streamEl.className = 'stream';
    pane.appendChild(streamEl);

    // Spotlight zeigt die Antwort – das Chat-Pane bleibt versteckt
    if (String(window.__ANSWER_MODE || '').toLowerCase() !== 'spotlight'){
      pane.classList.add('show');
    }

    // Notify listeners
    try { window.dispatchEvent(new CustomEvent('chat:send')); } catch(e){}

    // Build query
    var params = new URLSearchParams();
    params.set('message', message || '');
    if(configOpts.systemPrompt) params.set('systemPrompt', configOpts.systemPrompt);
    if(configOpts.model)        params.set('model',        configOpts.model);

    // --- Robust SSE line handler -----------------------------------------
    var buffer = '';
    function handleChunk(text){
      buffer += text;
      var idx;
      while((idx = buffer.indexOf('\n')) >= 0){
        var line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if(line.slice(0,5) !== 'data:') continue;

        var payload = line.slice(5).trim();
        if(!payload) continue;

        if(payload === '[DONE]'){
          try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(e){}
          return;
        }

        // JSON event (OpenAI-style)
        if(payload.charAt(0) === '{'){
          try{
            var obj = JSON.parse(payload);
            var ch  = obj && obj.choices && obj.choices[0];
            if (ch && ch.delta && typeof ch.delta.content === 'string'){
              appendText(pane, streamEl, ch.delta.content);
              continue;
            }
            if (ch && ch.message && typeof ch.message.content === 'string'){
              appendText(pane, streamEl, ch.message.content);
              continue;
            }
            // Fallback for known fields
            var txt = (obj.answer || obj.text || obj.message || obj.content || '');
            if (txt) appendText(pane, streamEl, String(txt));
          }catch(e){
            // ignore malformed lines
          }
          continue;
        }

        // Plain text fallback
        appendText(pane, streamEl, payload);
      }
    }

    // --- Try SSE first ----------------------------------------------------
    fetch(API_BASE + SSE_PATH + '?' + params.toString(), { method:'GET', mode:'cors' })
      .then(function(res){
        if(!res.ok || !res.body) throw new Error('no stream');
        var reader  = res.body.getReader();
        var decoder = new TextDecoder();
        function read(){
          return reader.read().then(function(rv){
            var done  = rv.done;
            var value = rv.value;
            if(done){
              try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(e){}
              return;
            }
            var chunk = decoder.decode(value, { stream:true });
            handleChunk(chunk);
            return read();
          });
        }
        return read();
      })
      .catch(function(){
        // Fallback: plain JSON POST
        var body = { message: message || '' };
        if(configOpts.systemPrompt) body.systemPrompt = configOpts.systemPrompt;
        if(configOpts.model)        body.model        = configOpts.model;

        fetch(API_BASE + JSON_PATH, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(body),
          mode:'cors'
        })
        .then(function(r){ return r.json(); })
        .then(function(json){
          var answer = (json && (json.answer || json.text || json.message || json.content || '')) || '';
          streamEl.textContent = answer;
          pane.scrollTop = pane.scrollHeight;
          try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(e){}
        })
        .catch(function(){
          streamEl.textContent = 'Fehler beim Abruf.';
          pane.scrollTop = pane.scrollHeight;
          try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(e){}
        });
      });
  }

  /* ------------------------------------------------------------------------
   * Bootstrap and API
   * ---------------------------------------------------------------------- */
  function initChatDock(opts){
    opts = opts || {};
    if(opts.systemPrompt) configOpts.systemPrompt = String(opts.systemPrompt || '');
    if(opts.model)        configOpts.model        = String(opts.model || '');

    var inputSel  = opts.inputSel  || '#chat-input';
    var buttonSel = opts.buttonSel || '#chat-send';
    var input  = qs(inputSel);
    var button = qs(buttonSel);

    if(input && button){
      function submit(){
        var prompt = (input.value || '').trim();
        if(!prompt) return;
        input.value = '';
        streamAnswer(prompt);
      }
      button.addEventListener('click', submit);
      input.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); submit(); }
      });
    }

    // Optional: Klick außerhalb schließt Chat-Pane (nur wenn sichtbar)
    document.addEventListener('click', function(ev){
      var pane = qs('#chat-output');
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
  var cd = window.ChatDock = window.ChatDock || {};
  cd.config        = configOpts;
  cd.initChatDock  = function(opts){ initChatDock(opts); };
  cd.send          = function(prompt){ if(prompt) streamAnswer(String(prompt)); };
  cd.open = cd.focus = function(){ var pane = qs('#chat-output'); if(pane) pane.classList.add('show'); };
  cd.sendAttachment = function(opts){ opts = opts || {}; var prompt = opts.prompt || ''; cd.send(prompt); };
})();
