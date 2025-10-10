// File: server/routes/content.js
import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

async function readJson(relPath) {
  const p = join(projectRoot, 'api', relPath);
  const data = await readFile(p, 'utf8');
  try { return JSON.parse(data); }
  catch { return JSON.parse('[]'); }
}

const router = Router();

router.get('/api/news', async (_req, res, next) => {
  try { res.json(await readJson('news.json')); }
  catch (e) { next(e); }
});
router.get('/api/daily', async (_req, res, next) => {
  try { res.json(await readJson('daily.json')); }
  catch (e) { next(e); }
});
router.get('/api/models', async (_req, res, next) => {
  try { res.json(await readJson('models.json')); }
  catch (e) { next(e); }
});
router.get('/api/rubrics', async (_req, res, next) => {
  try { res.json(await readJson('rubrics.json')); }
  catch (e) { next(e); }
});
router.get('/api/prompts/top', async (_req, res, next) => {
  try { res.json(await readJson('prompt.json')); }
  catch (e) { next(e); }
});

export default Router().use(router);
