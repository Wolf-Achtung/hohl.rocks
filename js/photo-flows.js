/*! photo-flows.js — extra actions after selecting a photo */
(function(){
  'use strict';
  const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.capture='environment'; input.style.display='none';
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(input));

  function openOverlay(dataUrl){
    const ui = SpotlightCard.open({ title: 'Foto‑Aktion' });
    const img = document.createElement('img'); img.src=dataUrl; img.alt='Upload'; img.style.maxWidth='100%'; img.style.borderRadius='12px'; img.style.display='block';
    ui.body.appendChild(img);

    const b1 = document.createElement('button'); b1.className='btn'; b1.textContent='Avatar‑Briefing (GPT)';
    b1.addEventListener('click', ()=>{
      const p = "Erstelle ein neutrales Avatar‑Briefing in 6 Stichpunkten zu diesem Portrait (ohne Bewertungen), plus 3 Ideen für eine professionelle Wirkung (z. B. Licht, Kleidung, Hintergrund).";
      try{ ChatDock.sendAttachment({ dataUrl, prompt: p }); }catch(_){}
      window.AnalyticsLite && AnalyticsLite.emit && AnalyticsLite.emit('photo_flow', { kind:'avatar' });
      SpotlightCard.hide();
    });

    const b2 = document.createElement('button'); b2.className='btn'; b2.textContent='Brand‑Farben (Palette)';
    b2.addEventListener('click', ()=>{
      const cv=document.createElement('canvas'); const ctx=cv.getContext('2d',{willReadFrequently:true});
      img.decode().then(()=>{
        const w=Math.min(640,img.naturalWidth||640), h=Math.round(w*(img.naturalHeight/img.naturalWidth));
        cv.width=w; cv.height=h; ctx.drawImage(img,0,0,w,h);
        const data = ctx.getImageData(0,0,w,h).data;
        const buckets=new Map();
        for(let i=0;i<data.length;i+=4){ const r=data[i],g=data[i+1],b=data[i+2]; const key=(r>>4)+','+(g>>4)+','+(b>>4);
          const cur=buckets.get(key)||{r:0,g:0,b:0,n:0}; cur.r+=r;cur.g+=g;cur.b+=b;cur.n++; buckets.set(key,cur); }
        const arr=[...buckets.values()].map(o=>({hex:'#'+[o.r/o.n,o.g/o.n,o.b/o.n].map(x=>('0'+Math.round(x).toString(16)).slice(-2)).join(''), n:o.n})).sort((a,b)=>b.n-a.n);
        const out=[]; outer: for(const c of arr){
          for(const d of out){ const dr=parseInt(c.hex.slice(1,3),16)-parseInt(d.hex.slice(1,3),16);
            const dg=parseInt(c.hex.slice(3,5),16)-parseInt(d.hex.slice(3,5),16);
            const db=parseInt(c.hex.slice(5,7),16)-parseInt(d.hex.slice(5,7),16);
            if(Math.sqrt(dr*dr+dg*dg+db*db)<28) continue outer; }
          out.push(c); if(out.length>=5) break;
        }
        const cols = out.map(o=>o.hex);
        const spot = SpotlightCard.open({ title: 'Brand‑Palette (Foto)' });
        const grid=document.createElement('div'); grid.className='swatches';
        cols.forEach(hex=>{ const sw=document.createElement('div'); sw.className='swatch'; sw.style.background=hex; sw.innerHTML=`<small>${hex}</small>`; grid.appendChild(sw); });
        spot.body.appendChild(grid);
        const btn = document.createElement('button'); btn.className='btn'; btn.textContent='An GPT: benennen & Einsatz';
        btn.addEventListener('click', ()=>{
          const prompt = `Benenne diese 5 Hex-Farben (${cols.join(', ')}) prägnant und schlage je 1 UI‑Einsatz (Text, Fläche, Akzent) vor – mit 1 Kontrast-Hinweis.`;
          try{ ChatDock.send(prompt);}catch(_){}
          window.AnalyticsLite && AnalyticsLite.emit && AnalyticsLite.emit('photo_flow', { kind:'brand_palette' });
          SpotlightCard.hide();
        });
        spot.actions.appendChild(btn);
      });
    });

    ui.actions.appendChild(b1); ui.actions.appendChild(b2);
  }

  function chooseFile(){ input.value=''; input.click(); }
  input.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0]; if(!file) return;
    const rd = new FileReader(); rd.onload = ()=> openOverlay(String(rd.result||'')); rd.readAsDataURL(file);
  });

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('#photo-btn,[data-photo]');
    if(btn){ e.preventDefault(); chooseFile(); }
  }, {passive:false});

  window.PhotoFlows = { pick: chooseFile };
})();
