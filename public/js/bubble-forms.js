// public/js/bubble-forms.js
// Einfaches Formular-Popup für "claude-input": Nutzertext eingeben -> Stream in dasselbe Modal.

(function () {
  const CSS = `
    .bf-modal{position:fixed;left:50%;top:60px;transform:translateX(-50%);z-index:1600;
      width:min(1100px,92vw);background:rgba(22,28,36,.68);border:1px solid rgba(255,255,255,.18);
      backdrop-filter:blur(10px);color:#eaf2ff;border-radius:18px;box-shadow:0 14px 44px rgba(0,0,0,.45)}
    .bf-hd{display:flex;align-items:flex-start;justify-content:space-between;padding:16px 16px 8px 16px}
    .bf-hd h3{margin:0;font-size:20px;line-height:1.2}
    .bf-hd .explain{margin:.25rem 0 0;color:#cfe5ff;opacity:.9;font-size:13px}
    .bf-body{padding:10px 16px 8px 16px}
    .bf-txa{width:100%;min-height:160px;border-radius:10px;border:1px solid rgba(255,255,255,.24);
      background:rgba(10,17,24,.45);color:#eaf2ff;padding:12px;font:500 14px/1.45 ui-sans-serif,system-ui;resize:vertical}
    .bf-actions{display:flex;gap:10px;justify-content:flex-end;padding:6px 16px 12px 16px}
    .bf-actions button{border-radius:999px;border:1px solid rgba(255,255,255,.16);padding:8px 12px;cursor:pointer;background:rgba(240,247,255,.12);color:#eaf2ff}
    .bf-out{padding:0 16px 12px 16px;max-height:min(56vh,520px);overflow:auto}
    .bf-pre{white-space:pre-wrap;font:500 14px/1.45 ui-sans-serif,system-ui}
    .bf-bar{height:6px;border-radius:8px;background:rgba(255,255,255,.18);margin:0 16px 14px 16px;overflow:hidden}
    .bf-bar>i{display:block;width:0;height:100%;background:#00B0FF;transition:width .12s ease}
  `;
  if (!document.getElementById('bf-css')) {
    const st = document.createElement('style'); st.id = 'bf-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  function resolveBase() {
    const meta = document.querySelector('meta[name="hohl-chat-base"]')?.content?.trim() || '';
    return meta.replace(/\/$/, '');
  }

  async function streamClaude({ prompt, threadId }, onToken, onDone, onError) {
    const base = resolveBase();
    const endpoints = [`${base}/api/claude-sse`, `${base}/claude-sse`, `/api/claude-sse`, `/claude-sse`];
    const qs = new URLSearchParams({ prompt, thread: threadId || '' }).toString();

    let res = null;
    for (const u of endpoints) {
      try {
        const r = await fetch(`${u}?${qs}`, { method: 'GET' });
        if (r.ok && r.headers.get('content-type')?.includes('text/event-stream')) { res = r; break; }
      } catch (_) {}
    }
    if (!res) return onError?.(new Error('SSE-Endpunkt nicht erreichbar'));

    const reader = res.body.getReader(), decoder = new TextDecoder();
    let buf = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n'); buf = parts.pop() || '';
        for (const chunk of parts) {
          const line = chunk.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          const data = line.slice(5).trim();
          let token = '';
          try {
            const j = JSON.parse(data);
            token = j?.delta?.text ?? j?.delta?.content ?? j?.text ?? j?.content ?? '';
          } catch { token = data; }
          if (token) onToken?.(token);
        }
      }
      onDone?.();
    } catch (e) { onError?.(e); }
  }

  function buildModal() {
    const m = document.createElement('div'); m.className = 'bf-modal';
    m.innerHTML = `
      <div class="bf-hd">
        <div>
          <h3 id="bf-title">Eingabe</h3>
          <p class="explain" id="bf-explain" style="display:none"></p>
        </div>
        <div class="bf-actions">
          <button id="bf-copy">Kopieren</button>
          <button id="bf-close">Schließen</button>
        </div>
      </div>
      <div class="bf-body">
        <textarea id="bf-text" class="bf-txa" placeholder="Text hier einfügen …"></textarea>
      </div>
      <div class="bf-actions">
        <button id="bf-send">Senden</button>
      </div>
      <div class="bf-out"><div class="bf-pre" id="bf-out"></div></div>
      <div class="bf-bar"><i id="bf-bar"></i></div>
    `;
    document.body.appendChild(m);
    m.querySelector('#bf-close').onclick = () => m.remove();
    m.querySelector('#bf-copy').onclick = () => {
      navigator.clipboard.writeText(m.querySelector('#bf-out').textContent || '');
    };
    return m;
  }

  function setHdr(m, t, e) {
    m.querySelector('#bf-title').textContent = t || 'Eingabe';
    const ex = m.querySelector('#bf-explain');
    if (e) { ex.textContent = e; ex.style.display = ''; } else ex.style.display = 'none';
  }
  function progress(m, pct) { m.querySelector('#bf-bar').style.width = `${pct}%`; }

  // Öffentliche API
  window.openInputBubble = function openInputBubble(title, systemPrompt, opts = {}) {
    const placeholder = opts.placeholder || 'Stichpunkte oder Rohfassung …';
    const explain     = opts.explain || '';
    const threadId    = opts.threadId || undefined;

    const m = buildModal();
    setHdr(m, title || 'Eingabe', explain);
    const tx = m.querySelector('#bf-text'); tx.placeholder = placeholder;
    const out = m.querySelector('#bf-out');

    m.querySelector('#bf-send').onclick = async () => {
      const user = tx.value.trim();
      if (!user) { tx.focus(); return; }
      out.textContent = ''; progress(m, 8);

      const prompt = `${systemPrompt || ''}\n\n### Nutzerinhalt\n${user}`;

      await streamClaude({ prompt, threadId },
        tok => { out.textContent += tok; },
        ()  => { progress(m, 100); },
        err => { out.textContent = `[Fehler] ${err?.message || err}`; progress(m, 100); }
      );
    };
  };
})();
