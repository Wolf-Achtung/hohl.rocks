// chatbox.js — minimal dock sending to window.CHAT_ENDPOINT (no model param)
(function(){
  const ENDPOINT = window.CHAT_ENDPOINT || "";
  function el(tag, cls, html){ const n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; }
  function mount(){
    if (document.querySelector('.chat-dock')) return;
    const dock = el('form','chat-dock','');
    dock.innerHTML = '<input type="text" placeholder="Frage stellen… (EU AI Act, KI‑Sicherheit, Projekte)" aria-label="Frage stellen"><button type="submit">Senden</button>';
    document.body.appendChild(dock);
    const input=dock.querySelector('input'); const btn=dock.querySelector('button');

    const panel = el('div','chat-panel',''); panel.style.display='none';
    const out = el('div','chat-output',''); panel.appendChild(out);
    const close = el('button','chat-close','×'); close.type='button'; close.onclick=()=>panel.style.display='none';
    panel.appendChild(close); document.body.appendChild(panel);

    async function ask(q){
      if (!q) return;
      if (!ENDPOINT){ out.textContent='Kein Endpoint gesetzt.'; panel.style.display='block'; return; }
      btn.disabled=true; try{
        const res = await fetch(ENDPOINT,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q }) });
        const data = await res.json().catch(()=>({}));
        out.textContent = data.answer || data.output || data.message || 'OK';
        panel.style.display='block';
      }catch(e){
        out.textContent = 'Fehler: Antwort konnte nicht geladen werden.';
        panel.style.display='block';
      } finally { btn.disabled=false; }
    }
    dock.addEventListener('submit', e=>{ e.preventDefault(); const q=input.value.trim(); ask(q); input.value=''; });
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
