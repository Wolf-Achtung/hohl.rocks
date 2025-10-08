// public/js/answer-popup.js — Unified Popups with Rich Content + Input Help
import { streamClaude } from './claude-stream.js';

const root = document.getElementById('popup-root');
function el(tag, cls, txt){ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
function closeAll(){ root.innerHTML=''; }
function toast(msg){ const t=el('div','toast',msg); root.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{t.classList.remove('show'); t.remove();},1600); }
async function copyToClipboard(text){ try{ await navigator.clipboard.writeText(text); toast('Kopiert ✓'); }catch{ toast('Kopieren nicht möglich'); } }

function basePopup({title='Info', explain='' }={}){
  const overlay=el('div','popup'); const box=el('div','popup-inner'); const h=el('div','popup-title',title);
  const x=el('button','popup-close','×'); x.addEventListener('click',closeAll); box.append(h,x); if(explain) box.append(el('div','popup-explain',explain));
  const body=el('div','popup-body'); const actions=el('div','popup-actions'); const cpy=el('button','btn','Kopieren'); const ok=el('button','btn btn-primary','Schließen');
  ok.addEventListener('click',closeAll); actions.append(cpy,ok); overlay.appendChild(box); box.append(body,actions); root.appendChild(overlay); return {overlay,box,body,cpy,ok};
}

export function openAnswerPopup({title='Info', explain='', content=''}={}){
  closeAll(); const ui=basePopup({title,explain}); const pre=el('pre','answer'); pre.textContent=content; ui.body.append(pre); ui.cpy.addEventListener('click',()=>copyToClipboard(pre.textContent));
}

export function openCustomPopup({title='Info', explain='', contentNode}={}){
  closeAll(); const ui=basePopup({title,explain}); const container=el('div','answer rich'); if(contentNode) container.append(contentNode); ui.body.append(container);
  ui.cpy.addEventListener('click',()=>copyToClipboard(container.textContent||''));
}

export function openInputBubble({title='Frage', explain='', placeholder='', prompt='', threadId='', help='' }={}){
  closeAll();
  const overlay=el('div','popup'); const box=el('div','popup-inner'); const h=el('div','popup-title',title);
  const x=el('button','popup-close','×'); x.addEventListener('click',closeAll);
  const exp=explain? el('div','popup-explain',explain): null;
  const helpBox = help ? el('div','popup-help', help) : null;

  const body=el('div','popup-body'); const ta=el('textarea','prompt-input'); if(placeholder) ta.placeholder=placeholder;
  const out=el('pre','answer'); const actions=el('div','popup-actions'); const send=el('button','btn btn-primary','Senden'); const cpy=el('button','btn','Kopieren'); cpy.disabled=true;
  const cancel=el('button','btn','Abbrechen');

  actions.append(send, cpy, cancel); body.append(ta, out);
  box.append(h,x); if(exp) box.append(exp); if(helpBox) box.append(helpBox); box.append(body, actions); overlay.append(box); root.append(overlay);

  let acc=''; const append=(txt)=>{ acc+=txt; out.textContent+=txt; };

  send.addEventListener('click', async ()=>{
    send.disabled=true; cancel.disabled=false; ta.disabled=true; out.textContent=''; acc='';
    const userText=ta.value.trim();
    const composed = (prompt && prompt.includes('{{input}}')) ? prompt.replace('{{input}}', userText) : (prompt ? `${prompt}\n\n${userText}` : userText);
    await streamClaude({ prompt: composed, system:'hohl.rocks', thread: threadId||'' }, {
      onToken:(t)=>append(t),
      onDone:()=>{ cpy.disabled=!acc; send.disabled=false; },
      onError:(e)=>{ append(`\n[Fehler] ${e?.message || e}`); send.disabled=false; }
    });
  });

  cpy.addEventListener('click',()=>copyToClipboard(acc)); cancel.addEventListener('click',closeAll);
}
