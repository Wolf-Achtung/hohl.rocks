import express from 'express';
export const router = express.Router();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

const CACHE = new Map(); // key -> {ts, data}
const TTL = 12 * 60 * 60 * 1000;

function ok(entry){ return entry && (Date.now() - entry.ts) < TTL; }
function headersClaude(){ return { 'x-api-key': API_KEY, 'anthropic-version':'2023-06-01', 'content-type':'application/json' }; }

// /news/today -> kurze, verlinkbare KI-News (cached 12h)
router.get('/news/today', async (req,res)=>{
  try{
    const key='today';
    const hit=CACHE.get(key);
    if(ok(hit)) return res.json(hit.data);

    if(!TAVILY_API_KEY) return res.status(503).json({error:'TAVILY_API_KEY fehlt'});

    // Tavily Meta-Suche
    const tv = await fetch('https://api.tavily.com/search', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'today AI generative model update enterprise policy safety open-source breakthrough',
        search_depth: 'advanced', include_domains: [], exclude_domains: [],
        include_answer: false, max_results: 10
      })
    });
    const j = await tv.json();

    // Kurz-Zusammenfassung mit Claude
    const textSources = (j?.results||[]).map(r=>`- ${r.title} — ${r.url}`).join('\n');
    const prompt = `Fasse maximal drei KI-News von heute ultra-kurz & brauchbar zusammen (je 1 Satz). Gib danach eine 1-Satz-Implikation für Entscheider.\nQuellen:\n${textSources}\nFormatiere als Markdown-Liste.`;
    const c = await fetch(API_URL, { method:'POST', headers: headersClaude(),
      body: JSON.stringify({ model: MODEL, max_tokens: 800, stream:false, messages:[{role:'user', content: prompt}] })});
    const cj = await c.json(); const text=(cj?.content||[]).map(x=>x?.text||'').join('');

    const data = { text, at: new Date().toISOString() };
    CACHE.set(key, {ts: Date.now(), data});
    res.json(data);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

// /daily/idea -> „Heute neu“-Bubble (wechselt 1×/Tag)
router.get('/daily/idea', async (req,res)=>{
  try{
    const key='daily'; const hit=CACHE.get(key);
    if(ok(hit)) return res.json(hit.data);

    const topics = ['Agentic research pattern', 'KI für KMU-Backoffice', 'Marketing-Automation low-code', 'Sichere Prompting-Muster', 'RAG ohne Vektordb'];
    const seed = topics[(new Date().getUTCDate()+new Date().getUTCMonth()) % topics.length];

    const prompt = `Erzeuge eine einzige, sofort anwendbare "Heute neu"-Idee (Titel + 2 kurze, exakte Schritte) zum Thema: ${seed}. Kein Fluff.`;
    const c = await fetch(API_URL, { method:'POST', headers: headersClaude(),
      body: JSON.stringify({ model: MODEL, max_tokens: 500, stream:false, messages:[{role:'user', content: prompt}] })});
    const cj = await c.json(); const text=(cj?.content||[]).map(x=>x?.text||'').join('');
    const data={ text, at:new Date().toISOString(), seed };
    CACHE.set(key,{ts: Date.now(), data});
    res.json(data);
  }catch(e){ res.status(500).json({error:String(e)}); }
});
