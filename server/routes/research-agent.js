
// server/routes/research-agent.js — SSE + JSON fallback (Tavily + OpenAI)
// ESM, Node >= 18
import express from 'express';

export const router = express.Router();

const TTL_MS = 12 * 60 * 60 * 1000;
let cache = new Map(); // key -> {t, triage, synth}

function envList(name){
  return String(process.env[name]||'')
    .split(',')
    .map(s=>s.trim())
    .filter(Boolean);
}
const allowDomains = () => envList('RESEARCH_ALLOW');
const blockDomains = () => envList('RESEARCH_BLOCK');

function filterDomains(url){
  try{
    const h = new URL(url).hostname;
    const blocks = blockDomains();
    if(blocks.length && blocks.some(b=>h.endsWith(b))) return false;
    const allows = allowDomains();
    if(allows.length) return allows.some(a=>h.endsWith(a));
    return true;
  }catch(e){ return false; }
}

async function tavilySearch(query){
  if(!process.env.TAVILY_API_KEY){
    return { results: [] };
  }
  const body = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: 'advanced',
    max_results: 10,
    include_images: false,
    include_answer: false
  };
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if(!r.ok){
    throw new Error(`Tavily ${r.status}`);
  }
  return await r.json();
}

async function openaiSynthesis(items, query){
  if(!process.env.OPENAI_API_KEY){
    return {
      text: 'OPENAI_API_KEY fehlt – zeige nur triagierte Quellen.',
      cites: items.slice(0,5).map(x=>x.url)
    };
  }
  const model = process.env.RESEARCH_MODEL || 'gpt-4o-mini-2024-07-18';
  const bullets = items.slice(0,6).map((x,i)=>`[${i+1}] ${x.title} — ${x.url} — ${x.content?.slice(0,220)||''}`).join('\n');
  const sys = 'Deutsch, prägnant, faktenbasiert. Antworte mit 1 Absatz TL;DR und danach 4–6 Bulletpoints mit **konkreten Zahlen**/Belegen. Gib am Ende eine Liste „Quellen:“ mit den URLs, exakt so wie verwendet. Keine Foren/SEO-Seiten.';
  const user = `Thema: ${query}\nMaterial:\n${bullets}`;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model, temperature: 0.3,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    })
  });
  const j = await r.json().catch(()=>({}));
  const text = j?.choices?.[0]?.message?.content || '(keine Antwort)';
  const cites = Array.from(new Set(
    (text.match(/https?:\/\/[^\s)\]]+/g) || [])
      .filter(filterDomains)
  ));
  return { text, cites };
}

async function runPipeline(query){
  const hit = cache.get(query);
  const now = Date.now();
  if(hit && (now - hit.t) < TTL_MS){
    return hit;
  }

  const plan = [
    'Absicht klären und Suchpfad festlegen',
    'Seriöse, aktuelle Quellen suchen (Tavily)',
    'Triage über Whitelist/Blocklist filtern',
    'Synthese (OpenAI) mit erzwungenen Quellen'
  ];

  const raw = await tavilySearch(query);
  const triage = (raw.results || [])
    .filter(r => r && r.url && filterDomains(r.url))
    .map(r => ({
      title: r.title || r.url,
      url: r.url,
      gist: r.snippet || '',
      content: r.content || ''
    }));

  const synth = await openaiSynthesis(triage, query);

  const out = { t: now, plan, triage, synth };
  cache.set(query, out);
  return out;
}

function sendSSE(res, payload){
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

router.get('/research-sse', async (req, res) => {
  const q = String(req.query.q || 'KI heute – was ist wirklich neu?');
  res.setHeader('Content-Type','text/event-stream');
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Connection', 'keep-alive');

  sendSSE(res, { chunk:{ phase:'start', query:q }});

  try{
    const plan = [
      'Absicht & Suchpfad',
      'Seriöse Quellen',
      'Triage (Whitelist/Blocklist)',
      'Synthese + Zitate'
    ];
    sendSSE(res, { chunk:{ phase:'plan', steps: plan }});

    const { triage, synth } = await runPipeline(q);

    sendSSE(res, { chunk:{ phase:'triage', items: triage.slice(0,8) }});
    sendSSE(res, { chunk:{ phase:'synthesis', text: synth.text, cites: synth.cites }});

    res.write('event: done\n');
    res.write('data: ok\n\n');
    res.end();
  }catch(e){
    sendSSE(res, { chunk:{ phase:'error', message: String(e) }});
    res.end();
  }
});

router.get('/research', async (req,res) => {
  const q = String(req.query.q || 'KI heute – was ist wirklich neu?');
  try{
    const out = await runPipeline(q);
    res.json({ ok:true, query:q, plan: out.plan, triage: out.triage, synthesis: out.synth });
  }catch(e){
    res.status(500).json({ ok:false, error: String(e) });
  }
});

router.post('/research', express.json({limit:'1mb'}), async (req,res)=>{
  const q = String(req.body?.q || 'KI heute – was ist wirklich neu?');
  try{
    const out = await runPipeline(q);
    res.json({ ok:true, query:q, plan: out.plan, triage: out.triage, synthesis: out.synth });
  }catch(e){
    res.status(500).json({ ok:false, error: String(e) });
  }
});
