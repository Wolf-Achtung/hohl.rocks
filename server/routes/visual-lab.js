// server/routes/visual-lab.js
import express from 'express';
export const router = express.Router();
function dataUrlToFile(b64){ const m=/^data:(.*?);base64,(.*)$/.exec(b64||''); if(!m) return null; return { type:m[1], buf:Buffer.from(m[2],'base64') }; }
async function openaiEdit(imageB64,prompt){ if(!process.env.OPENAI_API_KEY) return { images:[] };
  const f=dataUrlToFile(imageB64); if(!f) return { images:[] }; const form=new FormData(); form.append('model','gpt-image-1'); form.append('prompt',prompt); form.append('n','1'); form.append('image', new Blob([f.buf],{type:f.type}), 'image.png');
  const r=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:form}); const j=await r.json().catch(()=>({})); const out=(j.data||[]).map(x=>x.b64_json?`data:image/png;base64,${x.b64_json}`:x.url); return { images:out }; }
router.post('/image/face-age', async (req,res)=>{ const {imageBase64,years=20}=req.body||{}; const p=`Make the person approx. ${years} years older, realistic.`; const out=await openaiEdit(imageBase64,p); res.json({ok:true,imageUrl:out.images?.[0]||null}); });
router.post('/image/variations', async (req,res)=>{ const {imageBase64}=req.body||{}; const styles=['cinematic teal-orange','analog film warm','clean studio','vibrant neon']; const imgs=[]; for(const s of styles){ const r=await openaiEdit(imageBase64,`Keep content; restyle as: ${s}.`); if(r.images?.[0]) imgs.push(r.images[0]); } res.json({ok:true,images:imgs}); });
router.post('/video/storyboard', async (req,res)=>{ const {topic='',shots=6}=req.body||{}; const frames=Array.from({length:shots}).map((_,i)=>`Shot ${i+1}: ${topic} — Kamera: langsam, Licht: golden hour`); res.json({ok:true,frames}); });
