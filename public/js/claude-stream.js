/* public/js/claude-stream.js
 * Auto-Base SSE + Fallback-Client für Claude/Anthropic
 * Quellen: window.HOHL_CHAT_BASE -> <meta hohl-chat-base> -> '' -> '/api'
 * Routen:  /claude-sse + /claude (primär), Fallback /chat-sse + /chat
 * Thread-IDs (opts.thread) werden durchgereicht.
 */
(function (w, d) {
  'use strict';

  // --- Basis-Host ermitteln ---
  const metaBase = (d.querySelector('meta[name="hohl-chat-base"]')?.content || '').trim();
  const envBase  = (w.HOHL_CHAT_BASE || '').trim();
  const BASES = Array.from(new Set([envBase, metaBase, '', '/api'])).filter(Boolean);

  // Zwei mögliche Routenfamilien (neu + kompatibel)
  const ROUTE_SETS = [
    { sse: '/claude-sse', post: '/claude', json: '/claude-json' },
    { sse: '/chat-sse',   post: '/chat',   json: '/claude-json' }
  ];

  // Notfall-Popup, falls dein AnswerPopup nicht geladen ist
  function fallbackPopup(title) {
    let wrap = d.getElementById('fallback-answer-popup');
    if (!wrap) {
      wrap = d.createElement('div');
      wrap.id = 'fallback-answer-popup';
      wrap.style.cssText = `
        position:fixed; left:50%; top:64px; transform:translateX(-50%);
        z-index:1500; min-width:min(820px,90vw);
        background:rgba(12,16,22,.72); color:#eaf2ff;
        border:1px solid rgba(255,255,255,.18); border-radius:16px;
        backdrop-filter:blur(10px); padding:14px 16px; box-shadow:0 20px 60px rgba(0,0,0,.35);
      `;
      wrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">
          <div id="fap-title" style="font-weight:800"></div>
          <div style="display:flex;gap:8px">
            <button id="fap-copy" style="border-radius:999px;padding:6px 10px;border:1px solid rgba(255,255,255,.22);cursor:pointer;background:#0ab3ff;color:#04202a;font-weight:800">Kopieren</button>
            <button id="fap-close" style="border-radius:999px;padding:6px 10px;border:1px solid rgba(255,255,255,.22);cursor:pointer;background:#38424a;color:#eaf2ff">Schließen</button>
          </div>
        </div>
        <pre id="fap-body" style="margin:0;white-space:pre-wrap;word-wrap:break-word;font:500 14px/1.5 ui-monospace,Menlo,Consolas,monospace;max-height:48vh;overflow:auto"></pre>
      `;
      d.body.appendChild(wrap);
      wrap.querySelector('#fap-close').onclick = () => wrap.remove();
      wrap.querySelector('#fap-copy').onclick  = () => {
        const txt = wrap.querySelector('#fap-body')?.textContent || '';
        navigator.clipboard.writeText(txt).catch(()=>{});
      };
    }
    wrap.querySelector('#fap-title').textContent = title || 'Antwort';
    wrap.querySelector('#fap-body').textContent  = '';
    const bodyEl = wrap.querySelector('#fap-body');
    return {
      write(t){ bodyEl.textContent += t; },
      set(t){ bodyEl.textContent  = t; },
      done(){},
      error(msg){ bodyEl.textContent = `[Fehler] ${msg}`; }
    };
  }

  // Bevorzugt dein schönes AnswerPopup
  function openPopup(title, subtitle) {
    if (w.AnswerPopup && typeof w.AnswerPopup.open === 'function') {
      return w.AnswerPopup.open({ title, subtitle });
    }
    return fallbackPopup(title);
  }

  // ---- Stream-to-Popup (mit Auto-Base + Auto-Route) ----
  async function runToPopup(title, prompt, opts = {}) {
    const { system, model, thread, subtitle } = opts || {};
    const ui = openPopup(title, subtitle);

    let baseIdx = 0, routeIdx = 0;
    const tryNext = () => {
      routeIdx++;
      if (routeIdx >= ROUTE_SETS.length) { routeIdx = 0; baseIdx++; }
      if (baseIdx >= BASES.length) { ui.error('Netzwerkfehler / API nicht erreichbar.'); return false; }
      start(); return true;
    };

    function start() {
      const base   = BASES[baseIdx] || '';
      const routes = ROUTE_SETS[routeIdx];
      const q = new URLSearchParams({ prompt: prompt || '' });
      if (system) q.set('system', system);
      if (model)  q.set('model',  model);
      if (thread) q.set('thread', thread);

      const url = `${base}${routes.sse}?` + q.toString();

      let es;
      try { es = new EventSource(url); }
      catch { if (!tryNext()) return; else return; }

      es.onmessage = (ev) => {
        try {
          const j = JSON.parse(ev.data);
          if (j.delta) ui.write(j.delta);
          if (j.done)  { es.close(); ui.done(); }
        } catch {
          if (ev.data) ui.write(ev.data);
        }
      };
      es.addEventListener('done', () => { es.close(); ui.done(); });

      es.onerror = () => {
        es && es.close();
        // Fallback: gleiches base per POST
        fetch(`${base}${routes.post}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ prompt, system, model, thread })
        })
        .then(r => { if (r.status === 404) throw new Error('404'); if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
        .then(j => ui.set(j.text || j.answer || '[Leere Antwort]'))
        .catch(err => {
          if (String(err.message).includes('404')) { if (!tryNext()) return; }
          else ui.error(err.message || 'Netzwerkfehler');
        });
      };
    }
    start();
  }

  // JSON-Artefakt (für Generate&Show)
  async function runJSON(title, instruction, opts = {}) {
    const { model, thread } = opts || {};
    const ui = openPopup(title, opts.subtitle);
    const payload = { prompt: instruction, model, thread };

    for (let b = 0; b < BASES.length; b++) {
      const base = BASES[b] || '';
      for (let r = 0; r < ROUTE_SETS.length; r++) {
        const url = `${base}${ROUTE_SETS[r].json}`;
        try {
          const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          if (res.status === 404) throw new Error('404');
          if (!res.ok) throw new Error('HTTP '+res.status);
          const j = await res.json();
          ui.set(JSON.stringify(j, null, 2)); ui.done();
          return j;
        } catch (e) {
          if (!String(e.message).includes('404')) { ui.error(e.message || 'Netzwerkfehler'); return null; }
        }
      }
    }
    ui.error('API nicht erreichbar.');
    return null;
  }

  // Exporte
  w.HohlChat = { runToPopup, runJSON, setBase: (b)=>{ if (b) BASES.unshift(b); } };
  w.runClaudeToPopup = runToPopup; // Alias
})(window, document);
