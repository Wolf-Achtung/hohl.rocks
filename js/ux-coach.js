/* ux-coach.js — First-run coach, rotating tips, hover tooltip */
(function(){
  const key='ux_seen_v1';
  function coach(){
    const c=document.createElement('div');
    Object.assign(c.style,{position:'fixed',inset:'0',zIndex:1500,background:'rgba(10,17,24,.55)',backdropFilter:'blur(4px)',display:'grid',placeItems:'center'});
    const card=document.createElement('div');
    Object.assign(card.style,{width:'min(820px,92vw)',background:'rgba(12,16,22,.8)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'18px',padding:'18px',color:'#eaf2ff'});
    card.innerHTML=`<b>Willkommen! So nutzt du hohl.rocks in 30 Sekunden:</b>
    <ol style="line-height:1.6">
      <li>Klicke eine <b>Bubble</b> – du bekommst sofort eine <b>fertige Aktion</b> (z. B. Live‑Recherche, Face‑Aging, Cage‑Match).</li>
      <li>Nutze die <b>Buttons unten</b> für Kurzinfos: <i>Über</i>, <i>News</i>, <i>Prompts</i>, <i>Projekte</i>.</li>
      <li>Shortcuts: <b>Doppelklick „News“</b> → Model‑Picker · <b>Cmd/Ctrl+R</b> → Research‑Agent.</li>
    </ol>`;
    const ok=document.createElement('button'); ok.textContent='Los geht’s'; Object.assign(ok.style,{marginTop:'10px',borderRadius:'999px',border:'1px solid rgba(255,255,255,.18)',padding:'8px 12px',cursor:'pointer'});
    ok.onclick=()=>{ localStorage.setItem(key,'1'); c.remove(); };
    card.appendChild(ok); c.appendChild(card); document.body.appendChild(c);
  }
  if(!localStorage.getItem(key)) window.addEventListener('DOMContentLoaded', coach, {once:true});

  // Rotierende Tipps im pre-msg
  const TIPS=[
    '💡 Tipp: Klicke eine farbige Bubble — Ergebnis erscheint im Fenster.',
    '🧠 Cmd/Ctrl+R: Research‑Agent mit Quellen‑Stream.',
    '⚔️ „Cage‑Match“: zwei Modelle vergleichen – mit Gewichtung.',
    '🖼️ Face‑Aging & Variationen: lade ein Foto und staune.'
  ];
  window.addEventListener('DOMContentLoaded', ()=>{
    const pm=document.getElementById('pre-msg'); if(!pm) return;
    let i=0; setInterval(()=>{ i=(i+1)%TIPS.length; pm.textContent=TIPS[i]; }, 7000);
  });

  // Hover‑Tooltip für Bubbles
  const tip=document.createElement('div'); Object.assign(tip.style,{position:'fixed',zIndex:1600,background:'rgba(12,16,22,.9)',border:'1px solid rgba(255,255,255,.18)',color:'#eaf2ff',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',pointerEvents:'none',display:'none'}); document.body.appendChild(tip);
  window.UXCoach={ tip:(text,x,y)=>{ tip.textContent=text; tip.style.display='block'; tip.style.left=(x+12)+'px'; tip.style.top=(y+12)+'px'; }, hide:()=>{ tip.style.display='none'; } };

  // Help-Button
  window.addEventListener('DOMContentLoaded', ()=>{
    const btn=document.getElementById('help'); if(!btn) return;
    btn.onclick=()=>{
      openAnswerPopup(`<b>Was kann ich hier tun?</b><br><br>
        • <b>Bubble klicken</b>: sofort Ergebnis (Recherche, Cage‑Match, Face‑Aging …)<br>
        • <b>Buttons unten</b>: Über / News / Prompts / Projekte<br>
        • <b>Shortcuts</b>: Doppelklick „News“ → Model‑Picker · Cmd/Ctrl+R → Recherche` , true);
    };
  });
})();