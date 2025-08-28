/*! micro-demos.js — small WOW moments (palette, haiku, 5-word story) */
(function(){
  'use strict';
  function rgbToHex(r,g,b){ const to = v=>('0'+v.toString(16)).slice(-2); return '#'+to(r)+to(g)+to(b); }

  function extractPaletteFromVideo(videoEl, count=5){
    const v = videoEl || document.getElementById('bg-video');
    if(!v || v.readyState < 2) return null;
    const w = Math.max(160, Math.floor(v.videoWidth/4)||320);
    const h = Math.max(90, Math.floor(v.videoHeight/4)||180);
    const cv = document.createElement('canvas'); cv.width=w; cv.height=h;
    const ctx = cv.getContext('2d',{willReadFrequently:true}); ctx.drawImage(v, 0, 0, w, h);
    const data = ctx.getImageData(0,0,w,h).data;

    const buckets = new Map();
    for(let i=0;i<data.length;i+=4){
      const r = data[i], g=data[i+1], b=data[i+2];
      const key = (r>>4)+','+(g>>4)+','+(b>>4);
      const cur = buckets.get(key) || {r:0,g:0,b:0,n:0};
      cur.r+=r;cur.g+=g;cur.b+=b;cur.n++;buckets.set(key, cur);
    }
    const arr = Array.from(buckets.values()).map(o=>({hex: rgbToHex(Math.round(o.r/o.n), Math.round(o.g/o.n), Math.round(o.b/o.n)), n:o.n}));
    arr.sort((a,b)=>b.n-a.n);
    const out=[]; outer: for(const c of arr){
      for(const d of out){ const dr=parseInt(c.hex.slice(1,3),16)-parseInt(d.hex.slice(1,3),16);
        const dg=parseInt(c.hex.slice(3,5),16)-parseInt(d.hex.slice(3,5),16);
        const db=parseInt(c.hex.slice(5,7),16)-parseInt(d.hex.slice(5,7),16);
        if(Math.sqrt(dr*dr+dg*dg+db*db)<28){ continue outer; } }
      out.push(c); if(out.length>=count) break;
    }
    return out.map(o=>o.hex);
  }

  function openPalette(){
    const res = SpotlightCard.open({ title: 'Mood‑Palette aus dem Video' });
    const video = document.getElementById('bg-video');
    const cols = extractPaletteFromVideo(video, 5) || ['#5b6e80','#8fa3b8','#e3e7ee','#2b3a4a','#c7d2e4'];
    const grid = document.createElement('div'); grid.className='swatches';
    cols.forEach(hex=>{
      const sw = document.createElement('div'); sw.className='swatch'; sw.style.background=hex;
      sw.innerHTML = `<small>${hex}</small>`; grid.appendChild(sw);
    });
    res.body.appendChild(grid);
    const btnCopy = document.createElement('button'); btnCopy.className='btn'; btnCopy.textContent='CSS‑Variablen kopieren';
    btnCopy.addEventListener('click', async ()=>{
      const css = cols.map((c,i)=>`--wolf-col-${i+1}: ${c};`).join('\\n');
      try{ await navigator.clipboard.writeText(css); btnCopy.textContent='Kopiert ✓'; setTimeout(()=>btnCopy.textContent='CSS‑Variablen kopieren', 1800);}catch(_){}
    });
    const btnSend = document.createElement('button'); btnSend.className='btn'; btnSend.textContent='An GPT: benennen & Einsatz';
    btnSend.addEventListener('click', ()=>{
      const prompt = `Benenne diese 5 Hex-Farben (${cols.join(', ')}) prägnant (z. B. „Nachtblau“), nenne pro Farbe 1 UI‑Einsatz (Text, Fläche oder Akzent) und 1 Kontrast-Hinweis. Kurz und praktikabel.`;
      try{ ChatDock.send(prompt); }catch(_){}
      SpotlightCard.hide();
    });
    res.actions.appendChild(btnCopy); res.actions.appendChild(btnSend);
  }

  window.MicroDemos = {
    palette: openPalette,
    haiku: () => ChatDock && ChatDock.send && ChatDock.send("Schreibe ein kurzes Haiku über eine nächtliche Highway‑Fahrt, Winterluft, Fernlicht, Weite. Ton: ruhig, präzise."),
    fiveWord: () => ChatDock && ChatDock.send && ChatDock.send("Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach ein kurzer Titel. Ton: smart, knapp, überraschend.")
  };
})();
