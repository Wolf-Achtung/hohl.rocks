/* visual-lab.js — Face-Aging & Variations; simple UI */
(function(){
  const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.style.display='none'; document.body.appendChild(input);
  function toB64(f){ return new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(f); }); }
  async function call(path, body){ const res=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!res.ok) throw new Error(await res.text()); return res.json(); }
  function show(html){ openAnswerPopup(html,true); }
  function faceAge(){ input.onchange=async e=>{ const f=e.target.files[0]; if(!f) return; const years=prompt('Wie viele Jahre älter? (10–40)', '20'); if(!years) return; const b64=await toB64(f); const out=await call('/image/face-age',{imageBase64:b64,years:Number(years)}); show(`<div style="display:grid;gap:10px;justify-items:center"><img src="${out.imageUrl}" style="max-width:92%;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.35)"><small>${out.note||''}</small></div>`); }; input.click(); }
  function variations(){ input.onchange=async e=>{ const f=e.target.files[0]; if(!f) return; const b64=await toB64(f); const out=await call('/image/variations',{imageBase64:b64}); const grid=(out.images||[]).map(u=>`<img src="${u}" style="width:100%;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.32)">`).join(''); show(`<div style="display:grid;gap:10px;grid-template-columns:repeat(2,1fr);">${grid}</div>`); }; input.click(); }
  async function storyboard(){ const topic=prompt('Storyboard‑Thema?'); if(!topic) return; const out=await call('/video/storyboard',{topic,shots:6}); const list=(out.frames||[]).map(s=>`<li>${s}</li>`).join(''); show(`<ol style="padding-left:18px">${list}</ol>`); }
  window.VisualLab={ handle:(act)=>{ if(act==='face-age') faceAge(); else if(act==='variations') variations(); else if(act==='storyboard') storyboard(); } };
})();