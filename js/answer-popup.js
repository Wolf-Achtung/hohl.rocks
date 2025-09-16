/* answer-popup.js — Popup mit Kopieren & HTML */
(function(){
  function styleBtn(b){ Object.assign(b.style,{borderRadius:'999px',border:'1px solid rgba(255,255,255,.18)',padding:'8px 12px',cursor:'pointer'}); }
  function ensure(){ let p=document.getElementById('answer-popup'); if(p) return p;
    p=document.createElement('div'); p.id='answer-popup';
    Object.assign(p.style,{position:'fixed',left:'50%',top:'12%',transform:'translateX(-50%)',width:'min(920px,92vw)',maxHeight:'76vh',background:'rgba(12,16,22,.40)',border:'1px solid rgba(255,255,255,.14)',backdropFilter:'blur(12px)',borderRadius:'18px',padding:'16px',zIndex:'1400',color:'#eaf2ff',display:'none'});
    const content=document.createElement('div'); content.className='popup-content'; Object.assign(content.style,{whiteSpace:'pre-wrap',maxHeight:'60vh',overflow:'auto'});
    const bar=document.createElement('div'); Object.assign(bar.style,{display:'flex',gap:'8px',justifyContent:'space-between',alignItems:'center',marginTop:'10px'});
    const left=document.createElement('div'); left.textContent='';
    const copy=document.createElement('button'); copy.textContent='Kopieren'; styleBtn(copy);
    const close=document.createElement('button'); close.textContent='Schließen'; styleBtn(close);
    copy.onclick=()=>{ const text=(content.innerText||''); navigator.clipboard.writeText(text); copy.textContent='Kopiert!'; setTimeout(()=>copy.textContent='Kopieren', 1200); };
    close.onclick=()=> p.style.display='none';
    bar.appendChild(left); bar.appendChild(copy); bar.appendChild(close); p.appendChild(content); p.appendChild(bar); document.body.appendChild(p); return p;
  }
  window.openAnswerPopup=(content, asHTML=false, footerLeft='')=>{
    const p=ensure(); const node=p.querySelector('.popup-content');
    if(asHTML){ node.innerHTML=content; } else { node.textContent=content; }
    p.querySelector('div').textContent = footerLeft||'';
    p.style.display='block';
  };
})();