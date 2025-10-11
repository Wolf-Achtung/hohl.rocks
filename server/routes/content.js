
import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function readJson(relPath) {
  const p = join(projectRoot, 'api', relPath);
  const data = await readFile(p, 'utf8');
  try { return JSON.parse(data); }
  catch { return JSON.parse('[]'); }
}

const router = Router();

router.get('/api/news', async (_req, res, next) => { try { res.json(await readJson('news.json')); } catch (e) { next(e); } });
router.get('/api/daily', async (_req, res, next) => { try { res.json(await readJson('daily.json')); } catch (e) { next(e); } });
router.get('/api/models', async (_req, res, next) => { try { res.json(await readJson('models.json')); } catch (e) { next(e); } });
router.get('/api/rubrics', async (_req, res, next) => { try { res.json(await readJson('rubrics.json')); } catch (e) { next(e); } });
router.get('/api/prompts/top', async (_req, res, next) => { try { res.json(await readJson('prompt.json')); } catch (e) { next(e); } });

// Tavily daily news (AI general)
router.get('/api/news/live', async (req, res) => {
  const key = process.env.TAVILY_API_KEY || '';
  if (!key) return res.status(503).json({ ok: false, error: 'TAVILY_API_KEY fehlt' });
  const query = String(req.query.q || process.env.TAVILY_QUERY || '("Künstliche Intelligenz" OR AI OR LLM OR "machine learning" OR "gen AI" OR "Generative AI" OR OpenAI OR Anthropic OR Google OR Meta OR "Stability AI" OR HuggingFace) -job -jobs -hiring -recruiter -remote');
  const max = Number(req.query.max || process.env.TAVILY_MAX_RESULTS || 18);
  const time_range = String(req.query.time_range || process.env.TAVILY_TIME_RANGE || 'day');
  const search_depth = String(req.query.search_depth || process.env.TAVILY_SEARCH_DEPTH || 'basic');
  try{
    const body = { api_key: key, query, max_results: Math.min(Math.max(max, 1), 30), time_range, search_depth, include_answer: false, include_images: false, include_raw_content: false };
    const r = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return res.status(500).json({ ok: false, error: 'Tavily HTTP '+r.status, detail: (await r.text()).slice(0, 280) });
    const j = await r.json();
    const items = (j.results || []).map(it => ({ title: it.title || 'Untitled', url: it.url, snippet: it.content || '', score: it.score || 0, published_time: it.published_time || it.published || null }));
    res.json({ ok: true, query, items });
  } catch (e) { res.status(500).json({ ok: false, error: e.message || String(e) }); }
});

// Perplexity weekly / daily AI & security digest
const cache = new Map(); // key -> {ts,data}
function cacheGet(key, maxAgeMs){ const hit = cache.get(key); if (hit && (Date.now()-hit.ts) < maxAgeMs) return hit.data; return null; }
function cacheSet(key, data){ cache.set(key, { ts: Date.now(), data }); }

router.get('/api/ai-weekly', async (req, res) => {
  const key = process.env.PERPLEXITY_API_KEY || '';
  if (!key) return res.status(503).json({ ok:false, error:'PERPLEXITY_API_KEY fehlt' });
  const topic = String(req.query.topic || 'ai');
  const time_range = String(req.query.time_range || 'week'); // 'day' or 'week'
  const model = String(process.env.PERPLEXITY_MODEL || 'sonar-medium-online');
  const cacheKey = `${topic}:${time_range}:${model}`;
  const cached = cacheGet(cacheKey, time_range==='day' ? 15*60*1000 : 6*60*60*1000); // 15min / 6h
  if (cached) return res.json(cached);

  const sys = `You are an impartial AI news analyst. Return structured JSON only.`;
  const user = `Collect the most relevant ${time_range==='day'?'daily':'weekly'} ${topic==='security'?'AI security and policy advisories, safety incidents, critical patches, misuse warnings, model risks':'AI/LLM industry'} items from trusted sources.
Return 8-16 items. Each item as: title, url, summary (1-2 sentences), severity (low/med/high for security; else empty), tag (e.g., model, product, research, policy, security), published_time (ISO if available).`;

  const schema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            summary: { type: "string" },
            severity: { type: "string" },
            tag: { type: "string" },
            published_time: { type: "string" }
          },
          required: ["title","url","summary"]
        }
      }
    },
    required: ["items"]
  };

  try{
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role:'system', content: sys },
          { role:'user', content: user }
        ],
        max_tokens: 1200,
        temperature: 0.2,
        response_format: { type:'json_schema', json_schema: { schema } }
      })
    });
    if (!r.ok) return res.status(500).json({ ok:false, error:'Perplexity HTTP '+r.status, detail: (await r.text()).slice(0,280) });
    const j = await r.json();
    let parsed = null;
    try{ parsed = JSON.parse(j.choices?.[0]?.message?.content || '{}'); }catch{ parsed = {}; }
    const items = (parsed.items || []).map(it => ({
      title: it.title || 'Untitled',
      url: it.url || '#',
      snippet: it.summary || '',
      severity: it.severity || '',
      tag: it.tag || '',
      published_time: it.published_time || null
    }));
    const out = { ok:true, topic, time_range, items };
    cacheSet(cacheKey, out);
    res.json(out);
  } catch(e){
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
});

export default router;
