/* public/js/bubble-forms.js – Input-Formular für claude-input Bubbles */
(function () {
  'use strict';

  function ensurePopup() {
    if (window._ensureAnswerPopup) return window._ensureAnswerPopup();
    const wrapId = 'fallback-answer-popup';
    let wrap = document.getElementById(wrapId);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = wrapId;
      wrap.style.cssText = 'position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:1500;min-width:min(820px,90vw);background:rgba(12,16,22,.75);color:#eaf2ff;border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:14px;backdrop-filter:blur(10px)';
      wrap.innerHTML = '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><strong id="f-t"></strong><button id="f-x" style="border-radius:999px;padding:6px 10px;border:1px solid rgba(255,255,255,.22);cursor:pointer;background:#38424a;color:#eaf2ff">Schließen</button></div><div id="f-b"></div>';
      document.body.appendChild(wrap);
      wrap.querySelector('#f-x').onclick = ()=> wrap.remove();
    }
    return wrap;
  }

  function htmlEscape(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  window.openInputBubble = function(label, template, opts){
    const shell = ensurePopup();
    const titleEl = shell.querySelector('#f-t') || shell.querySelector('.popup-title');
    const bodyEl  = shell.querySelector('#f-b') || shell.querySelector('.popup-body');

    const ph = htmlEscape(opts?.placeholder || 'Text hier einfügen…');
    const thread = opts?.thread || '';

    if (titleEl) titleEl.textContent = label || 'Eingabe';
    bodyEl.innerHTML = `
      <div style="display:grid;gap:10px">
        <textarea id="bf-text" rows="10" style="width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.18);padding:10px;background:rgba(255,255,255,.06);color:#eaf2ff" placeholder="${ph}"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="bf-send" style="border-radius:999px;border:1px solid rgba(255,255,255,.18);padding:8px 12px;cursor:pointer;background:#00b0ff;color:#04202a;font-weight:800">Senden</button>
        </div>
      </div>
    `;
    shell.style.display = 'block';

    const ta   = shell.querySelector('#bf-text');
    const send = shell.querySelector('#bf-send');
    if (ta && ta.focus) setTimeout(()=> ta.focus(), 0);

    function submit(){
      const userText = (ta?.value || '').trim();
      if (!userText) { ta && ta.focus(); return; }

      const finalPrompt = String(template||'').replace(/\{\{\s*text\s*\}\}/gi, userText);

      // in den Streaming-Modus wechseln
      if (window.openAnswerPopup) window.openAnswerPopup('', false, label);

      if (window.runClaudeToPopup) {
        window.runClaudeToPopup(label, finalPrompt, { thread });
      } else {
        fetch('/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: finalPrompt, thread }) })
          .then(r=>r.json()).then(j=>{
            const out = shell.querySelector('.popup-body') || shell.querySelector('#f-b');
            if (out) out.textContent = j.text || '[keine Antwort]';
          });
      }
    }

    send?.addEventListener('click', submit);
    ta?.addEventListener('keydown', (e)=>{ if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) submit(); });
  };
})();
