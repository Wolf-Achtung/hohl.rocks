<!-- public/js/popup-bubbles.js -->
<script>
(() => {
  const css = `
  .modal {
    position:fixed; inset:8% 6%;
    background:linear-gradient(180deg, rgba(12,16,22,.72), rgba(12,16,22,.78));
    backdrop-filter:saturate(120%) blur(12px);
    border-radius:18px; border:1px solid rgba(255,255,255,.12);
    color:#eaf2ff; box-shadow:0 20px 80px rgba(0,0,0,.35); z-index:9999;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .modal header {
    display:flex; align-items:baseline; gap:18px;
    padding:18px 22px 8px 22px;
  }
  .modal h3 { margin:0; font-size:22px; font-weight:800; letter-spacing:.2px; }
  .modal .explain { margin:8px 0 0 0; font-size:14px; opacity:.85 }
  .modal .head-actions { margin-left:auto; display:flex; gap:10px; }
  .chip { padding:8px 12px; border-radius:999px; border:1px solid rgba(255,255,255,.16); cursor:pointer; user-select:none }
  .chip:hover { background:rgba(255,255,255,.08) }
  .modal textarea {
    width:100%; min-height:180px; resize:vertical; color:#eaf2ff; background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.14); border-radius:10px; outline:none; padding:14px; font-size:15px;
  }
  .toolbar { display:flex; gap:10px; align-items:center; padding:10px 22px }
  .btn { padding:10px 14px; border-radius:12px; font-weight:700; background:#2a8cff; color:white; border:none; cursor:pointer }
  .btn:disabled { opacity:.6; cursor:not-allowed }
  .answer { flex:1; margin:6px 22px 16px 22px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:10px; overflow:auto; padding:14px; white-space:pre-wrap }
  .progress { height:6px; margin:10px 22px; background:rgba(255,255,255,.15); border-radius:99px; overflow:hidden }
  .progress div { height:100%; width:0%; background:linear-gradient(90deg, #66e, #4cf, #6f9); transition:width .2s }
  .closebar { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:8px 22px 16px 22px }
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  function el(tag, attrs={}, ...kids){
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k==='class') n.className = v; else if (k==='style') Object.assign(n.style, v);
      else n.setAttribute(k, v);
    });
    kids.forEach(k=> n.appendChild(typeof k==='string'? document.createTextNode(k): k));
    return n;
  }
  function copy(text){
    try{ navigator.clipboard.writeText(text); }catch(e){}
  }

  // Gemeinsame UI
  function makeHeader(modal, title, explain){
    const header = el('header');
    const h3 = el('h3', {}, title || 'Ergebnis');
    header.appendChild(h3);
    if (explain) {
      const p = el('p', { class:'explain' }, explain);
      header.appendChild(p);
    }
    const actions = el('div', { class:'head-actions' },
      el('div', { class:'chip', onclick:()=>copy(modal.__getText?.()||'') }, 'Kopieren'),
      el('div', { class:'chip', onclick:()=>modal.remove() }, 'Schließen')
    );
    header.appendChild(actions);
    return header;
  }

  function makeProgress(){
    const bar = el('div', { class:'progress' }, el('div'));
    bar.set = (p)=> bar.firstChild.style.width = Math.max(0, Math.min(100, p)) + '%';
    return bar;
  }

  // ── Öffentlich: Input‑Popup ────────────────────────────────────────────────
  window.openInputBubble = function(title, prompt, options={}){
    const modal = el('div', { class:'modal' });
    modal.appendChild( makeHeader(modal, title, options.explain) );

    // Preset‑Chips
    const chips = el('div', { class:'toolbar' },
      el('div', { class:'chip', onclick:()=> insert('Bitte antworte deutlich kürzer.') }, 'Kürzer'),
      el('div', { class:'chip', onclick:()=> insert('Beispiel bitte – realistisch, deutsch, 4–6 Sätze.') }, 'Beispiel'),
      el('div', { class:'chip', onclick:()=> insert('Gib mir eine Checkliste mit den wichtigsten Schritten.') }, 'Checkliste')
    );
    modal.appendChild(chips);

    // Input
    const ta = el('textarea', { placeholder: options.placeholder || 'Stichpunkte oder Rohfassung …' });
    modal.appendChild(ta);

    // Antwortbereich + Progress
    const ans = el('div', { class:'answer' });
    modal.appendChild(ans);
    const prog = makeProgress();
    modal.appendChild(prog);

    // Toolbar unten
    const sendBtn = el('button', { class:'btn' }, 'Senden');
    const bottom = el('div', { class:'closebar' }, sendBtn);
    modal.appendChild(bottom);

    modal.__getText = ()=> ans.textContent;

    function insert(t){
      ta.value = (ta.value ? ta.value + '\n' : '') + t;
      ta.focus();
    }

    async function send(){
      sendBtn.disabled = true; ans.textContent = ''; prog.set(6);
      const thread = (window.Claude && Claude.thread) ? Claude.thread('bubble:'+title) : undefined;
      // Einfache Template‑Regel: {text} wird ersetzt; sonst wird angehängt.
      const user = ta.value.trim();
      const finalPrompt = (prompt && /\{text\}/.test(prompt))
        ? prompt.replace('{text}', user || '—')
        : (prompt ? (prompt + (user ? `\n\n—\n${user}` : '')) : user);
      const ctrl = new AbortController();
      const onToken = (tok)=> { ans.textContent += tok; prog.set( Math.min(98, ans.textContent.length % 97) ); };
      try{
        const res = await Claude.stream({ prompt: finalPrompt, thread }, onToken, { signal: ctrl.signal });
        prog.set(res.ok ? 100 : 0);
        if (!res.ok) ans.textContent = (ans.textContent||'') + `\n\n[Fehler] ${res.error||'API nicht erreichbar.'}`;
      } finally {
        sendBtn.disabled = false;
      }
    }
    sendBtn.addEventListener('click', send);
    ta.addEventListener('keydown', (e)=>{ if(e.metaKey && e.key==='Enter') send(); });

    document.body.appendChild(modal);
    ta.focus();
  };

  // ── Öffentlich: Direkt‑Antwort‑Popup ───────────────────────────────────────
  window.openAnswerPopup = function(prompt, autoSend=true, title='Ergebnis', options={}){
    const modal = el('div', { class:'modal' });
    modal.appendChild( makeHeader(modal, title, options.explain) );
    const ans = el('div', { class:'answer' }, '…');
    modal.appendChild(ans);
    const prog = makeProgress(); modal.appendChild(prog);
    modal.__getText = ()=> ans.textContent;
    document.body.appendChild(modal);

    if (!autoSend) return;

    (async ()=>{
      const thread = (window.Claude && Claude.thread) ? Claude.thread('bubble:'+title) : undefined;
      const onToken = (tok)=> { ans.textContent += (tok || ''); prog.set( Math.min(98, ans.textContent.length % 97) ); };
      const res = await Claude.stream({ prompt, thread }, onToken);
      prog.set(res.ok ? 100 : 0);
      if (!res.ok) ans.textContent = (ans.textContent||'') + `\n\n[Fehler] ${res.error||'API nicht erreichbar.'}`;
    })();
  };
})();
</script>
