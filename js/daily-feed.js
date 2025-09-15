/* daily-feed.js — einfacher Client-Cache für News/Prompt des Tages */
(function(){
  const TTL = 12*60*60*1000;
  function ttlGet(k){ try{ const r=localStorage.getItem(k); if(!r) return null; const {t,v}=JSON.parse(r); return (Date.now()-t<TTL)?v:null; }catch(_){ return null; } }
  function ttlSet(k,v){ try{ localStorage.setItem(k, JSON.stringify({t:Date.now(),v})); }catch(_){ } }
  async function fetchJSON(url, fallback){ const ck='feed:'+url; const c=ttlGet(ck); if(c) return c;
    try{ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw 0; const j=await r.json(); ttlSet(ck,j); return j; }catch(_){ return fallback; } }
  window.DailyFeed = {
    async news(){ return fetchJSON('/api/news.json',[ "EU-AI-Act: neue Leitfäden für KMU.", "SLMs lokal: Datenschutz & Kosten als Vorteil." ]); },
    async prompt(){ return fetchJSON('/api/prompt.json',[ "🧠 Prompt: „Schreibe einen 3‑Satz‑Pitch + 1 Beispiel + 1 nächster Schritt für [Branche] mit Fokus auf [Ziel].“" ]); }
  };
})();