/* public/js/hero-shapes.js — Jellyfish Edition
 * - wenige gleichzeitige Bubbles (Desktop 6, Mobile 4)
 * - langsames Ein-/Ausblenden (3s / 3.6s)
 * - elegantes „Nachspawnen“ (alle 4–9s 1 Bubble, manchmal 2)
 * - sehr sanfte, quallenartige Bewegung (Lissajous + Atmung)
 * - Kollision-Vermeidung beim Spawn
 * - kompatibel mit __TICKER_ITEMS (label/hint/action)
 */
(function(){
  // ────────────────────────────────────────────────────────────────────────────
  // Konfiguration
  const CFG = {
    MAX: (innerWidth < 820) ? 4 : 6,        // Anzahl gleichzeitig sichtbarer Bubbles
    SPAWN_MIN: 4000,                        // min Wartezeit bis zur nächsten Bubble (ms)
    SPAWN_MAX: 9000,                        // max Wartezeit bis zur nächsten Bubble (ms)
    FADE_IN: 3000,                          // Einblendung (ms)
    FADE_OUT: 3600,                         // Ausblendung (ms)
    LIFE_MIN: 65000,                        // Lebensdauer (ms)
    LIFE_MAX: 98000,
    PAD: 60,                                // Abstand zum Rand
    SAFE: 36,                               // Kollision-Puffer zwischen Bubbles (px)
    SIZE: [0.26, 0.50],                     // min/max relativ zur kürzeren Screen-Kante
    DRIFT: {                                // sehr langsame Drifts
      ax: [22, 58],                         // Amplitude X
      ay: [20, 52],                         // Amplitude Y
      tx: [900, 1500],                      // Periodendauer X
      ty: [980, 1600],                      // Periodendauer Y
      speed: [0.0015, 0.0035],              // globale Tempovariation
      breatheAmp: [0.006, 0.016],           // Atmung (Scale)
      breatheT: [18, 28]                    // Atmungsperiode (s)
    }
  };

  // Farben & Utilities
  const NEON = ['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pick = () => NEON[(Math.random()*NEON.length)|0];
  const lerp = (a,b,t) => a + (b-a)*t;
  const rnd  = (min,max) => min + Math.random()*(max-min);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const BUBBLES = [];         // aktive Bubbles (für Kollisionsprüfung)
  let   running = false;
  let   spawnTimer = null;

  function holder(){
    let h = document.getElementById('shapes');
    if(!h){ h = document.createElement('div'); h.id='shapes'; document.body.appendChild(h); }
    return h;
  }

  // einfache Kollisionsprüfung (Kreis zu Kreis)
  function collides(cx,cy,r){
    for(const b of BUBBLES){
      const dx = cx - b.cx, dy = cy - b.cy;
      if (Math.hypot(dx,dy) < (r + b.r + CFG.SAFE)) return true;
    }
    return false;
  }

  // Organische Kontur
  function blobPath(cx,cy,r=150,points=16,variance=0.12){
    const TAU = Math.PI*2, step=TAU/points, pts=[];
    for(let i=0;i<points;i++){
      const ang=i*step, rad=r*(1-variance/2 + Math.random()*variance);
      pts.push({x:cx+Math.cos(ang)*rad, y:cy+Math.sin(ang)*rad});
    }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<pts.length;i++){
      const p0=pts[i], p1=pts[(i+1)%pts.length];
      const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2;
      d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`;
    }
    return d+' Z';
  }

  function spawnOne(h){
    if(!running) return;
    if(BUBBLES.length >= CFG.MAX) return;

    const W=innerWidth, H=innerHeight, B=Math.min(W,H);
    const size = B * rnd(CFG.SIZE[0], CFG.SIZE[1]);
    const r = size/2;
    // Position suchen (max 24 Versuche)
    let cx, cy, ok=false, tries=24;
    while(tries--){
      cx = rnd(CFG.PAD, W-CFG.PAD);
      cy = rnd(CFG.PAD+40, H-CFG.PAD-120);
      if(!collides(cx,cy,r)){ ok=true; break; }
    }
    if(!ok){ cx = rnd(CFG.PAD, W-CFG.PAD); cy = rnd(CFG.PAD+40, H-CFG.PAD-120); }

    // DOM
    const color=pick();
    const el  = document.createElement('div');
    el.className='shape';
    Object.assign(el.style,{
      position:'absolute',
      left:`${(cx-r)|0}px`,
      top:`${(cy-r)|0}px`,
      width:`${size}px`,
      height:`${size}px`,
      zIndex:String(500+((Math.random()*500)|0)),
      opacity:'0',                                      // wir blenden ein
      transition:`opacity ${CFG.FADE_IN}ms ease`,
      willChange:'transform,opacity'
    });

    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 400 400');
    svg.style.mixBlendMode='screen';
    const fill=document.createElementNS(ns,'path');
    const stroke=document.createElementNS(ns,'path');
    fill.setAttribute('fill',color);   fill.setAttribute('opacity','0.78');
    stroke.setAttribute('stroke',color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    const d=blobPath(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d);
    svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);

    // Label/Hints/Aktionen
    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const it=window.__TICKER_ITEMS[(window.__bubbleIndex++) % window.__TICKER_ITEMS.length];
      const wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;';
      const title=document.createElement('div'); title.textContent=it.label;
      Object.assign(title.style,{color:'#0a1118',fontWeight:'800',fontSize:'14px',background:'rgba(255,255,255,.35)',padding:'6px 10px',borderRadius:'10px',textShadow:'0 1px 2px rgba(255,255,255,.6)'});
      const hint=document.createElement('div'); hint.textContent=it.hint||'Klick – Ergebnis im Fenster';
      Object.assign(hint.style,{marginTop:'6px',fontSize:'11px',opacity:.9,background:'rgba(12,16,22,.35)',color:'#eaf2ff',padding:'4px 8px',borderRadius:'8px'});
      wrap.appendChild(title); wrap.appendChild(hint); el.appendChild(wrap);

      el.dataset.prompt=it.prompt||''; el.dataset.action=it.action||''; el.dataset.placeholder=it.placeholder||'';
      el.style.cursor='pointer';
      el.addEventListener('click',()=>{
        try{ window.Ambient && Ambient.ensureStart(); }catch(e){}
        // Fokus
        document.querySelectorAll('.shape').forEach(s=>{ if(s!==el) s.style.opacity='0.15'; });
        setTimeout(()=>{ document.querySelectorAll('.shape').forEach(s=>{ if(s!==el) s.style.opacity='0.28'; }); }, 1200);

        const act=el.dataset.action; const label=it.label; const p=el.dataset.prompt||'';
        if(act==='research' && window.startResearch){ const q=prompt('Thema für Live-Recherche?'); if(q) startResearch(q); return; }
        if(act==='cage-match' && window.openCageMatch){ return openCageMatch(); }
        if(act==='claude-input' && window.openInputBubble){ return openInputBubble(label, p, { placeholder: el.dataset.placeholder||'Text hier einfügen…' }); }
        if(act && window.VisualLab && typeof VisualLab.handle==='function'){ return VisualLab.handle(act); }
        if(window.openAnswerPopup) window.openAnswerPopup(p, false, label);
      });
    }

    // zur Seite hinzufügen & weich einblenden
    h.appendChild(el);
    requestAnimationFrame(()=>{ el.style.opacity='0.96'; });

    // Bewegungs-Parameter (sehr langsam + Atmung)
    const drift = {
      ax: rnd(CFG.DRIFT.ax[0], CFG.DRIFT.ax[1]),
      ay: rnd(CFG.DRIFT.ay[0], CFG.DRIFT.ay[1]),
      tx: rnd(CFG.DRIFT.tx[0], CFG.DRIFT.tx[1]),
      ty: rnd(CFG.DRIFT.ty[0], CFG.DRIFT.ty[1]),
      speed: rnd(CFG.DRIFT.speed[0], CFG.DRIFT.speed[1]),
      breatheAmp: rnd(CFG.DRIFT.breatheAmp[0], CFG.DRIFT.breatheAmp[1]),
      breatheT: rnd(CFG.DRIFT.breatheT[0], CFG.DRIFT.breatheT[1]),
      phase: Math.random()*Math.PI*2
    };
    const t0 = performance.now()*drift.speed;

    // Lebenszyklus registrieren
    const entry = { el, cx, cy, r };
    BUBBLES.push(entry);

    function animate(){
      if(!running) return;
      const t = (performance.now()*drift.speed) - t0;
      const dx = Math.sin(t/drift.tx)*drift.ax;
      const dy = Math.cos(t/drift.ty)*drift.ay;
      const breath = 1 + Math.sin(t/drift.breatheT + drift.phase) * drift.breatheAmp;
      el.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${breath.toFixed(3)})`;
      entry.raf = requestAnimationFrame(animate);
    }
    animate();

    // Lebensdauer & Ausblenden
    const life = rnd(CFG.LIFE_MIN, CFG.LIFE_MAX);
    setTimeout(()=>{
      // ausblenden
      el.style.transition = `opacity ${CFG.FADE_OUT}ms ease`;
      el.style.opacity = '0';
      setTimeout(()=>{
        cancelAnimationFrame(entry.raf);
        const i = BUBBLES.indexOf(entry);
        if(i>=0) BUBBLES.splice(i,1);
        el.remove();
      }, CFG.FADE_OUT+40);
    }, life);
  }

  // Spawner: alle 4–9 s eine neue Bubble (mit 25 % Chance auf 2)
  function schedule(){
    if(!running) return;
    const h = holder();
    const toSpawn = (BUBBLES.length < CFG.MAX) ? 1 + (Math.random()<0.25 ? 1 : 0) : 0;
    for(let i=0;i<toSpawn;i++){
      if(BUBBLES.length < CFG.MAX) spawnOne(h);
    }
    const wait = rnd(CFG.SPAWN_MIN, CFG.SPAWN_MAX);
    spawnTimer = setTimeout(schedule, wait);
  }

  // Start: mit 1–2 initialen Bubbles loslegen
  function init(){
    if(running) return;
    running = true;
    const h = holder();
    const initial = (innerWidth < 820) ? 1 : 2;
    for(let i=0;i<initial;i++) spawnOne(h);
    schedule();
    // Pre-Msg nach kurzer Zeit ausblenden
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 9000);
  }

  // Stop (nicht genutzt, aber falls du pausieren willst)
  function stop(){
    running = false;
    clearTimeout(spawnTimer);
    BUBBLES.slice().forEach(b=>{
      try{ cancelAnimationFrame(b.raf); }catch(e){}
      b.el.remove();
    });
    BUBBLES.length = 0;
  }

  if(document.readyState!=='loading') init();
  else window.addEventListener('DOMContentLoaded', init);

  // optional global machen
  window.Bubbles = { init, stop, state:()=>({count:BUBBLES.length}) };
})();
