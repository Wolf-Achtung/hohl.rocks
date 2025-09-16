// server/routes/llm-compare.js
import express from 'express';
export const router = express.Router();
async function call(model,prompt){
  if(!process.env.OPENAI_API_KEY){ return { name: model, text:'(OPENAI_API_KEY fehlt – Demo)' }; }
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
    body:JSON.stringify({model, messages:[{role:'system',content:'Deutsch, knapp, präzise, mit Beispielen.'},{role:'user',content:prompt}]})});
  const j=await r.json().catch(()=>({})); return { name:model, text:j.choices?.[0]?.message?.content || '' };
}
router.post('/llm/compare', express.json({limit:'2mb'}), async (req,res)=>{
  const {prompt='',modelA='gpt-4o-mini-2024-07-18',modelB='gpt-4o-2024-08-06'}=req.body||{};
  const [a,b]=await Promise.all([call(modelA,prompt),call(modelB,prompt)]); res.json({ok:true, modelA:a, modelB:b});
});