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

  // --- WolfFX: parse and run action commands (freeze, bokeh, ring, palette, melody=...) ---
  (function(){
    function run(cmd){
      if(!cmd) return;
      try{
        // normalize
        cmd = String(cmd).trim();
        // melody commands
        if(cmd.startsWith('melody=')){
          const arg = cmd.split('=')[1] || '';
          // "start:hopkins", "stop", "tempo:+8", "mood:dawn", "seed:7", "gpt:theme"
          if(arg.startsWith('start')){ const mood = (arg.split(':')[1]||'hopkins'); try{ window.WolfMelody?.start(mood); }catch(_){ } }
          else if(arg==='stop'){ try{ window.WolfMelody?.stop(); }catch(_){ } }
          else if(arg.startsWith('tempo:')){ const d = parseFloat(arg.split(':')[1]||'0'); try{ window.WolfMelody?.tempoDelta(d); }catch(_){ } }
          else if(arg.startsWith('mood:')){ const m = (arg.split(':')[1]||'hopkins'); try{ window.WolfMelody?.setMood(m); if(window.WolfMelody && !window.WolfMelody.running) window.WolfMelody.start(m); }catch(_){ } }
          else if(arg.startsWith('seed:')){ const s = parseInt(arg.split(':')[1]||'0',10); try{ window.WolfMelody?.setSeed(s); }catch(_){ } }
          else if(arg.startsWith('gpt:')){ const theme = arg.slice(4).trim(); try{ window.WolfMelody?.planFromGPT(theme); }catch(_){ } }
          return;
        }
        // palette
        if(cmd==='palette'){ try{ window.MicroDemos?.palette(); }catch(_){ } return; }
        // freeze
        if(cmd==='freeze'){ try{ freezeFrame(); }catch(_){ } return; }
        // ring
        if(cmd==='ring'){ try{ neonRing(); }catch(_){ } return; }
        // bokeh
        if(cmd==='bokeh'){ try{ bokehBurst(); }catch(_){ } return; }
      }catch(e){ console.warn('WolfFX error', e); }
    }

    function el(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }

    function freezeFrame(){
      const v = document.getElementById('bg-video'); if(!v) return;
      const overlay = el('div', 'fx-freeze');
      overlay.innerHTML = '';
      Object.assign(overlay.style, {
        position:'fixed', inset:'0', zIndex:38, pointerEvents:'none',
        background:'radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,.06), rgba(10,14,20,.10))',
        backdropFilter:'blur(1.6px) saturate(110%)',
        transition:'opacity .6s ease', opacity:'0'
      });
      document.body.appendChild(overlay);
      setTimeout(()=> overlay.style.opacity = '1', 16);
      try{ v.pause(); }catch(_){}
      setTimeout(()=>{ overlay.style.opacity='0'; setTimeout(()=>overlay.remove(), 620); try{ v.play(); }catch(_){} }, 3200);
    }

    function neonRing(){
      const holder = document.getElementById('shape-layer') || document.body;
      const r = el('div', 'fx-ring');
      Object.assign(r.style, {
        position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
        width:'22vmin', height:'22vmin', borderRadius:'50%', zIndex:44, pointerEvents:'none',
        boxShadow:'0 0 32px rgba(0,170,255,.75), inset 0 0 24px rgba(0,255,200,.65)',
        border:'2px solid rgba(0,255,240,.8)', opacity:'0.9'
      });
      holder.appendChild(r);
      r.animate([
        { transform:'translate(-50%,-50%) scale(0.6)', opacity:0.0 },
        { transform:'translate(-50%,-50%) scale(1.2)', opacity:1.0, offset:0.5 },
        { transform:'translate(-50%,-50%) scale(1.8)', opacity:0.0 }
      ], { duration: 1800, easing:'cubic-bezier(.22,.61,.36,1)' });
      setTimeout(()=> r.remove(), 1820);
    }

    function bokehBurst(){
      const holder = document.getElementById('shape-layer') || document.body;
      for(let i=0;i<6;i++){
        const d = el('div','fx-bokeh');
        const x = 20 + Math.random()*60;
        const y = 18 + Math.random()*64;
        const s = 8 + Math.random()*22;
        Object.assign(d.style, {
          position:'fixed', left:x+'vw', top:y+'vh', width:s+'vmin', height:s+'vmin',
          borderRadius:'50%', filter:'blur(6px)', background:'radial-gradient(circle at 30% 30%, rgba(0,255,200,.45), rgba(0,128,255,.15) 60%, rgba(0,0,0,0) 70%)',
          zIndex:37, opacity:'0.0', pointerEvents:'none'
        });
        holder.appendChild(d);
        d.animate([
          { transform:'translateZ(0) scale(.6)', opacity:0.0 },
          { transform:'translateZ(0) scale(1.2)', opacity:0.85, offset:0.3 },
          { transform:'translateZ(0) scale(1.9)', opacity:0.0 }
        ], { duration: 2400 + Math.random()*800, easing:'cubic-bezier(.2,.6,.2,1)' });
        setTimeout(()=> d.remove(), 3400);
      }
    }

    window.WolfFX = { run };
  })();
