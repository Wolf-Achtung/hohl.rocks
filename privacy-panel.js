/*! privacy-panel.js — kompaktes Datenschutz-Overlay */
(function(){
  const css = `
  .privacy-btn{ position: fixed; left: 16px; bottom: 16px; z-index: 45; border-radius: 999px; padding:6px 10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.12); color:#f1f6ff; font:600 12px/1 ui-sans-serif; }
  .privacy-btn:hover{ background: rgba(255,255,255,.18); }
  .privacy-panel{ position: fixed; left: 16px; bottom: 64px; width: min(560px, 90vw); z-index: 45; background: rgba(20,28,36,.8); color:#eaf2ff; border: 1px solid rgba(255,255,255,.2); border-radius:16px; padding:14px; backdrop-filter: blur(10px); display:none; }
  .privacy-panel.show{ display:block; }
  .privacy-panel h4{ margin:0 0 6px; font:700 14px/1.2 ui-sans-serif; }
  .privacy-panel ul{ margin: 6px 0 0 18px; padding:0; font:600 13px/1.35 ui-sans-serif; }
  .privacy-panel small{ opacity:.85; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const btn = document.createElement('button'); btn.className='privacy-btn'; btn.textContent='Datenschutz';
  const panel = document.createElement('div'); panel.className='privacy-panel';
  panel.innerHTML = `<h4>Datenschutz (Kurzfassung)</h4>
  <ul>
    <li>Keine Cookies, kein Tracking.</li>
    <li>Bilder bleiben lokal, bis du <b>Senden</b> klickst. Dann werden sie an den KI‑Dienst übertragen.</li>
    <li>Keine Diagnosen, keine Gesichtserkennung, keine Identifizierung realer Personen.</li>
    <li>Chats werden serverseitig nur zur Beantwortung verarbeitet. Keine Werbung, kein Profiling.</li>
    <li>Du kannst die Einwilligung zum Bild‑Upload jederzeit verweigern (Häkchen im Foto‑Overlay).</li>
  </ul>
  <small>Volltext auf Anfrage — ich halte es bewusst kurz & verständlich.</small>`;

  btn.addEventListener('click', ()=> panel.classList.toggle('show'));

  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.appendChild(btn);
    document.body.appendChild(panel);
  });
})();