/* answer-marquee.js — Zeigt Status und Kurzantwort als Lauftext
 * Dieses Modul erstellt am unteren Rand der Seite ein Laufband, das den Status
 * "Antwort kommt gleich ..." anzeigt, sobald eine Anfrage gesendet wird,
 * und anschließend eine Kurzfassung der AI-Antwort als ruhigen, langsam
 * scrollenden Text. Bei Hover wird die Animation angehalten.
 */
(function(){
  // Stil hinzufügen
  const style = document.createElement('style');
  style.textContent = `
  .ansq-wrap{position:fixed; left:24px; right:24px; bottom:112px; height:32px; z-index:39; pointer-events:none;}
  .ansq{position:relative; width:100%; height:100%; overflow:hidden; color:#eaf7ff; font:600 15px/32px ui-sans-serif,system-ui; -webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
  }
  .ansq-track{position:absolute; white-space:nowrap; will-change:transform; animation:ansq-move 30s linear infinite;}
  .ansq-track.paused{animation-play-state:paused;}
  @keyframes ansq-move{ from{transform:translateX(100%);} to{transform:translateX(-120%);} }
  @media (max-width:520px){ .ansq{font-size:13px; line-height:28px;} }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div'); wrap.className='ansq-wrap';
  const inner = document.createElement('div'); inner.className='ansq'; wrap.appendChild(inner);
  const track = document.createElement('div'); track.className='ansq-track'; inner.appendChild(track);
  let acc='';
  let running=false;

  function setText(txt){
    track.textContent = txt || '';
    // reset animation by toggling class
    track.classList.remove('paused');
    void track.offsetWidth;
    track.classList.remove('paused');
  }
  function showMessage(msg){
    setText(msg);
  }
  // Summarize answer to 120 characters or first sentence
  function summarize(t){
    const clean = (t||'').replace(/\s+/g,' ').trim();
    const dot = clean.indexOf('. ');
    let out = clean;
    if(dot>20 && dot<120) out = clean.slice(0, dot+1);
    if(out.length>120) out = out.slice(0,117) + '…';
    return out;
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.appendChild(wrap);
  });

  // Pause on hover
  inner.addEventListener('mouseenter', ()=> track.classList.add('paused'));
  inner.addEventListener('mouseleave', ()=> track.classList.remove('paused'));

  // Listen for chat events
  window.addEventListener('chat:send', ()=>{
    acc=''; running=true;
    showMessage('Antwort kommt gleich …');
  });
  window.addEventListener('chat:delta', (ev)=>{
    if(!running) return;
    const delta = ev.detail && ev.detail.delta || '';
    acc += delta;
    showMessage(summarize(acc));
  });
  window.addEventListener('chat:done', ()=>{
    running=false;
    if(acc){ showMessage(summarize(acc)); }
  });
})();