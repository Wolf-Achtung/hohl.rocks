// server/routes/llm-compare.js
import express from 'express';
export const router = express.Router();

const MAP = {
  'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
  'gpt-4o-mini-2024-07-18': 'gpt-4o-mini-2024-07-18',
  'gpt-4o': 'gpt-4o-2024-08-06',
  'gpt-4o-2024-08-06': 'gpt-4o-2024-08-06'
};

async function callOpenAI(model, prompt){
  const m = MAP[model] || model;
  if(!process.env.OPENAI_API_KEY){
    return { name: m, text: '(OPENAI_API_KEY fehlt – Demo‑Text)' };
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
    body: JSON.stringify({
      model: m,
      messages:[
        {role:'system',content:'Antworte präzise, knapp, mit Beispielen. Deutsch.'},
        {role:'user',content: prompt }
      ]
    })
  });
  const j = await r.json().catch(()=>({}));
  const text = j.choices?.[0]?.message?.content || JSON.stringify(j).slice(0,1200);
  return { name: m, text };
}

router.post('/llm/compare', express.json({limit:'2mb'}), async (req, res) => {
  const { prompt='', modelA='gpt-4o-mini', modelB='gpt-4o' } = req.body||{};
  const [a,b] = await Promise.all([ callOpenAI(modelA, prompt), callOpenAI(modelB, prompt) ]);
  res.json({ ok:true, modelA:a, modelB:b });
});
