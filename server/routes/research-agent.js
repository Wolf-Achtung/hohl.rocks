// server/routes/research-agent.js
import express from 'express';
export const router = express.Router();

const cache = new Map(); // 12h memory cache

function write(res, data){ res.write(`data: ${JSON.stringify({chunk:data})}\n\n`); }
function done(res){ res.write('event: done\n'); res.write('data: {}\n\n'); res.end(); }

async function httpPostJSON(url, body, headers={}){
  const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', ...headers }, body: JSON.stringify(body) });
  if(!r.ok) throw new Error(await r.text());
  return await r.json();
}

function filterByDomain(items, allowList, blockList){
  const allow = (allowList||'').split(',').map(s=>s.trim()).filter(Boolean);
  const block = (blockList||'').split(',').map(s=>s.trim()).filter(Boolean);
  return (items||[]).filter(it=>{
    try{
      const u = new URL(it.url||''); const host = u.hostname||'';
      if(block.length && block.some(b=>host.endsWith(b))) return false;
      if(allow.length) return allow.some(a=>host.endsWith(a));
      return true;
    }catch(e){ return false; }
  });
}

async function synthesizeWithCitations(question, triage){
  if(!process.env.OPENAI_API_KEY){
    // graceful fallback
    const cites = (triage||[]).slice(0,5).map(x=>`${x.title} — ${x.url}`);
    return { text: `Thema: ${question}\n• 5 Punkte\n• dann 3 Punkte\n• dann 1 Satz. (OPENAI_API_KEY fehlt)`, cites };
  }
  const system = "Du bist ein präziser Research-Synthesizer. Antworte knapp, strukturiert, mit Quellen.";
  const user = `Frage: ${question}
Quellen (Top-Treffer):
${(triage||[]).map((x,i)=>`[${i+1}] ${x.title} — ${x.url} — Gist: ${x.gist||''}`).join('\n')}

Gib aus:
1) 5-Punkte-Zusammenfassung
2) 3-Punkte-Kern
3) 1-Satz-Bottomline
4) CITES: nummerierte Liste [1].. mit Quelle (Titel — URL)
`;
  const j = await httpPostJSON('https://api.openai.com/v1/chat/completions',{
    model: process.env.RESEARCH_MODEL || 'gpt-4o-mini-2024-07-18',
    messages:[ {role:'system',content:system}, {role:'user',content:user} ],
    temperature: 0.3
  }, { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` });
  const text = j.choices?.[0]?.message?.content || '(keine Synthese)';
  const cites = (triage||[]).slice(0,5).map(x=>`${x.title} — ${x.url}`);
  return { text, cites };
}

router.get('/research-sse', async (req, res) => {
  const q = (req.query.q||'').toString().slice(0, 500);
  res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});

  write(res, {phase:'plan', steps:[
    `Begriff/Scope klären für: ${q}`,
    '3–5 Suchsätze formulieren',
    'Top‑Treffer triagieren (Gist + Evidenz; Whitelist/Blocklist beachten)',
    'Synthese 5‑3‑1 + Cites (forced)',
    'Nächster Schritt vorschlagen'
  ]});

  const key = `tavily:${q}`;
  const now = Date.now();
  let items;
  const hit = cache.get(key);
  if(hit && (now - hit.t) < 12*60*60*1000){
    items = hit.items;
  } else {
    try{
      if(process.env.TAVILY_API_KEY){
        const j = await httpPostJSON('https://api.tavily.com/search',{
          api_key: process.env.TAVILY_API_KEY,
          query: q,
          search_depth: 'advanced',
          max_results: 8
        });
        items = (j.results||[]).map(x=>({title:x.title, url:x.url, gist:x.content?.slice(0,220)||''}));
      } else {
        items = [{title:'(ohne externe Suche)', url:'', gist:'TAVILY_API_KEY fehlt – nur Plan + Synthese ohne Webquellen.'}];
      }
      cache.set(key, {t: now, items});
    }catch(e){
      items=[{title:'Fehler bei Suche', url:'', gist:String(e)}];
    }
  }

  // Domain filtering
  const allow=process.env.RESEARCH_ALLOW||''; const block=process.env.RESEARCH_BLOCK||'';
  const filtered = filterByDomain(items, allow, block);
  write(res, {phase:'triage', items: filtered });

  // Synthesis
  try{
    const syn = await synthesizeWithCitations(q, filtered);
    write(res, {phase:'synthesis', text: syn.text, cites: syn.cites });
  }catch(e){
    write(res, {phase:'synthesis', text: 'Synthese-Fehler: '+String(e), cites: [] });
  }
  done(res);
});
