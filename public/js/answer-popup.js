// public/js/answer-popup.js
import { sendClaudeStream } from './claude-stream.js';

const root = document.getElementById('popup-root');

function el(tag, cls, txt){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt!=null) e.textContent = txt;
  return e;
}

export function openAnswerPopup({title, explain, content}) {
  closePopups();
  const box = el('div','popup');
  const h3 = el('h3', null, title || 'Antwort');
  box.appendChild(h3);
  if (explain) {
    const p = el('p','explain', explain);
    p.setAttribute('role','note');
    box.appendChild(p);
  }
  const copyBtn = el('button','copy-btn','Kopieren');
  const closeBtn= el('button','close-btn','Schließen');
  closeBtn.addEventListener('click', closePopups);
  copyBtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(content || '').then(()=>{
      copyBtn.textContent = 'Kopiert ✓';
      setTimeout(()=> copyBtn.textContent='Kopieren', 1200);
    });
  });
  box.appendChild(closeBtn);
  box.appendChild(copyBtn);

  const pre = el('div','stream', content || '');
  pre.setAttribute('aria-live','polite');
  box.appendChild(pre);

  root.appendChild(box);
}

export function openInputBubble({title, explain, placeholder, prompt, threadId}) {
  closePopups();
  const box = el('div','popup');
  const h3 = el('h3', null, title || 'Eingabe');
  box.appendChild(h3);
  if (explain) {
    const p = el('p','explain', explain);
    p.setAttribute('role','note');
    box.appendChild(p);
  }
  const copyBtn = el('button','copy-btn','Kopieren');
  const closeBtn= el('button','close-btn','Schließen');
  closeBtn.addEventListener('click', closePopups);
  box.appendChild(closeBtn); box.appendChild(copyBtn);

  const ta = el('textarea', null, '');
  ta.placeholder = placeholder || 'Notizen hier …';
  ta.setAttribute('aria-label','Eingabe');
  box.appendChild(ta);

  const actions = el('div','actions');
  const sendBtn = el('button','btn','Senden');
  actions.appendChild(sendBtn);
  box.appendChild(actions);

  const stream = el('div','stream','');
  stream.setAttribute('aria-live','polite');
  box.appendChild(stream);

  copyBtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(stream.textContent || '').then(()=>{
      copyBtn.textContent = 'Kopiert ✓';
      setTimeout(()=> copyBtn.textContent='Kopieren', 1200);
    });
  });

  sendBtn.addEventListener('click', ()=>{
    stream.textContent = '';
    const user = (ta.value || '').trim();
    const fullPrompt = (prompt || '').replace('{{INPUT}}', user);
    const flow = sendClaudeStream({prompt: fullPrompt, system: title, threadId});
    flow.start(
      (delta)=> { stream.textContent += delta; stream.scrollTop = stream.scrollHeight; },
      ()=> {},
      (err)=> { stream.textContent = `[Fehler] ${err?.message || err}`; }
    );
  });

  root.appendChild(box);
  ta.focus();
}

export function closePopups(){
  root.innerHTML = '';
}
