// public/js/answer-popup.js
// Ein einfaches, leichtgewichtiges Modal mit Live-Streaming (Claude SSE) und Kurz-Varianten.

(function () {
  const CSS = `
    .ap-modal{position:fixed;left:50%;top:80px;transform:translateX(-50%);z-index:1600;
      width:min(1100px,92vw);background:rgba(22,28,36,.68);border:1px solid rgba(255,255,255,.18);
      backdrop-filter:blur(10px);color:#eaf2ff;border-radius:18px;box-shadow:0 14px 44px rgba(0,0,0,.45)}
    .ap-hd{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 18px 10px 18px}
    .ap-hd h3{margin:0;font-size:20px;line-height:1.2}
    .ap-hd .explain{margin:.25rem 0 0;color:#cfe5ff;opacity:.9;font-size:13px}
    .ap-actions{display:flex;gap:8px;padding:0 18px 12px 18px}
    .ap-actions button,
    .ap-ctl button{border-radius:999px;border:1px solid rgba(255,255,255,.16);padding:8px 12px;cursor:pointer;background:rgba(240,247,255,.12);color:#eaf2ff}
    .ap-ctl{display:flex;gap:10px;align-items:center;padding:10px 14px;justify-content:flex-end}
    .ap-body{padding:0 18px 12px 18px;max-height:min(62vh,640px);overflow:auto}
    .ap-pre{white-space:pre-wrap;font:500 14px/1.45 ui-sans-serif,system-ui}
    .ap-bar{height:6px;border-radius:8px;background:rgba(255,255,255,.18);margin:0 18px 16px 18px;overflow:hidden}
    .ap-bar>i{display:block;width:0;height:100%;background:#00B0FF;transition:width .12s ease}
  `;
  if (!document.getElementById('ap-css')) {
    const st = document.createElement('style'); st.id = 'ap-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  function resolveBase() {
    const meta = document.querySelector('meta[name="hohl-chat-base"]')?.content?.trim() || '';
    return meta.replace(/\/$/, ''); // ohne trailing slash
  }

  // robuste Auto-Base-Auflösung (fällt zurück auf /api/* und /*)
  async function streamClaude({ prompt, threadId }, onToken, onDone, onError) {
    const base = resolveBase();
    const endpoints = [`${base}/api/claude-sse`, `${base}/claude-sse`, `/api/claude-sse`, `/claude-sse`];
    const qs = new URLSearchParams({ prompt, thread: threadId || '' }).toString();

    let res = null, urlTried = '';
    for (const u of endpoints) {
      try {
        urlTried = `${u}?${qs}`;
        res = await fetch(urlTried, { method: 'GET' });
        if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) break;
      } catch (_) {}
      res = null;
    }
    if (!res) return onError?.(new Error('SSE-Endpunkt nicht erreichbar'));

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Zeilenweise SSE parsen (data: …)
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const chunk of parts) {
          const line = chunk.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          const data = line.slice(5).trim();

          let token = '';
          try {
            const j = JSON.parse(data);
            // tolerant extrahieren (delta.text | delta.content | text | content)
            token = j?.delta?.text ?? j?.delta?.content ?? j?.text ?? j?.content ?? '';
          } catch {
            token = data;
          }
          if (token) onToken?.(token);
        }
      }
      onDone?.();
    } catch (e) {
      onError?.(e);
    }
  }

  async function askClaudeOnce({ prompt, threadId }) {
    const base = resolveBase();
    const endpoints = [`${base}/api/claude`, `${base}/claude`, `/api/claude`];
    const body = JSON.stringify({ prompt, thread: threadId || '' });

    for (const u of endpoints) {
      try {
        const r = await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
        if (r.ok) return (await r.json())?.text || (await r.text());
      } catch (_) {}
    }
    throw new Error('Claude JSON-Endpunkt nicht erreichbar');
  }

  function buildModal() {
    const modal = document.createElement('div'); modal.className = 'ap-modal';
    modal.innerHTML = `
      <div class="ap-hd">
        <div>
          <h3 id="ap-title">Antwort</h3>
          <p class="explain" id="ap-explain" style="display:none"></p>
        </div>
        <div class="ap-ctl">
          <button id="ap-copy">Kopieren</button>
          <button id="ap-close">Schließen</button>
        </div>
      </div>
      <div class="ap-actions">
        <button data-variant="shorten">Kürzer</button>
        <button data-variant="example">Beispiel</button>
        <button data-variant="checklist">Checkliste</button>
      </div>
      <div class="ap-body"><div class="ap-pre" id="ap-out"></div></div>
      <div class="ap-bar"><i id="ap-bar"></i></div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#ap-close').onclick = () => modal.remove();
    modal.querySelector('#ap-copy').onclick = () => {
      const txt = modal.querySelector('#ap-out').textContent || '';
      navigator.clipboard.writeText(txt);
    };
    return modal;
  }

  function applyExplain(modal, title, explain) {
    modal.querySelector('#ap-title').textContent = title || 'Antwort';
    const ex = modal.querySelector('#ap-explain');
    if (explain) { ex.textContent = explain; ex.style.display = ''; }
    else ex.style.display = 'none';
  }

  function applyProgress(modal, pct) {
    modal.querySelector('#ap-bar').style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  // Öffentliche API
  window.openAnswerPopup = function openAnswerPopup(prompt, maybeOpts, maybeTitle) {
    // Abwärtskompatible Signatur: (prompt, false, "Titel")
    let opts = {};
    if (typeof maybeOpts === 'object') opts = { ...maybeOpts };
    else opts = { title: maybeTitle || 'Antwort', stream: maybeOpts !== false };

    const title = opts.title || 'Antwort';
    const explain = opts.explain || '';
    const threadId = opts.threadId || undefined;

    const modal = buildModal();
    applyExplain(modal, title, explain);
    const out = modal.querySelector('#ap-out');

    // Quick-Varianten
    const basePrompt = String(prompt || '');
    modal.querySelectorAll('.ap-actions button').forEach(btn => {
      btn.onclick = async () => {
        const intent = btn.dataset.variant;
        let mod = '';
        if (intent === 'shorten')   mod = '\n\nBitte fasse das Ergebnis kompakt in 5–7 Sätzen zusammen.';
        if (intent === 'example')   mod = '\n\nGib 1–2 prägnante Praxisbeispiele mit konkreten Zahlen/Parametern.';
        if (intent === 'checklist') mod = '\n\nErzeuge eine kurze, nummerierte Checkliste zum direkten Umsetzen.';
        out.textContent = ''; applyProgress(modal, 6);
        const text = await askClaudeOnce({ prompt: basePrompt + mod, threadId });
        out.textContent = text || '';
        applyProgress(modal, 100);
      };
    });

    // Streaming
    out.textContent = '';
    applyProgress(modal, 12);
    streamClaude({ prompt: basePrompt, threadId },
      (tok) => { out.textContent += tok; },
      ()     => { applyProgress(modal, 100); },
      (err)  => { out.textContent = `[Fehler] ${err?.message || err}`; applyProgress(modal, 100); }
    );
  };
})();
