/* nav-filters.js — Popup-Triggers */
(function(){
  const about=[
    "Wolf Hohl ist TÜV‑zertifizierter KI‑Manager mit 30+ Jahren Marketing‑Erfahrung. Fokus: pragmatische, kreative KI‑Lösungen für Medien & Mittelstand.",
    "Ich helfe Teams, KI produktiv zu nutzen: von Quickwins bis Trusted KI‑Check (AI Act/DSGVO/ISO 42001)."
  ];
  const projects=[
    "Projekt „hohl.rocks“: Interaktive KI‑Bühne mit Highway‑Video, Neon‑Bubbles und täglichen Prompts.",
    "Projekt „Trusted KI‑Check“: Audit‑Framework nach AI‑Act/DSGVO/ISO 42001 mit pragmatischen Empfehlungen.",
    "Projekt „Prompt‑Studio“: Kompakt‑Workshop inkl. Prompt‑Devs, Test & Team‑Deck."
  ];
  async function onClick(e){
    const b=e.target.closest('button'); if(!b) return;
    const cat=b.dataset.cat; let msg='';
    if(cat==='about'){ msg = about[Math.floor(Math.random()*about.length)]; }
    else if(cat==='news'){ const arr=await (window.DailyFeed&&DailyFeed.news?DailyFeed.news():Promise.resolve([])); msg=arr[Math.floor(Math.random()*arr.length)]||"Heute: Fokus auf verantwortungsvolle KI‑Nutzung."; }
    else if(cat==='prompts'){ const arr=await (window.DailyFeed&&DailyFeed.prompt?DailyFeed.prompt():Promise.resolve([])); msg=arr[0]||"🧠 Prompt: „Schreibe einen 3‑Satz‑Pitch …“"; }
    else if(cat==='projects'){ msg = projects[Math.floor(Math.random()*projects.length)]; }
    if(msg && window.openAnswerPopup) window.openAnswerPopup(msg);
  }
  document.addEventListener('DOMContentLoaded',()=>{ const bar=document.getElementById('nav-buttons'); if(bar){ bar.addEventListener('click', onClick); } });
})();