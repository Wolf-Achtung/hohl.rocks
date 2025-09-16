// server/routes/news-live.js — Tavily + optional OpenAI summarizer (12h TTL)
import express from 'express';
export const router = express.Router();

let cache={t:0, items:[], updated:''};

async function httpPost(url, body, headers={}){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(await r.text()); return r.json();
}

function filter(items){
  const allow=(process.env.RESEARCH_ALLOW||'').split(',').map(s=>s.trim()).filter(Boolean);
  const block=(process.env.RESEARCH_BLOCK||'').split(',').map(s=>s.trim()).filter(Boolean);
  return (items||[]).filter(x=>{
    try{ const h=new URL(x.url).hostname;
      if(block.length && block.some(b=>h.endsWith(b))) return false;
      if(allow.length) return allow.some(a=>h.endsWith(a));
      return true;
    }catch(_){ return false; }
  });
}

async function summarize(items){
  if(!process.env.OPENAI_API_KEY) return items.slice(0,5).map(x=>({gist:x.title, url:x.url}));
  const txt=items.slice(0,6).map((x,i)=>`[${i+1}] ${x.title} — ${x.url} — ${x.content?.slice(0,240)||''}`).join('\n');
  const j=await httpPost('https://api.openai.com/v1/chat/completions',{
    model: process.env.RESEARCH_MODEL || 'gpt-4o-mini-2024-07-18',
    messages:[{role:'system',content:'Deutsch, knapp, präzise. Gib 5 GIST‑Bullets, jeweils 1 Satz, mit Quelle (URL).'},
              {role:'user',content:'Kurz destillieren:\n'+txt}],
    temperature:0.3
  },{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`});
  const out=(j.choices?.[0]?.message?.content||'').split(/\n+/).filter(Boolean).slice(0,5).map(line=>{
    const m=line.match(/\((https?:\/\/[^)]+)\)/); const url=m?m[1]:''; return { gist: line.replace(/\s*\(https?:.*\)$/,''), url };
  });
  return out;
}

router.get('/news/live', async (req,res)=>{
  const ttl=12*60*60*1000, now=Date.now();
  if(cache.items.length && (now-cache.t)<ttl){ return res.json({items:cache.items,updated:cache.updated}); }
  try{
    if(!process.env.TAVILY_API_KEY){ return res.json({items:[{gist:'TAVILY_API_KEY fehlt – statische News nutzen.',url:''}],updated:new Date().toISOString()}); }
    const j=await httpPost('https://api.tavily.com/search',{ api_key:process.env.TAVILY_API_KEY, query:'AI OR Artificial Intelligence OR generative AI site:news', search_depth:'advanced', max_results:10 });
    const items=filter(j.results||[]);
    const synth=await summarize(items);
    cache={ t:now, items:synth, updated:new Date().toISOString() };
    res.json({ items:synth, updated: cache.updated });
  }catch(e){
    res.status(500).json({ items:[{gist:'Fehler: '+String(e), url:''}], updated:new Date().toISOString() });
  }
});
