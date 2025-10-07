/* public/js/ux-coach.js — first-run coach + help button */
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

  const tip=document.createElement('div'); Object.assign(tip.style,{position:'fixed',zIndex:1600,background:'rgba(12,16,22,.9)',border:'1px solid rgba(255,255,255,.18)',color:'#eaf2ff',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',pointerEvents:'none',display:'none'}); document.body.appendChild(tip);
  window.UXCoach={ tip:(text,x,y)=>{ tip.textContent=text; tip.style.display='block'; tip.style.left=(x+12)+'px'; tip.style.top=(y+12)+'px'; }, hide:()=>{ tip.style.display='none'; } };

  window.addEventListener('DOMContentLoaded', ()=>{
    const help=document.createElement('div'); help.id='help'; help.style.cssText='position:fixed;right:20px;bottom:80px;z-index:1400;background:rgba(12,16,22,.55);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);padding:8px 10px;border-radius:999px;cursor:pointer';
    help.innerHTML='<span style="display:inline-block;border-radius:50%;width:22px;height:22px;line-height:22px;text-align:center;background:#00B0FF;color:#06221b;font-weight:800;margin-right:6px">?</span>Was kann ich hier tun?';
    document.body.appendChild(help);
    help.onclick=()=>{
      if(window.openAnswerPopup) openAnswerPopup('<b>Was kann ich hier tun?</b><br><br>• <b>Bubble klicken</b>: Ergebnis im Fenster (Recherche, Cage‑Match, Face‑Aging …)<br>• <b>Buttons unten</b>: Über / News / Prompts / Projekte<br>• <b>Shortcuts</b>: Doppelklick „News“ → Model‑Picker · Cmd/Ctrl+R → Recherche', true);
    };
  });
})();