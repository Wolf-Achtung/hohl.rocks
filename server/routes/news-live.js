// server/routes/news-live.js — Tavily AI news + Claude summarizer
import express from 'express';

export const router = express.Router();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

router.get('/news/today', async (req,res)=>{
  try{
    if(!TAVILY_API_KEY) return res.status(500).json({error:'Missing TAVILY_API_KEY'});
    const q = req.query.q || 'AI AND (model OR research OR regulation) from:24h';
    const tav = await fetch('https://api.tavily.com/search', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: String(q),
        search_depth:'advanced',
        include_answer: false,
        max_results: 6
      })
    });
    const tr = await tav.json();
    const items = (tr?.results||[]).slice(0,5).map(r=>({title:r.title, url:r.url}));
    let summary=''; let title='KI‑News'; let links=items.map(i=>i.url);

    if(ANTHROPIC_API_KEY){
      const prompt = `Fasse die wichtigsten KI‑News der letzten 24h in 2 prägnanten Sätzen zusammen. 
Liefere danach eine Zeile "Quellen:" und liste genau zwei der folgenden Links (repräsentativ) auf:\n${links.join('\n')}\n`;
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{
          'Authorization':`Bearer ${ANTHROPIC_API_KEY}`,
          'Content-Type':'application/json',
          'anthropic-version':'2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 600,
          temperature: 0.2,
          messages:[{role:'user', content: prompt}]
        })
      });
      const j = await r.json();
      summary = (j?.content||[]).map(c=>c.text||'').join('');
      title = 'KI‑News heute';
    }else{
      summary = 'Aktuelle KI‑News konnten nicht verdichtet werden (kein Claude‑Key).';
    }
    res.json({ title, summary, links });
  }catch(e){ res.status(500).json({error:String(e)}) }
});