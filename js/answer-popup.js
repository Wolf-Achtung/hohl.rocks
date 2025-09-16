/* answer-popup.js — Popup mit Copy & Close */
(function(){
  'use strict';
  function ensure(){
    let p=document.getElementById('answer-popup'); if(p) return p;
    p=document.createElement('div'); p.id='answer-popup';
    Object.assign(p.style,{position:'fixed',left:'50%',top:'15%',transform:'translateX(-50%)',width:'min(760px,92vw)',maxHeight:'70vh',
      background:'rgba(12,16,22,.40)',border:'1px solid rgba(255,255,255,.14)',backdropFilter:'blur(12px)',borderRadius:'18px',
      padding:'16px',zIndex:'1400',color:'#eaf2ff',display:'none'});
    const content=document.createElement('div'); content.className='popup-content'; Object.assign(content.style,{whiteSpace:'pre-wrap',maxHeight:'56vh',overflow:'auto'});
    const bar=document.createElement('div'); Object.assign(bar.style,{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'10px'});
    const copy=document.createElement('button'); copy.textContent='Kopieren'; style(copy);
    const close=document.createElement('button'); close.textContent='Schließen'; style(close);
    copy.onclick=()=>{ navigator.clipboard.writeText(content.textContent||''); copy.textContent='Kopiert!'; setTimeout(()=>copy.textContent='Kopieren', 1200); };
    close.onclick=()=> p.style.display='none';
    bar.appendChild(copy); bar.appendChild(close); p.appendChild(content); p.appendChild(bar); document.body.appendChild(p); return p;
    function style(b){ Object.assign(b.style,{borderRadius:'999px',border:'1px solid rgba(255,255,255,.18)',padding:'8px 12px',cursor:'pointer'}); }
  }
  window.openAnswerPopup = (text)=>{ const p=ensure(); p.querySelector('.popup-content').textContent=text; p.style.display='block'; };
})();