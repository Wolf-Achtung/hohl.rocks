// server.mjs — Railway-ready Express proxy for hohl.rocks
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL_DEFAULT = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const RAW_ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://hohl.rocks,https://www.hohl.rocks,http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

if (!OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY is not set. /chat will return 500.');
}

app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // backend API only; CSP handled on frontend
}));
app.use(compression());
app.use(express.json({ limit: '16kb' }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman
    if (RAW_ALLOWED.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  },
  credentials: false
}));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/chat', limiter);

app.get('/health', (req, res) => {
  res.json({ ok: true, model: MODEL_DEFAULT });
});

app.post('/chat', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Server not configured' });
    const q = (req.body?.q ?? '').toString().slice(0, 4000).trim();
    const model = (req.body?.model || MODEL_DEFAULT).toString();
    const temperature = Math.min(Math.max(Number(req.body?.temperature ?? 0.3), 0), 1);

    if (!q) return res.status(400).json({ error: 'No query' });

    const payload = {
      model,
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Wolf Hohl (TÜV‑zertifizierter KI‑Manager). Antworte präzise, freundlich, mit Sinn für Stil. Wenn rechtliche/compliance-relevante Fragen gestellt werden, weise auf EU AI Act / DSGVO hin.' },
        { role: 'user', content: q }
      ],
      temperature
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text().catch(()=>'');
      return res.status(502).json({ error: 'Upstream error', details: text.slice(0, 300) });
    }

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content ?? '';

    res.json({
      answer,
      model,
      usage: data?.usage ?? null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`[hohlrocks-chat] listening on :${PORT}`);
  console.log('Allowed origins:', RAW_ALLOWED);
});
