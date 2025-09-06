/*! ticker.js — vLoop6 (slow, seamless, clickable, answer-aware, no-overlap) */
(function () {
  'use strict';

  // ---------- Styles ----------
  const css = `
    .ticker-wrap{position:fixed;left:24px;right:24px;z-index:250;pointer-events:auto}
    .ticker{position:relative;overflow:hidden;height:48px;padding-right:var(--safeR,320px);pointer-events:none;
      -webkit-mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%);
              mask-image:linear-gradient(90deg,transparent 0,black 8%,black 92%,transparent 100%)}
    .ticker-track{position:absolute;display:inline-flex;gap:14px;white-space:nowrap;will-change:transform;
      animation:ticker-move var(--dur,140s) linear infinite;animation-delay:var(--delay,-8s);transform:translateZ(0)}
    .ticker-track.paused{animation-play-state:paused}
    .ticker a{display:inline-block;padding:10px 16px;border-radius:999px;text-decoration:none;pointer-events:auto;
      color:#eaf2ff;background:rgba(20,28,36,.64);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px)}
    .ticker a:hover{filter:brightness(1.08)}
    /* Integrated ask bar for free-form questions */
    .ticker-ask{position:absolute;top:0;right:0;height:100%;display:flex;align-items:center;gap:8px;pointer-events:auto;padding-left:8px;background:transparent}
    .ticker-ask input{width:min(48vw,360px);max-width:68vw;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);
      color:#eaf2ff;border-radius:999px;padding:10px 14px;outline:none;flex:1 1 auto;}
    .ticker-ask button{background:#1b66ff;border:0;color:#fff;border-radius:999px;padding:9px 14px;cursor:pointer;flex:0 0 auto;}
    .ticker-ask button:hover{background:#2857e7}
    @keyframes ticker-move{from{transform:translateX(100%)}to{transform:translateX(-110%)}}
    @media (max-width:880px){.ticker-wrap{left:12px;right:12px}.ticker{height:42px}.ticker a{padding:8px 12px}}
  
    @media (max-width: 390px){
      .ticker-wrap{left:12px;right:12px}
      .ticker{height:38px}
      .ticker-track{gap:10px}
      .ticker a{padding:8px 12px;font-size:13px}
      .ticker-ask input{padding:8px 12px;font-size:14px}
      .ticker-ask button{padding:8px 12px;font-size:14px}
    }
`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM ----------
  let wrap, inner, track, askWrap, askInput, askButton, baseItems = [];

  function mount() {
    wrap = document.querySelector('.ticker-wrap');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.className = 'ticker-wrap';
      inner = document.createElement('div'); inner.className = 'ticker';
      track = document.createElement('div'); track.className = 'ticker-track';
      inner.appendChild(track); wrap.appendChild(inner); document.body.appendChild(wrap);
    } else {
      inner = wrap.querySelector('.ticker') || inner;
      track = wrap.querySelector('.ticker-track') || track;
      if (!track) { inner = document.createElement('div'); inner.className='ticker'; track=document.createElement('div'); track.className='ticker-track'; inner.appendChild(track); wrap.appendChild(inner); }
    }
  }

  // ---------- Inhalte ----------
  function getItems(){
    // Hole die globale Item-Liste; wenn keine vorhanden ist, greife auf eine minimale Fallback-Liste zurück
    let items;
    if (Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length) {
      items = window.__TICKER_ITEMS.slice();
    } else {
      items = [
        { label:"KI-Update", prompt:"Fasse die aktuelle KI-News-Lage kurz zusammen.", category:"news" },
        { label:"Prompt-Tipp", prompt:"Gib einen kurzen Prompt-Tipp für ChatGPT.", category:"tips" }
      ];
    }
    // Optional: Filter nach Kategorie, wenn gesetzt (über Filter-Chips)
    const cat = typeof window.currentTickerCategory === 'string' && window.currentTickerCategory.trim() !== ''
      ? window.currentTickerCategory.trim() : null;
    if (cat) {
      items = items.filter(it => it.category === cat);
      // Wenn keine Items zur Kategorie gefunden werden, alle anzeigen
      if (items.length === 0) items = window.__TICKER_ITEMS.slice();
    }
    return items;
  }

  function addChip(dst, label, prompt, preview){
    const a = document.createElement('a');
    a.href = '#'; a.textContent = label; if (preview) a.title = preview;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      pauseTicker();
      ensureOneAnswerOnly(); // alte Spotlight(s) räumen
      try { window.AnalyticsLite?.emit?.('ticker_click', { label }); } catch {}
      // Handle action-chips like "!action:..." (can include "; gpt:...")
      try{
        if (prompt && prompt.indexOf('!action:')>-1 && window.WolfFX && WolfFX.run){ WolfFX.run(prompt); return; }
      }catch(_){ }
      // Verwende das vereinfachte Fetch-Modul für Antworten (JSON-only)
      try { if (window.fetchAnswer) { window.fetchAnswer(prompt); return; } } catch{}
      // Fallback: benutze weiterhin ChatDock, falls vorhanden
      try { if (window.ChatDock?.send) { ChatDock.send(prompt); return; } } catch {}
      const input = document.querySelector('#chat-input'); const btn = document.querySelector('#chat-send');
      if (input) {
        input.value = prompt;
        input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true}));
      } else { btn?.click(); }
    });
    dst.appendChild(a);
  }

  function build(){
    track.innerHTML = '';
    baseItems = getItems().slice();
    baseItems.forEach(it => addChip(track, it.label, it.prompt, it.preview));
    topUp();
    setDuration();
  }

  // ---------- Hilfen ----------
  // Liefert das BoundingRect der Chat‑Dock, falls sichtbar. Ist die Dock
  // komplett ausgeblendet (display:none, visibility:hidden oder 0×0),
  // soll sie die Ticker‑Position nicht beeinflussen und es wird null
  // zurückgegeben. Dadurch kann der Ticker nicht versehentlich außerhalb
  // des Viewports positioniert werden, wenn die Chat‑Dock nur als
  // Placeholder existiert.
  function chatDockRect(){
    const c = document.querySelector('.chat-dock');
    if(!c) return null;
    const style = getComputedStyle(c);
    if(style.display === 'none' || style.visibility === 'hidden') return null;
    const r = c.getBoundingClientRect();
    // Wenn die Dock kein sichtbares Maß hat, ignorieren
    if(r.width === 0 && r.height === 0) return null;
    return r;
  }
  function answerEl(){
    // häufige Klassen/IDs deines Overlays – erweitere bei Bedarf
    return document.querySelector('.spotlight-card, .answer-overlay, .chat-answer, .chat-output, .answer-marquee');
  }
  function answerRect(){ const el = answerEl(); return el ? el.getBoundingClientRect() : null; }

  // nur die NEUSTE Antwort sichtbar halten (ältere entfernen/ausblenden)
  function ensureOneAnswerOnly(){
    const all = Array.from(document.querySelectorAll('.spotlight-card, .answer-overlay, .answer-marquee'));
    if (all.length > 1) {
      all.slice(0, -1).forEach(n => { n.remove(); }); // oder: n.style.display='none';
    }
  }

  // Bottom-Position: zwischen Antwort und Chat-Input, ohne Überschneidung
  function updateBottom(){
    const chat = chatDockRect();
    const ans  = answerRect();
    const tickerH = (inner?.getBoundingClientRect().height) || 48;

    // Standard: oberhalb der Chat-Box
    let bottom = 76;
    if (chat) bottom = Math.max(bottom, (window.innerHeight - chat.top) + 12);

    // Wenn eine Antwort-Card da ist: Ticker UNTER die Card (also näher zum unteren Rand),
    // so dass die Oberkante des Tickers MINDESTENS 12px unter der Card liegt.
    if (ans){
      const maxBottom = Math.max(12, window.innerHeight - ans.bottom - 12 - tickerH);
      bottom = Math.min(bottom, maxBottom);
    }

    // Begrenze bottom auf einen sinnvollen Bereich (12..240 px),
    // damit der Ticker nicht außerhalb des Viewports rutscht. Wenn eine
    // Antwort‑Card existiert, ist maxBottom bereits berücksichtigt.
    bottom = Math.max(12, bottom);
    bottom = Math.min(bottom, 240);
    wrap.style.bottom = bottom + 'px';
  }

  // Rechts Freiraum für die Chat-Box (Safe-Zone)
  function updateSafeZone(){
    const chat = chatDockRect();
    let safe = 340;
    if (chat) safe = Math.ceil(chat.width + 24);
    wrap.style.setProperty('--safeR', safe + 'px');
  }

  // Layering: immer UNTER der Antwort-Card, aber ÜBER Video/Shapes
  function updateZ(){
    const ans = answerEl();
    let z = 250;
    if (ans){
      const zi = parseInt(getComputedStyle(ans).zIndex || '1000', 10);
      z = Math.min(zi - 5, 600); // sicher unter der Antwort
    }
    wrap.style.zIndex = String(z);
  }

  // ---------- Laufgeschwindigkeit ----------
  const SPEED_PX_S = 16; // sehr ruhig (ggf. 14 probieren)
  function setDuration(){
    const vw = Math.max(320, window.innerWidth);
    const px = track.scrollWidth + vw;
    const dur = Math.max(60, Math.min(260, px / SPEED_PX_S));
    track.style.setProperty('--dur', dur.toFixed(1) + 's');
  }

  function topUp(){
    const vw = Math.max(320, window.innerWidth);
    let guard = 20;
    while (track.scrollWidth < 3 * vw && guard-- > 0){
      for (const it of baseItems) addChip(track, it.label, it.prompt, it.preview);
    }
  }

  // ---------- Pause/Resume ----------
  function pauseTicker(){ track?.classList.add('paused'); }
  function resumeTicker(){ track?.classList.remove('paused'); }

  // ---------- Init ----------
  function init(){
    mount(); if(!track) return;
    build(); updateBottom(); updateSafeZone(); updateZ();
    // Pre-Ticker-Message erst nach kurzer Verzögerung ausblenden.
    // Dadurch bleibt die Botschaft einige Sekunden sichtbar, bis der Ticker bereit ist.
    setTimeout(() => {
      const preMsg = document.getElementById('pre-ticker-message');
      // Nur verstecken, wenn der Track bereits Elemente hat.
      if(preMsg && track && track.querySelector('a')){
        preMsg.style.display = 'none';
      }
    }, 3000);
    // Sofort loslaufen: ein negativer Delay sorgt dafür, dass der Track schon „am Laufen“ ist
    // und resumeTicker startet die Animation direkt
    setDuration();
    resumeTicker();
    // Wenn der Track noch leer ist, sofort neu aufbauen
    setTimeout(()=>{
      if(!track || !track.querySelector('a')){
        build(); setDuration(); resumeTicker();
      }
      // Sicherstellen, dass die Pre-Ticker-Message weg ist: nach kurzer Verzögerung prüfen
      setTimeout(() => {
        const pm = document.getElementById('pre-ticker-message');
        if(pm && track && track.querySelector('a')){
          pm.style.display = 'none';
        }
      }, 3000);
    }, 500);

    // Reagieren auf Layout/Antwort
    window.addEventListener('resize', ()=>{ updateBottom(); updateSafeZone(); topUp(); setDuration(); updateZ(); }, {passive:true});
    window.addEventListener('chat:send', ()=>{ ensureOneAnswerOnly(); pauseTicker(); updateBottom(); updateZ(); });
    window.addEventListener('chat:done', ()=>{ ensureOneAnswerOnly(); resumeTicker(); updateBottom(); updateZ(); });

    // Wenn Spotlight/Antwort dynamisch wechselt
    const mo = new MutationObserver(()=>{ ensureOneAnswerOnly(); updateBottom(); updateZ(); });
    mo.observe(document.body, { childList:true, subtree:true });

    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) resumeTicker(); });
    setInterval(()=>resumeTicker(), 30000);
  }

  (document.readyState==='loading')
    ? document.addEventListener('DOMContentLoaded', init, {once:true})
    : init();

  // Expose
  window.Ticker = { pause: pauseTicker, resume: resumeTicker, rebuild: ()=>{ build(); setDuration(); updateBottom(); updateZ(); } };
})();
