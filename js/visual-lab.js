/* visual-lab.js — file hooks & calls to backend visual routes */
(function(){
  const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.style.display='none'; document.body.appendChild(input);
  function toB64(file){ return new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(file); }); }
  async function call(path, body){ const res=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); return res.json(); }
  async function faceAge(){ input.onchange=async e=>{ const f=e.target.files[0]; if(!f) return; const b64=await toB64(f); const out=await call('/image/face-age',{imageBase64:b64,years:20}); openAnswerPopup('Aging‑Preview (Stub):\n'+(out.imageUrl||'keine Vorschau')); }; input.click(); }
  async function variations(){ input.onchange=async e=>{ const f=e.target.files[0]; if(!f) return; const b64=await toB64(f); const out=await call('/image/variations',{imageBase64:b64,n:4,style:'cinematic'}); openAnswerPopup('Varianten (Stub): '+(out.images?out.images.join(', '):'keine')); }; input.click(); }
  async function storyboard(){ const topic=prompt('Storyboard‑Thema?'); if(!topic) return; const out=await call('/video/storyboard',{topic,shots:6}); openAnswerPopup('Storyboard (Stub):\n'+(out.frames?out.frames.join('\n'):'keine Frames')); }
  window.VisualLab={ handle:(act)=>{ if(act==='face-age') faceAge(); else if(act==='variations') variations(); else if(act==='storyboard') storyboard(); } };
})();