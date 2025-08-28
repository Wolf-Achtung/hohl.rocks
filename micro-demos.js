/*! micro-demos.js — small WOW moments + WolfFX actions + PromptStudio */
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
    const arr = Array.from(buckets.values()).filter(o=>o.n>4).map(o=>({r:Math.round(o.r/o.n),g:Math.round(o.g/o.n),b:Math.round(o.b/o.n)}));
    arr.sort((a,b)=> (b.r+b.g+b.b) - (a.r+a.g+a.b));
    const chosen = [];
    for(const o of arr){
      const hex = rgbToHex(o.r,o.g,o.b);
      if (!chosen.some(h=>{
        const R=parseInt(h.slice(1,3),16), G=parseInt(h.slice(3,5),16), B=parseInt(h.slice(5,7),16);
        const d = Math.abs(R-o.r)+Math.abs(G-o.g)+Math.abs(B-o.b);
        return d < 80; // rough distinctness
      })){
        chosen.push(hex);
      }
      if (chosen.length>=count) break;
    }
    while(chosen.length<count) chosen.push('#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'));
    return chosen;
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
      const css = cols.map((c,i)=>`--wolf-col-${i+1}: ${c};`).join('\n');
      try{ await navigator.clipboard.writeText(css); btnCopy.textContent='Kopiert ✔'; setTimeout(()=>btnCopy.textContent='CSS‑Variablen kopieren', 1800);}catch(_){}
    });
    const btnSend = document.createElement('button'); btnSend.className='btn'; btnSend.textContent='An GPT: benennen & Einsatz';
    btnSend.addEventListener('click', ()=>{
      const prompt = `Benenne diese 5 Hex-Farben (${cols.join(', ')}) und schlage 3 UI‑Einsatzszenarien vor (Primary/Secondary/Accent/Surface/Text) mit 1 kurzer Begründung je Auswahl. Knapp, deutsch.`;
      try{ ChatDock.send(prompt); }catch(_){}
      SpotlightCard.hide();
    });
    res.actions.appendChild(btnCopy); res.actions.appendChild(btnSend);
  }

  // --- Micro demos exported
  window.MicroDemos = {
    palette: openPalette,
    haiku: () => ChatDock && ChatDock.send && ChatDock.send('Schreibe ein kurzes Haiku über nächtliche Highway‑Fahrt, Winterluft, Fernlicht, Weite. Ton: ruhig, präzise.'),
    fiveWord: () => ChatDock && ChatDock.send && ChatDock.send('Erzeuge eine spannende Mini‑Story mit genau fünf Wörtern. Danach ein kurzer Titel. Stil: smart, knapp, überraschend.')
  };

  // --- Prompt Studio (overlay)
  function promptStudio(){
    const ui = SpotlightCard.open({ title: 'Prompt‑Studio 🎛️' });
    const s = document.createElement('style');
    s.textContent = `
      .ps-grid{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr));}
      .ps-grid label{font:600 12px/1.2 ui-sans-serif;}
      .ps-grid textarea,.ps-grid select,.ps-grid input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#eaf2ff;border-radius:10px;padding:8px 10px;outline:none}
      .ps-row{grid-column:1 / -1}
      .ps-small{font-size:12px;opacity:.8}
      @media(max-width:520px){.ps-grid{grid-template-columns:1fr}}
    `;
    ui.body.appendChild(s);
    const grid = document.createElement('div'); grid.className='ps-grid';
    grid.innerHTML = `
      <div class="ps-row">
        <label>Thema/Kontext</label>
        <textarea rows="2" id="ps_ctx" placeholder="Worum geht’s konkret? Ziel, Publikum, Situation …"></textarea>
      </div>
      <div>
        <label>Format</label>
        <select id="ps_fmt">
          <option value="hooklines">Hooklines (Trailer)</option>
          <option value="liste">Liste mit Punkten</option>
          <option value="roadmap">Roadmap/Plan</option>
          <option value="summary">Executive Summary</option>
          <option value="haiku">Haiku</option>
          <option value="story5">Mini‑Story (5 Wörter)</option>
        </select>
      </div>
      <div>
        <label>Persona/Stimme</label>
        <select id="ps_voice">
          <option value="tuev">TÜV‑KI‑Manager (seriös, prägnant)</option>
          <option value="trailer">Trailer‑Stratege (knackig, bildhaft)</option>
          <option value="coach">Sparrings‑Coach (ermutigend, klar)</option>
          <option value="redteam">Red‑Team (Risiken/Trade‑offs)</option>
        </select>
      </div>
      <div>
        <label>Länge</label>
        <select id="ps_len">
          <option value="ultrakurz">ultrakurz</option>
          <option value="kurz" selected>kurz</option>
          <option value="mittel">mittel</option>
          <option value="lang">lang</option>
        </select>
      </div>
      <div class="ps-row">
        <label>Leitplanken/Constraints <span class="ps-small">(optional)</span></label>
        <input id="ps_limits" placeholder="No‑go’s, Stilvorgaben, rechtliche Hinweise …"/>
      </div>
    `;
    ui.body.appendChild(grid);

    const preview = document.createElement('div'); preview.className='ps-row ps-small'; preview.style.marginTop='4px';
    preview.textContent = 'Vorschau erscheint nach „Generieren“.';
    ui.body.appendChild(preview);

    const btnGen = document.createElement('button'); btnGen.className='btn'; btnGen.textContent='Prompt generieren';
    const btnSend = document.createElement('button'); btnSend.className='btn'; btnSend.textContent='An GPT senden';
    const btnCopy = document.createElement('button'); btnCopy.className='btn'; btnCopy.textContent='Kopieren';
    ui.actions.appendChild(btnGen); ui.actions.appendChild(btnSend); ui.actions.appendChild(btnCopy);

    let lastPrompt='';
    function build(){
      const ctx = (document.getElementById('ps_ctx').value||'').trim();
      const fmt = document.getElementById('ps_fmt').value;
      const voice = document.getElementById('ps_voice').value;
      const len = document.getElementById('ps_len').value;
      const limits = (document.getElementById('ps_limits').value||'').trim();

      const voiceMap = {
        tuev: 'als TÜV‑zertifizierter KI‑Manager, 30 Jahre Marketingpraxis',
        trailer: 'als Trailer‑Stratege mit dramaturgischem Gespür',
        coach: 'als pragmatischer Sparrings‑Coach',
        redteam: 'als Red‑Team‑Prüfer (Risiken/Trade‑offs)'
      };
      const lenMap = {
        ultrakurz: 'ultrakurz (max. 2 Sätze)',
        kurz: 'kurz (ca. 3‑5 Sätze)',
        mittel: 'mittel (max. 8 Stichpunkte)',
        lang: 'strukturiert, ggf. mit Unterpunkten'
      };
      const fmtMap = {
        hooklines: 'Erstelle 3 präzise Trailer‑Hooklines.',
        liste: 'Erstelle eine liste mit 5 prägnanten Punkten.',
        roadmap: 'Erstelle eine 3‑Phasen‑Roadmap mit Quick‑Wins.',
        summary: 'Erstelle eine Executive Summary mit 3 Kernaussagen.',
        haiku: 'Erstelle ein kurzes Haiku.',
        story5: 'Erstelle eine Mini‑Story mit genau fünf Wörtern und 1 Titel.'
      };
      let prompt = `${fmtMap[fmt]} Arbeite ${voiceMap[voice]}. Antworte auf Deutsch, ${lenMap[len]}.`;
      if (ctx) prompt += ` Kontext: ${ctx}.`;
      if (limits) prompt += ` Beachte: ${limits}.`;
      lastPrompt = prompt;
      preview.textContent = 'Vorschau: ' + prompt;
      return prompt;
    }

    btnGen.addEventListener('click', build);
    btnCopy.addEventListener('click', async ()=>{ const p=lastPrompt||build(); try{ await navigator.clipboard.writeText(p); btnCopy.textContent='Kopiert ✔'; setTimeout(()=>btnCopy.textContent='Kopieren',1400);}catch(_){}} );
    btnSend.addEventListener('click', ()=>{ const p = lastPrompt||build(); try{ ChatDock.send(p); }catch(_){ } SpotlightCard.hide(); });
  }

  // --- FX actions
  function freezeFrame(ms=2200){
    const v = document.getElementById('bg-video');
    if(v){ try{ v.pause(); }catch{} }
    const ov = document.createElement('div');
    ov.style.position='fixed'; ov.style.inset='0'; ov.style.zIndex='50';
    ov.style.background='rgba(0,0,0,.22)';
    ov.style.backdropFilter='blur(1.5px)';
    ov.style.transition='opacity .6s ease'; ov.style.opacity='0';
    document.body.appendChild(ov);
    requestAnimationFrame(()=> ov.style.opacity='1');
    setTimeout(()=>{
      ov.style.opacity='0';
      setTimeout(()=> ov.remove(), 600);
      if(v){ try{ v.play(); }catch{} }
    }, ms);
  }

  function bokehBurst(){
    const host = document.body;
    const n = 12 + Math.floor(Math.random()*8);
    for(let i=0;i<n;i++){
      const d = document.createElement('div');
      const size = 40 + Math.random()*120;
      d.style.position='fixed';
      d.style.left = (Math.random()*100)+'vw';
      d.style.top  = (Math.random()*100)+'vh';
      d.style.width=d.style.height=size+'px';
      d.style.borderRadius='50%';
      d.style.background='radial-gradient(circle at 60% 40%, rgba(255,255,255,.75), rgba(255,255,255,.0) 58%)';
      d.style.filter='blur(2px) saturate(140%)';
      d.style.pointerEvents='none';
      d.style.zIndex='45';
      d.style.opacity='0';
      d.style.transform='translate(-50%,-50%) scale(0.8)';
      host.appendChild(d);
      const life = 1200 + Math.random()*900;
      setTimeout(()=>{ d.style.transition='opacity .9s ease, transform '+(life/1000)+'s ease'; d.style.opacity='1'; d.style.transform='translate(-50%,-50%) scale(1.15)'; }, 10);
      setTimeout(()=>{ d.style.opacity='0'; }, life*0.6);
      setTimeout(()=> d.remove(), life+800);
    }
  }

  function neonRing(){
    const r = document.createElement('div');
    r.style.position='fixed'; r.style.left='50%'; r.style.top='50%'; r.style.transform='translate(-50%,-50%) scale(0.6)';
    r.style.width='46vmin'; r.style.height='46vmin'; r.style.borderRadius='50%';
    r.style.boxShadow='0 0 12px rgba(0,255,255,.5), inset 0 0 18px rgba(0,150,255,.6)';
    r.style.border='2px solid rgba(180,220,255,.6)'; r.style.filter='blur(0.3px)';
    r.style.zIndex='56'; r.style.opacity='0';
    document.body.appendChild(r);
    requestAnimationFrame(()=>{ r.style.transition='opacity .2s ease, transform 1.25s cubic-bezier(.2,.7,.05,1)'; r.style.opacity='1'; r.style.transform='translate(-50%,-50%) scale(1.1)'; });
    setTimeout(()=>{ r.style.opacity='0'; r.style.transform='translate(-50%,-50%) scale(0.88)'; }, 1100);
    setTimeout(()=> r.remove(), 1650);
  }

  function melodyCmd(arg){
    if(!window.WolfMelody) return;
    const a = String(arg||'').trim();
    if(!a) return;
    if(a.startsWith('start')){ const mood=(a.split(':')[1]||'hopkins'); try{ WolfMelody.setMood(mood); WolfMelody.start(mood);}catch{} return; }
    if(a==='stop'){ try{ WolfMelody.stop(); }catch{} return; }
    if(a.startsWith('tempo:')){ const pct=parseFloat(a.split(':')[1]||'0'); try{ WolfMelody.tempoDelta(pct); }catch{} return; }
    if(a.startsWith('mood:')){ const mood=a.split(':')[1]||'hopkins'; try{ WolfMelody.setMood(mood); }catch{} return; }
    if(a.startsWith('seed:')){ const seed=parseInt(a.split(':')[1]||'0',10)||0; try{ WolfMelody.setSeed(seed); }catch{} return; }
    if(a.startsWith('gpt:')){ const t=a.slice(4); try{ ChatDock.send(`Plane eine Ambient‑Melodie "${t}" (Skalen, BPM, Layer‑Levels) und gib JSON zurück. Kurz, deutsch.`); }catch{} return; }
  }

  function runAction(cmdRaw){
    const s = String(cmdRaw||'').trim();
    if(!s) return;
    const parts = s.split(';').map(x=>x.trim()).filter(Boolean);
    for(const p of parts){
      if(p.startsWith('!action:')){ const a=p.slice(8).replace(/^\s*/,''); // e.g. freeze / bokeh / ring / palette / melody=...
        if(a.startsWith('melody=')){ melodyCmd(a.slice(7)); }
        else if(a==='freeze'){ freezeFrame(); }
        else if(a==='bokeh'){ bokehBurst(); }
        else if(a==='ring'){ neonRing(); }
        else if(a==='palette'){ openPalette(); }
        else if(a==='promptstudio' || a==='prompt-studio' || a==='prompt'){ promptStudio(); }
      } else if(p.startsWith('gpt:')){
        const prompt = p.slice(4).trim();
        if(prompt) try{ ChatDock.send(prompt); }catch(_){}
      }
    }
  }

  window.WolfFX = { run: runAction };
  window.PromptStudio = { open: promptStudio };
})();
