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

router.get('/api/news/live', async (req, res) => {
  const key = process.env.TAVILY_API_KEY || '';
  if (!key) return res.status(503).json({ ok: false, error: 'TAVILY_API_KEY fehlt' });
  const query = String(req.query.q || process.env.TAVILY_QUERY || 'AI OR "Artificial Intelligence" -job -hiring');
  const max = Number(req.query.max || process.env.TAVILY_MAX_RESULTS || 12);
  const time_range = String(req.query.time_range || process.env.TAVILY_TIME_RANGE || 'day');
  const search_depth = String(req.query.search_depth || process.env.TAVILY_SEARCH_DEPTH || 'basic');
  try{
    const body = { api_key: key, query, max_results: Math.min(Math.max(max, 1), 25), time_range, search_depth, include_answer: false, include_images: false, include_raw_content: false };
    const r = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return res.status(500).json({ ok: false, error: 'Tavily HTTP '+r.status, detail: (await r.text()).slice(0, 280) });
    const j = await r.json();
    const items = (j.results || []).map(it => ({ title: it.title || 'Untitled', url: it.url, snippet: it.content || '', score: it.score || 0 }));
    res.json({ ok: true, query, items });
  } catch (e) { res.status(500).json({ ok: false, error: e.message || String(e) }); }
});

export default router;
