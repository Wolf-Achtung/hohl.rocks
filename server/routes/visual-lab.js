// server/routes/visual-lab.js
import express from 'express';
export const router = express.Router();

function dataUrlToFile(b64, filename='image.png'){
  const m = /^data:(.*?);base64,(.*)$/.exec(b64||''); if(!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  return { buf, type: m[1]||'image/png', name: filename };
}

async function openaiImageEdit({imageB64, prompt, n=1, size='1024x1024'}){
  if(!process.env.OPENAI_API_KEY) return { images: [], note: '(OPENAI_API_KEY fehlt – Demo)' };
  const file = dataUrlToFile(imageB64);
  if(!file) return { images: [], note: 'Ungültiges Bild-Format' };
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('n', String(n));
  form.append('size', size);
  form.append('image', new Blob([file.buf], {type:file.type}), file.name);
  const r = await fetch('https://api.openai.com/v1/images/edits', { method:'POST', headers:{ 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
  const j = await r.json().catch(()=>({}));
  const images = (j.data||[]).map(x=>x.b64_json ? `data:image/png;base64,${x.b64_json}` : x.url).filter(Boolean);
  return { images, raw:j, note:'OpenAI Images (gpt-image-1)' };
}

async function replicateEdit({imageB64, prompt}){
  if(!process.env.REPLICATE_API_TOKEN) return { images: [], note: '(REPLICATE_API_TOKEN fehlt – Demo)' };
  // Simple img2img using Flux or SDXL image-to-image (pseudo; adjust input keys per model)
  const url='https://api.replicate.com/v1/predictions';
  const body={
    version: process.env.REPLICATE_MODEL_VERSION || 'black-forest-labs/flux-1.1-pro',
    input: { prompt, image: imageB64 }
  };
  const r = await fetch(url,{ method:'POST', headers:{'Content-Type':'application/json','Authorization':`Token ${process.env.REPLICATE_API_TOKEN}`}, body: JSON.stringify(body) });
  const j = await r.json().catch(()=>({}));
  // Polling is omitted for brevity; return placeholder
  return { images: [], note:'Replicate call init (polling nicht implementiert in diesem Skeleton)' };
}

async function providerEdit(opts){
  const p=(process.env.IMAGE_PROVIDER||'openai').toLowerCase();
  if(p==='replicate') return replicateEdit(opts);
  return openaiImageEdit(opts);
}

router.post('/image/face-age', async (req, res) => {
  try{
    const { imageBase64, years=20 } = req.body||{};
    const prompt = `Make the same person look approx. ${years} years older. Natural, realistic ageing (skin, hair), preserve identity.`;
    const out = await providerEdit({ imageB64:imageBase64, prompt, n:1 });
    return res.json({ ok:true, imageUrl: out.images?.[0]||null, note: out.note||'' });
  }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});

router.post('/image/variations', async (req, res) => {
  try{
    const { imageBase64 } = req.body||{};
    const styles = [
      'cinematic, teal-orange grade, shallow depth of field, crisp highlight rolloff',
      'analog film, Portra 400 look, soft grain, warm tones',
      'clean studio, soft light, neutral background, product aesthetic',
      'vibrant neon, high contrast, glossy reflections'
    ];
    const images = [];
    for(const s of styles){
      const r = await providerEdit({ imageB64:imageBase64, prompt:`Keep content; restyle as: ${s}.`, n:1 });
      if(r.images?.[0]) images.push(r.images[0]);
    }
    return res.json({ ok:true, images, note:'Varianten erzeugt' });
  }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});

router.post('/video/storyboard', async (req, res) => {
  const { topic='', shots=6 } = req.body||{};
  const frames = Array.from({length:shots}).map((_,i)=>`Shot ${i+1}: ${topic} — Kamera: langsam, Licht: golden hour`);
  return res.json({ ok:true, frames, note:'Text‑Storyboard (WebM-Export clientseitig)' });
});
