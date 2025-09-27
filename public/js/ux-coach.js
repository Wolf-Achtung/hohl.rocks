/* public/js/ux-coach.js — 3-step mini tour & help button */
(function(){
  const KEY='coach_seen_v2';
  function show(){
    const seen = localStorage.getItem(KEY);
    if(seen) return;
    const wrap = document.createElement('div');
    Object.assign(wrap.style,{position:'fixed',inset:'0',background:'rgba(8,12,16,.42)',backdropFilter:'blur(2px)',zIndex:1600,display:'grid',placeItems:'center'});
    const card = document.createElement('div');
    Object.assign(card.style,{width:'min(820px,90vw)',background:'rgba(12,16,22,.72)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'16px',padding:'16px',color:'#eaf2ff'});
    card.innerHTML = `<div style="font-weight:800;margin-bottom:8px">Was kann ich hier tun?</div>
    <ol style="line-height:1.6;margin:0 0 12px 18px;">
      <li>Eine farbige Bubble anklicken – sie erklärt kurz, was passiert.</li>
      <li>Im schwebenden Fenster erscheint die Antwort. Klick auf <b>Kopieren</b> nimmt sie in die Zwischenablage.</li>
      <li>Nutze die Chips <b>Kürzer</b>, <b>Beispiel</b>, <b>Checkliste</b> für Sofort‑Varianten.</li>
    </ol>
    <div style="opacity:.85">Tipp: Beim Klick startet der leise Ambient‑Sound. Unten rechts kannst du ihn ausschalten.</div>`;
    const ok = document.createElement('button'); ok.textContent='Los geht’s'; 
    Object.assign(ok.style,{marginTop:'12px',borderRadius:'999px',border:'1px solid rgba(255,255,255,.18)',padding:'8px 12px',cursor:'pointer'});
    ok.onclick=()=>{ localStorage.setItem(KEY,'1'); wrap.remove(); };
    card.appendChild(ok); wrap.appendChild(card); document.body.appendChild(wrap);
  }
  window.addEventListener('DOMContentLoaded', ()=>{
    // help button
    const help = document.createElement('button'); help.textContent='? Hilfe';
    Object.assign(help.style,{position:'fixed',right:'20px',bottom:'70px',zIndex:1500,background:'rgba(12,16,22,.60)',color:'#eaf2ff',border:'1px solid rgba(255,255,255,.18)',borderRadius:'999px',padding:'8px 12px',cursor:'pointer',backdropFilter:'blur(8px)'});
    help.onclick=show; document.body.appendChild(help);
    // show once
    setTimeout(show, 900);
  });
})();