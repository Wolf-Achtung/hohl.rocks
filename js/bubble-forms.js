/* public/js/bubble-forms.js
 * Form-Popup (Textarea) mit Explain-Zeile & Streaming zu Claude.
 * -> openInputBubble(label, template, { placeholder, explain, thread, model })
 *    template darf {{text}} enthalten (wird durch Eingabe ersetzt)
 */
(function () {
  'use strict';

  // ---- Auto-Base & Endpoints ---------------------------------------------
  function getBase() {
    const tag = document.querySelector('meta[name="hohl-chat-base"]');
    return tag ? (tag.content || '').trim().replace(/\/+$/,'') : '';
  }
  const BASE = getBase();
  const URL_SSE = (path) => (BASE ? `${BASE}${path}` : path);
  const ENDPOINT_SSE = URL_SSE('/claude-sse');
  const ENDPOINT_JSON = URL_SSE('/claude');

  function esc(s){ return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

  // ---- Fallback-Streaming (wenn kein runClaudeToPopup existiert) ----------
  async function streamClaudeToBody({ prompt, thread, model, onChunk, onDone, onError }) {
    try {
      // 1) SSE probieren
      const sseUrl = `${ENDPOINT_SSE}?prompt=${encodeURIComponent(prompt)}${thread?`&thread=${encodeURIComponent(thread)}`:''}${model?`&model=${encodeURIComponent(model)}`:''}`;
      const res = await fetch(sseUrl, { method: 'GET' });
      if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buf = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          // Primitive SSE-Parser
          const lines = buf.split(/\r?\n/);
          buf = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              const j = JSON.parse(data);
              if (j.delta) onChunk(j.delta);
              if (j.done) { onDone && onDone(j); return; }
            } catch {
              onChunk(data);
            }
          }
        }
        onDone && onDone({});
        return;
      }
      // 2) JSON-Fallback
      const jRes = await fetch(ENDPOINT_JSON, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, thread, model })
      });
      if (!jRes.ok) throw new Error(`HTTP ${jRes.status}`);
      const j = await jRes.json();
      const text = j.text || j.output || j.answer || '';
      if (text) onChunk(text);
      onDone && onDone(j);
    } catch (e) {
      onError && onError(e);
    }
  }

  // ---- UI: Formular in Answer-Popup einbetten -----------------------------
  window.openInputBubble = function (label, template, options = {}) {
    const thread   = options.thread || (label ? label.toLowerCase().replace(/\s+/g,'-') : '');
    const model    = options.model || undefined;
    const placeholder = options.placeholder || 'Text hier einfügen…';
    const explain  = options.explain || '';

    // Header + Explain via AnswerPopup
    window.openAnswerPopup('', false, label || 'Eingabe', { explain });

    const p   = document.getElementById('answer-popup');
    const body = p.querySelector('.popup-body');
    body.innerHTML = `
      <div style="display:grid;gap:10px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:2px">
          <button class="chip chip-shorter">Kürzer</button>
          <button class="chip chip-example">Beispiel</button>
          <button class="chip chip-check">Checkliste</button>
        </div>
        <textarea id="bf-text" rows="10" style="width:100%;border-radius:12px;border:1px solid rgba(255,255,255,.18);padding:10px;background:rgba(255,255,255,.06);color:#eaf2ff" placeholder="${esc(placeholder)}"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">
          <button id="bf-send" style="border-radius:999px;border:1px solid rgba(255,255,255,.18);padding:10px 16px;cursor:pointer;background:#00b0ff;color:#04202a;font-weight:800">Senden</button>
        </div>
      </div>
    `;

    // Chip-Styles
    body.querySelectorAll('.chip').forEach(ch => Object.assign(ch.style, {
      borderRadius:'999px', padding:'6px 10px', border:'1px solid rgba(255,255,255,.18)',
      background:'rgba(255,255,255,.06)', color:'#eaf2ff', cursor:'pointer'
    }));

    const ta   = body.querySelector('#bf-text');
    const send = body.querySelector('#bf-send');
    if (ta && ta.focus) setTimeout(()=> ta.focus(), 0);

    // Chips (Demo-Funktionen – gern bedarfsgerecht erweitern)
    body.querySelector('.chip-shorter')?.addEventListener('click', ()=>{
      ta.value = (ta.value||'').trim() ? ta.value + '\n\nBitte kürzer, prägnanter, aktiver formulieren.' : 'Bitte folgende Passage kürzer, prägnanter, aktiver formulieren: {{text}}';
    });
    body.querySelector('.chip-example')?.addEventListener('click', ()=>{
      ta.value = (ta.value||'').trim() ? ta.value + '\n\nGib mir 1 gutes Beispiel.' : 'Gib mir 1 gutes Beispiel zu: {{text}}';
    });
    body.querySelector('.chip-check')?.addEventListener('click', ()=>{
      ta.value = (ta.value||'').trim() ? ta.value + '\n\nErstelle mir eine kurze Prüfliste mit 5 Punkten.' : 'Erstelle eine kurze Prüfliste (5 Punkte) zu: {{text}}';
    });

    function finalPromptFromTemplate(userText) {
      const txt = (userText || '').trim();
      const tpl = String(template || '').trim() || '{{text}}';
      return tpl.replace(/\{\{\s*text\s*\}\}/gi, txt);
    }

    function submit() {
      const userText = (ta?.value || '').trim();
      if (!userText) { ta && ta.focus(); return; }

      const prompt = finalPromptFromTemplate(userText);
      // Umschalten auf Streaming-Ansicht (Titel + explain bleiben erhalten)
      window.openAnswerPopup('', false, label || 'Ergebnis', { explain });

      // 1) Wenn ein globaler Runner existiert → verwenden
      if (typeof window.runClaudeToPopup === 'function') {
        window.runClaudeToPopup(label || 'Bubble', prompt, { thread, model });
        return;
      }

      // 2) Fallback: SSE/JSON selbst streamen
      const pBody = document.getElementById('answer-popup').querySelector('.popup-body');
      pBody.textContent = '';
      let buffer = '';
      let sinceChunk = 0;

      streamClaudeToBody({
        prompt, thread, model,
        onChunk: (delta) => {
          buffer += delta;
          sinceChunk += delta.length;
          if (sinceChunk > 60) {
            pBody.textContent = buffer;
            sinceChunk = 0;
          }
        },
        onDone: () => {
          pBody.textContent = buffer;
          window.setAnswerPopupProgress(1);
        },
        onError: (e) => {
          pBody.textContent = `[Fehler] Netzwerk/API: ${e && e.message ? e.message : e}`;
        }
      });

      (async ()=>{ // simple „fortschreitender Balken“
        for (let i=0;i<30;i++){ window.setAnswerPopupProgress(i/30); await sleep(120); }
      })();
    }

    send?.addEventListener('click', submit);
    ta?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
    });
  };
})();
