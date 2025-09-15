/* mini-editor.js — kleiner Prompt-Editor, bindet an answer-popup */
(function(){
  'use strict';
  const box = document.getElementById('mini-editor'); if(!box) return;
  const ta = document.getElementById('mini-editor-text');
  document.getElementById('mini-close').onclick = ()=> box.style.display='none';
  document.getElementById('mini-send').onclick = ()=>{
    const txt = ta.value||'';
    if(!txt.trim()) return;
    if(typeof window.fetchAnswer==='function'){ window.fetchAnswer(txt); }
    box.style.display='none';
  };
  window.addEventListener('open:editor', (ev)=>{
    ta.value = (ev.detail && ev.detail.text)||'';
    box.style.display = 'block';
  });
})();