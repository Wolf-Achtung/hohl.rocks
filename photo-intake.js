
/*! photo-intake.js — Foto-Upload-Flow mit Vorschau & Schnellaktionen */
(function(){
  const css = `
  .attach-btn{ margin-right:8px; border-radius:12px; border:1px solid rgba(255,255,255,.2); background:rgba(255,255,255,.1); color:#eaf2ff; padding:6px 10px; font-weight:600; }
  .attach-btn:hover{ background:rgba(255,255,255,.18); }
  .photo-overlay{ position:fixed; right:24px; bottom: calc(14vh + 64px); width: min(360px, 80vw); z-index: 42;
    background: rgba(20,28,36,.72); border:1px solid rgba(255,255,255,.16); border-radius:16px; backdrop-filter: blur(10px); color:#f1f6ff; padding:12px; }
  .photo-overlay h4{ margin:0 0 8px 0; font:700 14px/1.2 ui-sans-serif,system-ui; opacity:.95; }
  .photo-overlay .preview{ width:100%; border-radius:12px; overflow:hidden; margin-bottom:10px; background:#000; display:flex; justify-content:center; align-items:center; }
  .photo-overlay .preview img{ max-width:100%; height:auto; display:block; }
  .photo-actions{ display:flex; flex-wrap:wrap; gap:6px; }
  .photo-actions button{ border-radius:999px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18); color:#f1f6ff; padding:6px 10px; font:600 12px/1 ui-sans-serif; }
  .photo-actions button:hover{ background:rgba(255,255,255,.18); }
  .photo-overlay .row{ display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }
  .photo-overlay .row .ghost{ opacity:.8; }
  @media (max-width:880px){ .photo-overlay{ right:16px; width: 86vw; } }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function bySel(s){ return document.querySelector(s); }
  function ensureUI(){
    const input = bySel('#chat-input'); const sendBtn = bySel('#chat-send');
    if(!sendBtn || !input) return;
    if(bySel('#chat-attach')) return; // already added
    const attach = document.createElement('button'); attach.id='chat-attach'; attach.className='attach-btn'; attach.type='button'; attach.textContent='Foto';
    const file = document.createElement('input'); file.type='file'; file.accept='image/*'; file.style.display='none';
    sendBtn.parentElement.insertBefore(attach, sendBtn);
    document.body.appendChild(file);

    attach.addEventListener('click', ()=> file.click());
    file.addEventListener('change', ()=>{
      const f = file.files && file.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = ()=> showOverlay(reader.result);
      reader.readAsDataURL(f);
      file.value='';
    });
  }

  function showOverlay(dataUrl){
    const old = document.querySelector('.photo-overlay'); if(old) old.remove();
    const wrap = document.createElement('div'); wrap.className='photo-overlay';
    const h4 = document.createElement('h4'); h4.textContent='Foto gewählt – was möchtest du damit machen?';
    const preview = document.createElement('div'); preview.className='preview';
    const img = document.createElement('img'); img.src=dataUrl; preview.appendChild(img);
    const actions = document.createElement('div'); actions.className='photo-actions';

    const ideas = [
      {label:'Ich in 20 Jahren', prompt:'Ich habe gerade ein Foto hochgeladen. Beschreibe seriös, wie ich in 20 Jahren aussehen könnte und welche Faktoren das beeinflussen. Liste auch, wie ein visuelles Aging mit einem Bild‑Modell optional umgesetzt würde (transparent, ohne Diagnose).'},
      {label:'Professioneller Avatar', prompt:'Entwirf 3 Vorschläge für einen professionellen LinkedIn‑Avatar‑Look auf Basis meines hochgeladenen Fotos (Hintergrund, Licht, Farbe, Pose, Kleidungsstil).'},
      {label:'Stilberatung', prompt:'Gib mir Stil‑Hinweise (Haare, Brille, Bart, Farben), die zu meinem Gesicht auf dem hochgeladenen Foto passen könnten. Begründe kurz.'},
      {label:'Seriöse Einschätzung', prompt:'Fasse in 5 Punkten zusammen, was mein hochgeladenes Foto über meine Außenwirkung im Business-Kontext vermittelt (Ton, Seriosität, Energie, Approachability, Kontrast).'},
    ];

    ideas.forEach(it=>{
      const b = document.createElement('button'); b.textContent = it.label;
      b.addEventListener('click', ()=>{ try{ window.ChatDock && ChatDock.sendAttachment && ChatDock.sendAttachment({ dataUrl, prompt: it.prompt }); }catch{}; wrap.remove(); });
      actions.appendChild(b);
    });

    const row = document.createElement('div'); row.className='row';
    const cancel = document.createElement('button'); cancel.textContent='Abbrechen'; cancel.className='ghost'; cancel.addEventListener('click', ()=> wrap.remove());
    const send = document.createElement('button'); send.textContent='Nur senden'; send.addEventListener('click', ()=>{ try{ window.ChatDock && ChatDock.sendAttachment && ChatDock.sendAttachment({ dataUrl, prompt: 'Bitte analysiere dieses Bild im Kontext Business-Außenwirkung in 5 Punkten und nenne 3 Verbesserungsmöglichkeiten.' }); }catch{}; wrap.remove(); });
    row.appendChild(cancel); row.appendChild(send);

    wrap.appendChild(h4); wrap.appendChild(preview); wrap.appendChild(actions); wrap.appendChild(row);
    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', ensureUI);
})();


// Setze globalen Speicher für letzte Foto-DataURL
window.__lastPhotoDataURL = window.__lastPhotoDataURL || '';
window.addEventListener('photo:selected', (ev)=>{ try{ window.__lastPhotoDataURL = ev.detail && ev.detail.dataUrl ? ev.detail.dataUrl : ''; }catch{} });
