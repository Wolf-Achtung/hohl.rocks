
(function(){
  const ENDPOINT = window.CHAT_ENDPOINT || null;
  function mount(){
    if (document.querySelector('.chat-dock')) return;
    const form = document.createElement('form'); form.className='chat-dock'; form.setAttribute('aria-label','Chatbot');
    form.innerHTML = '<input type="text" placeholder="Frage stellen… (EU AI Act, KI‑Sicherheit, Projekte)" aria-label="Frage stellen">'+
                     '<button type="submit">Senden</button>';
    document.body.appendChild(form);
    const input=form.querySelector('input');
    async function ask(q){
      if(!q) return;
      if(!ENDPOINT){ alert('Demo: Setze window.CHAT_ENDPOINT auf deine Railway-URL.'); return; }
      try{
        const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})});
        const data=await res.json(); alert(data.answer||data.output||data.message||'OK');
      }catch(e){ alert('Fehler beim Abruf der Antwort.'); }
    }
    form.addEventListener('submit', e=>{ e.preventDefault(); const q=input.value.trim(); ask(q); input.value=''; });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
