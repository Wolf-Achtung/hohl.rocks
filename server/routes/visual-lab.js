// server/routes/visual-lab.js
import express from 'express';
import fetch from 'node-fetch';

export const router = express.Router();

function dataUrlToFile(b64, filename='image.png'){
  const m = /^data:(.*?);base64,(.*)$/.exec(b64||'');
  if(!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  return { buf, type: m[1]||'image/png', name: filename };
}

async function openaiImageEdit({imageB64, prompt, n=1, size='1024x1024'}){
  if(!process.env.OPENAI_API_KEY) return { images: [], note: '(OPENAI_API_KEY fehlt – Demo)' };
  const file = dataUrlToFile(imageB64);
  if(!file) return { images: [], note: 'Ungültiges Bild-Format' };

  // Use multipart/form-data to call OpenAI Images Edits (gpt-image-1)
  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('n', String(n));
  form.append('size', size);
  form.append('image', new Blob([file.buf], {type:file.type}), file.name);

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form
  });
  const j = await r.json().catch(()=>({}));
  const images = (j.data||[]).map(x=>x.b64_json ? `data:image/png;base64,${x.b64_json}` : x.url).filter(Boolean);
  return { images, raw:j };
}

router.post('/image/face-age', async (req, res) => {
  try{
    const { imageBase64, years=20 } = req.body||{};
    const prompt = `Make the same person look approximately ${years} years older. Natural, realistic ageing (skin, hair), preserve identity. Studio lighting, photographic fidelity.`;
    const out = await openaiImageEdit({ imageB64:imageBase64, prompt, n:1 });
    return res.json({ ok:true, imageUrl: out.images?.[0]||null, note:'OpenAI Images edit (gpt-image-1)' });
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
      const r = await openaiImageEdit({ imageB64:imageBase64, prompt:`Keep content; restyle as: ${s}.` , n:1 });
      if(r.images?.[0]) images.push(r.images[0]);
    }
    return res.json({ ok:true, images, note:'OpenAI Images edit (4 Stil‑Varianten)' });
  }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});

router.post('/video/storyboard', async (req, res) => {
  const { topic='', shots=6 } = req.body||{};
  const frames = Array.from({length:shots}).map((_,i)=>`Shot ${i+1}: ${topic} — Kamera: langsam, Licht: golden hour`);
  return res.json({ ok:true, frames, note:'Text‑Storyboard (optional Images später)' });
});
