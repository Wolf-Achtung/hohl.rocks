/*
 * hero-shapes.js — "Grow & Dissolve" (no rotation, no drift)
 *  - Keine Drehbewegung, kein Positions-Drift, keine Form-Morphs (ruhiges Bild)
 *  - Lebenszyklus: sanft einblenden → langsam anwachsen → optional leicht pulsieren → langsam auflösen
 *  - Pro Bubble individueller Tempo-Faktor (0.60–0.95), damit nicht alles gleichzeitig passiert
 *  - Tiefe bleibt via translateZ/Blur/Opacity; Parallax 0 (heute bewusst ohne Bewegungen)
 */
(function(){
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || location.pathname==='/';
  const targets = ['/ueber-mich.html','/projekte.html','/kontakt.html'];

  const TAU = Math.PI*2;
  const lerp = (a,b,t)=> a+(b-a)*t;
  const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
  const smoothstep = (a,b,x)=>{
    const t = clamp((x-a)/(b-a), 0, 1);
    return t*t*(3 - 2*t);
  };

  // Farbmischung: cool tones dominant, Neon selten als Akzent
  const BASE = ['#3AA1FF','#7C93FF','#7CF4FF','#6EC1FF','#9B8CFF'];
  const NEON = ['#00F5D4','#7CF4FF'];
  function pickColor(r){ return (r()<0.85) ? BASE[Math.floor(r()*BASE.length)] : NEON[Math.floor(r()*NEON.length)]; }

  function rand(seed){ let x = seed || Math.floor(Math.random()*0xffffffff); return ()=>(x^=x<<13,x^=x>>17,x^=x<<5,(x>>>0)/4294967296); }

  // Einmalige, weiche Blob-Form (Quadratic-Kurven)
  function blobPath(rng, cx, cy, radius=150, points=12, variance=0.18){
    const step=(TAU)/points, pts=[];
    for(let i=0;i<points;i++){
      const ang=i*step, rad=radius*(1-variance/2 + rng()*variance);
      pts.push({x:cx+Math.cos(ang)*rad, y:cy+Math.sin(ang)*rad});
    }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<pts.length;i++){
      const p0=pts[i], p1=pts[(i+1)%pts.length];
      const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2;
      d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`;
    }
    return d+" Z";
  }

  function ensureHolder(){
    let holder = document.getElementById('shapes');
    if(!holder){
      holder = document.createElement('div');
      holder.id = 'shapes';
      holder.style.perspective = '900px';
      document.body.appendChild(holder);
    }
    return holder;
  }

  function spawn(holder){
    const W=innerWidth, H=innerHeight, base=Math.min(W,H);
    const seed=(Math.random()*0xffffffff)>>>0, r=rand(seed);
    const color=pickColor(r), z=r(); // 0 = vorn, 1 = hinten
    const sizeBase = lerp(0.20, 0.24, r()); // enges Band → ruhiger
    const sizeDepth = lerp(0.74, 1.06, 1 - z);
    const sizePx = base * sizeBase * sizeDepth;
    const x = r()*(W-sizePx), y = r()*(H-sizePx);
    const life = lerp(25000, 45000, r()); // 25–45 s

    // Individueller, langsamer Tempo‑Faktor
    const TEMPO = lerp(0.60, 0.95, r());

    const el = document.createElement('div');
    el.className = 'shape';
    el.style.color = color;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    el.style.width = `${sizePx}px`;
    el.style.height= `${sizePx}px`;
    el.style.zIndex = String(1000 - Math.floor(z*1000));
    el.style.transition = 'opacity 2.8s ease';

    // SVG (statisch, keine Morph-Animation)
    const ns="http://www.w3.org/2000/svg";
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 400 400');
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('class','blob-fill');
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('class','blob-stroke');
    svg.appendChild(fill); svg.appendChild(stroke);
    el.appendChild(svg);

    // Statische Form erzeugen
    const d = blobPath(r, 200, 200, 150, 12, 0.18);
    fill.setAttribute('d', d); stroke.setAttribute('d', d);

    // Tiefe & Optik
    const zPx     = lerp(120, -420, z);
    const blurPx  = lerp(0.10, 0.90, z);
    const opBase  = lerp(0.96, 0.86, z);
    const glow = (hex,a)=>{ const h=hex.replace('#',''); const R=parseInt(h.slice(0,2),16),G=parseInt(h.slice(2,4),16),B=parseInt(h.slice(4,6),16); return `rgba(${R},${G},${B},${a})`; };
    el.style.filter = `drop-shadow(0 12px 26px rgba(0,0,0,.36)) drop-shadow(0 0 16px ${glow(color,0.44)}) blur(${blurPx.toFixed(2)}px)`;

    // Zeitkonstanten (nur Scale & Opacity)
    const t0 = performance.now() - r()*life*0.2; // leichte Startverschiebung
    const SCALE_START = 0.92, SCALE_END = 1.10; // Anwachsen über Lebenszyklus
    const PULSE_A = 0.002 + r()*0.003;         // 0.2–0.5 %
    const PULSE_T = lerp(14, 22, r());         // 14–22 s

    function draw(){
      const t = ((performance.now() - t0)/1000) * TEMPO;
      const p = clamp(t / (life/1000), 0, 1);

      // Hüllkurve für Opacity (Fade in/out)
      const eIn  = smoothstep(0.00, 0.10, p);
      const eOut = 1 - smoothstep(0.90, 1.00, p);
      const env  = Math.min(eIn, eOut);

      // Easing fürs Anwachsen (easeOut)
      const grow = 1 - Math.pow(1 - p, 2);
      const baseScale = lerp(SCALE_START, SCALE_END, grow);
      const pulse = Math.sin((TAU*t)/PULSE_T) * PULSE_A;
      const scale = (baseScale + pulse).toFixed(3);

      // Keine Rotation, keine Parallax, kein Drift
      el.style.transform = `translate3d(0px, 0px, ${zPx.toFixed(1)}px) scale(${scale})`;
      el.style.opacity = (opBase * env).toFixed(2);

      el.__raf = requestAnimationFrame(draw);
    }

    // Click-Navigation (nur Home)
    if(isHome){
      const href = (Math.random() < 0.34) ? '/ueber-mich.html' : (Math.random() < 0.6 ? '/projekte.html' : '/kontakt.html');
      el.addEventListener('click', ()=>{
        try{ window.EngineLite && window.EngineLite.start(900 + Math.random()*450); }catch{};
        setTimeout(()=>location.href=href, 180);
      });
      el.setAttribute('role','link'); el.setAttribute('tabindex','0'); el.setAttribute('aria-label','Navigation');
      el.addEventListener('keydown', ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); el.click(); } });
    }

    // Einblenden, Render starten
    el.style.opacity = '0';
    ensureHolder().appendChild(el);
    requestAnimationFrame(()=>{ el.style.opacity = opBase.toFixed(2); });
    draw();

    // Sanft ausblenden & respawnen
    setTimeout(()=>{
      el.style.opacity = '0';
      setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(ensureHolder()); }, 2800);
    }, life);
  }

  function init(){
    ensureHolder();
    const isMobile = innerWidth < 820;
    const count = isMobile ? Math.round(4 + Math.random()) : Math.round(6 + Math.random()*2); // 4–5 / 6–8
    for(let i=0;i<count;i++) setTimeout(()=>spawn(ensureHolder()), 1000 + i*1500); // ruhiger Aufbau
    addEventListener('beforeunload', ()=>{ try{ window.EngineLite && window.EngineLite.stop(); }catch{} });
  }

  if(document.readyState!=="loading") init();
  else addEventListener('DOMContentLoaded', init);
})();