// server/routes/daily-idea.js — Auto-rotation bubble via Tavily + Claude (12h cache)
import express from 'express';
export const router = express.Router();

const TAVILY_API_KEY  = process.env.TAVILY_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

const CACHE = { item:null, ts:0 };
const TTL = 12 * 60 * 60 * 1000;

router.get('/daily/idea', async (req,res)=>{
  try{
    const now = Date.now();
    if(CACHE.item && (now - CACHE.ts) < TTL){
      return res.json({ ...CACHE.item, cachedAt: new Date(CACHE.ts).toISOString(), cached:true });
    }

    if(!TAVILY_API_KEY || !ANTHROPIC_API_KEY){
      return res.status(500).json({error:'Missing TAVILY_API_KEY or Claude key'});
    }

    // Tavily findet 3-5 Trending-Artikel rund um KI
    const tav = await fetch('https://api.tavily.com/search', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'AI trend OR new model OR breakthrough from:48h',
        search_depth:'basic',
        include_answer: false,
        max_results: 5
      })
    });
    const tr = await tav.json();
    const links = (tr?.results||[]).map(r=>r.url).slice(0,5);

    // Claude fasst zu einer „Mini-App“-Bubble zusammen (Label+Hint+Prompt)
    const prompt = `Du bist Produktstratege. Verdichte die folgenden Links zu einer EINZIGEN Bubble-Idee,
die normale Nutzer innerhalb von 60 Sekunden ausprobieren können. Antworte als JSON:
{
  "label": "kurzer Titel",
  "hint": "kurzer Hinweistext (max 8 Wörter)",
  "prompt": "Copy-Ready Prompt auf Deutsch, < 1200 Zeichen"
}
Links:
${links.join('\n')}`;

    const r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${ANTHROPIC_API_KEY}`,
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        temperature: 0.5,
        messages:[{role:'user', content: prompt}]
      })
    });
    const j = await r.json();
    const text = (j?.content||[]).map(c=>c.text||'').join('');
    let obj=null; try{ obj = JSON.parse(text); }catch{}
    if(!obj) obj = { label:'Heute neu', hint:'Klick – Kurzformat', prompt:'Fasse die spannendste KI-News von heute in zwei Sätzen zusammen.' };
    CACHE.item = obj; CACHE.ts = now;
    res.json({ ...obj, cachedAt: new Date(CACHE.ts).toISOString(), cached:false });
  }catch(e){ res.status(500).json({error:String(e)}) }
});
