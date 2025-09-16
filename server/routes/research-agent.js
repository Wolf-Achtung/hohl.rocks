// server/routes/research-agent.js
import express from 'express';
import fetch from 'node-fetch';
export const router = express.Router();

function sseWrite(res, data){ res.write(`data: ${JSON.stringify({chunk:data})}\n\n`); }
function sseDone(res){ res.write('event: done\n'); res.write('data: {}\n\n'); res.end(); }

router.get('/research-sse', async (req, res) => {
  const q = (req.query.q||'').toString().slice(0, 500);
  res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});

  const plan = [
    `Begriff/Scope klären für: ${q}`,
    '3–5 Suchsätze formulieren',
    'Top‑Treffer triagieren (Gist + Evidenz)',
    'Synthese 5‑3‑1 + Cites',
    'Nächster Schritt vorschlagen'
  ];
  sseWrite(res, {phase:'plan', steps:plan});

  let items = [];
  try{
    if(process.env.TAVILY_API_KEY){
      const r = await fetch('https://api.tavily.com/search',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({api_key:process.env.TAVILY_API_KEY, query:q, search_depth:'advanced', max_results:6})
      });
      const j = await r.json();
      items = (j.results||[]).map(x=>({title:x.title, url:x.url, gist:x.content?.slice(0,220)||''}));
    } else {
      items = [{title:'(ohne externe Suche)', url:'', gist:'TAVILY_API_KEY fehlt – nur Plan + Synthese ohne Webquellen.'}];
    }
    sseWrite(res, {phase:'triage', items});
  }catch(e){
    sseWrite(res, {phase:'triage', items:[{title:'Fehler bei Suche', url:'', gist:String(e)}]});
  }

  const text = `Thema: ${q}\n• Zusammenfassung in 5 Punkten\n• dann 3 Punkte\n• dann 1 Satz. (LLM‑Platzhalter)`;
  const cites = items.filter(x=>x.url).slice(0,5).map(x=>`${x.title} — ${x.url}`);
  sseWrite(res, {phase:'synthesis', text, cites});
  sseDone(res);
});
