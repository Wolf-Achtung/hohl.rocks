/*
 * hero-shapes.js — Smooth Wander + Grow/Pulse (no rotation)
 *
 * Optimierungen gegenüber der Originalversion:
 *  - Blobs werden aus mehr Punkten (16 statt 12) mit geringerer Varianz erzeugt,
 *    damit keine ‚Spitzen‘ mehr entstehen und die Formen weicher wirken.
 *  - Längere Ein-/Ausblendzeiten (4 s) sorgen für ein langsameres Erscheinen
 *    und Verblassen der Shapes.
 *  - Reduzierte Puls-Amplitude für subtileres Atmen.
 */
(function(){
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || location.pathname==='/';
  const targets = ['/ueber-mich.html','/projekte.html','/kontakt.html'];

  const TAU = Math.PI*2;
  const lerp = (a,b,t)=> a+(b-a)*t;
  const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
  const smoothstep = (a,b,x)=>{ const t = clamp((x-a)/(b-a), 0, 1); return t*t*(3 - 2*t); };

  // Farben (Neon-lastig)
  const BASE = [ '#00BCD4', '#2196F3', '#8C9EFF', '#B388FF', '#4DD0E1' ];
  const NEON = [ '#00F5D4', '#7CF4FF', '#FFD700', '#00FA9A', '#E0FFFF' ];
  function pickColor(r){ return (r() < 0.6) ? NEON[Math.floor(r() * NEON.length)] : BASE[Math.floor(r() * BASE.length)]; }

  function rand(seed){ let x = seed || Math.floor(Math.random()*0xffffffff); return ()=>(x^=x<<13,x^=x>>17,x^=x<<5,(x>>>0)/4294967296); }

  // Weiche, statische Blob-Form (Quadratic-Kurven)
  // Mehr Punkte und geringere Varianz -> keine Spitzen
  function blobPath(rng, cx, cy, radius=150, points=16, variance=0.12){
    const step=(TAU)/points, pts=[];
    for(let i=0;i<points;i++){ const ang=i*step, rad=radius*(1-variance/2 + rng()*variance); pts.push({x:cx+Math.cos(ang)*rad, y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<pts.length;i++){ const p0=pts[i], p1=pts[(i+1)%pts.length]; const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+" Z";
  }

  function ensureHolder(){ let holder = document.getElementById('shapes'); if(!holder){ holder=document.createElement('div'); holder.id='shapes'; holder.style.perspective='900px'; document.body.appendChild(holder); } return holder; }

  function spawn(holder){
    const W=innerWidth, H=innerHeight, base=Math.min(W,H);
    const seed=(Math.random()*0xffffffff)>>>0, r=rand(seed);
    const color=pickColor(r), z=r(); // 0 = vorn, 1 = hinten

    // Größenverteilung breiter: 12–32 %
    const sizeBase = lerp(0.12, 0.32, r());
    const sizeDepth = lerp(0.78, 1.08, 1 - z);
    const sizePx = base * sizeBase * sizeDepth;

    // Drift-Amplituden (Overlaps erlaubt), Anker so wählen, dass innerhalb Bounds gedriftet werden kann
    const AX = lerp(24, 72, r());  // px
    const AY = lerp(20, 64, r());
    const x0 = lerp(AX, Math.max(AX, W - sizePx - AX), r());
    const y0 = lerp(AY, Math.max(AY, H - sizePx - AY), r());

    // Lebensdauer und langsames Tempo
    const life = lerp(25000, 45000, r()); // 25–45 s
    const TEMPO = lerp(0.60, 0.95, r());  // individueller Faktor pro Bubble

    const el = document.createElement('div');
    el.className='shape';
    el.style.color=color;
    el.style.left=`${(x0 - sizePx/2)|0}px`;
    el.style.top =`${(y0 - sizePx/2)|0}px`;
    el.style.width = `${sizePx}px`;
    el.style.height= `${sizePx}px`;
    el.style.zIndex = String(1000 - Math.floor(z*1000));
    // Fade-In und -Out: jeweils ca. 3.5 Sekunden
    el.style.transition = 'opacity 3.5s ease';

    // SVG (statisch) – mehr Punkte, kleinere Varianz
    const ns="http://www.w3.org/2000/svg";
    const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('class','blob-fill');
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('class','blob-stroke');
    svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);
    const d = blobPath(r, 200, 200, 150, 16, 0.12); fill.setAttribute('d', d); stroke.setAttribute('d', d);

    // --- Interaktive Inhalte für Bubbles ---
    // Weise jedem Bubble einen Eintrag aus window.__TICKER_ITEMS zu. Dadurch
    // ersetzen wir das Laufticker-Konzept durch interaktive Neon-Bubbles,
    // die beim Anklicken KI-Prompts ausführen.
    if(Array.isArray(window.__TICKER_ITEMS) && window.__TICKER_ITEMS.length){
      // globalen Index initialisieren oder erhöhen
      if(typeof window.__bubbleIndex !== 'number'){ window.__bubbleIndex = 0; }
      const idx = window.__bubbleIndex % window.__TICKER_ITEMS.length;
      window.__bubbleIndex++;
      const item = window.__TICKER_ITEMS[idx];
      if(item){
        // Lege eine Beschriftung auf die Mitte der Bubble
        const lbl = document.createElement('div');
        lbl.className = 'bubble-label';
        lbl.textContent = item.label;
        lbl.style.position = 'absolute';
        lbl.style.left = '50%';
        lbl.style.top  = '50%';
        lbl.style.transform = 'translate(-50%, -50%)';
        lbl.style.color = '#eaf2ff';
        lbl.style.fontSize = '12px';
        lbl.style.fontWeight = '500';
        lbl.style.pointerEvents = 'none';
        lbl.style.textAlign = 'center';
        el.appendChild(lbl);
        // Prompt als Datenattribut speichern
        el.dataset.prompt = item.prompt;
        // Klick-Handler: sende den Prompt über fetchAnswer oder öffne direkt ein Popup
        el.style.cursor = 'pointer';
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const p = el.dataset.prompt;
          if(!p) return;
          if(typeof window.fetchAnswer === 'function'){
            window.fetchAnswer(p);
          } else if(typeof window.openAnswerPopup === 'function'){
            window.openAnswerPopup(p);
          } else {
            try { window.dispatchEvent(new CustomEvent('chat:send')); } catch(_){ }
            try { window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: p } })); } catch(_){ }
            try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(_){ }
          }
        });
      }
    }

    // Tiefe & Optik
    const zPx     = lerp(120, -420, z);
    const blurPx  = lerp(0.10, 0.90, z);
    const opBase  = lerp(0.96, 0.86, z);
    const glow = (hex,a)=>{ const h=hex.replace('#',''); const R=parseInt(h.slice(0,2),16),G=parseInt(h.slice(2,4),16),B=parseInt(h.slice(4,6),16); return `rgba(${R},${G},${B},${a})`; };
    el.style.filter = `drop-shadow(0 12px 26px rgba(0,0,0,.36)) drop-shadow(0 0 16px ${glow(color,0.44)}) blur(${blurPx.toFixed(2)}px)`;
    el.style.mixBlendMode = 'screen';

    // Zeitkonstanten
    const t0 = performance.now() - r()*life*0.3;
    const TX = lerp(180, 320, r()); // s
    const TY = lerp(200, 340, r()); // s
    // Scale über Lebensdauer + leichter Pulse – weniger Amplitude
    const SCALE_START = lerp(0.88, 0.96, r());
    const SCALE_END   = lerp(1.07, 1.16, r());
    const PULSE_A = 0.001 + r()*0.002;  // 0.1–0.3 %
    const PULSE_T = lerp(14, 22, r());  // s

    function draw(){
      const now = performance.now();
      const t = (now - t0)/1000 * TEMPO;
      const p = clamp(t / (life/1000), 0, 1);

      // Position: sehr langsames Wandern um (x0,y0)
      const dx = Math.sin((TAU*t)/TX) * AX;
      const dy = Math.cos((TAU*t)/TY) * AY;
      el.style.left = `${Math.round((x0 - sizePx/2) + dx)}px`;
      el.style.top  = `${Math.round((y0 - sizePx/2) + dy)}px`;

      // Opacity-Hüllkurve
      const eIn  = smoothstep(0.00, 0.10, p);
      const eOut = 1 - smoothstep(0.90, 1.00, p);
      const env  = Math.min(eIn, eOut);
      el.style.opacity = (opBase * env).toFixed(2);

      // Scale: grow + very light pulse
      const grow = 1 - Math.pow(1 - p, 2);
      const baseScale = lerp(SCALE_START, SCALE_END, grow);
      const pulse = Math.sin((TAU*t)/PULSE_T) * PULSE_A;
      const scale = (baseScale + pulse).toFixed(3);
      el.style.transform = `translate3d(0px,0px,${zPx.toFixed(1)}px) scale(${scale})`;

      el.__raf = requestAnimationFrame(draw);
    }

    // Interaktion: Auf der Startseite starten Klicks den Ambient-Sound (falls verfügbar).
    if(isHome){
      el.addEventListener('click', ()=>{
        try{
          sessionStorage.setItem('harley_wants','1');
          if(window.HarleyLite){
            if(!window.HarleyLite.isRunning()) window.HarleyLite.startAmbient(900);
            else if(window.HarleyLite.blip) window.HarleyLite.blip();
          }
        }catch{}
      });
      // Rolle nur zu Deko-Zwecken setzen
      el.setAttribute('role','button'); el.setAttribute('tabindex','0'); el.setAttribute('aria-label','Interaktive Bubble');
      el.addEventListener('keydown', ev=>{ if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); el.click(); } });
    }

    // Einblenden, Render starten
    el.style.opacity = '0';
    holder.appendChild(el);
    requestAnimationFrame(()=>{ el.style.opacity = opBase.toFixed(2); });
    draw();

    // Fade-out & Respawn
    setTimeout(()=>{
      el.style.opacity = '0';
      // Wartezeit für Fade-Out (3.5 s) + kleines Puffer
      setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(holder); }, 3600);
    }, life);
  }

  function init(){
    const holder = ensureHolder();
    const isMobile = innerWidth < 820;
    const count = isMobile ? Math.round(4 + Math.random()) : Math.round(6 + Math.random()*3);
    for(let i=0;i<count;i++) setTimeout(()=>spawn(holder), 1000 + i*1500);
    addEventListener('beforeunload', ()=>{ try{ window.WolfMelody && window.WolfMelody.stop && window.WolfMelody.stop(); }catch{} });
  }

  if(document.readyState!=="loading") init();
  else addEventListener('DOMContentLoaded', init);
})();