/*
 * hero-shapes.js — Organic neon SVG blobs with gentle 3D motion
 * - No sharp edges (smooth quadratic curves)
 * - Slow appear/disappear, slight scale breathing
 * - Some blobs trend larger, others smaller
 * - On homepage, clicking a blob starts audio and navigates to a page
 */
(function(){
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || location.pathname==='/';
  const targets = ['/ueber-mich.html','/projekte.html','/kontakt.html'];

  const palette = [
    '#00F5D4', // mint neon
    '#7CF4FF', // cyan
    '#9B8CFF', // lilac
    '#50E3C2', // aqua
    '#8AF5FF'  // ice
  ];

  function rand(seed){
    let x = seed || Math.floor(Math.random()*0xffffffff);
    return () => (x ^= x<<13, x ^= x>>17, x ^= x<<5, (x>>>0)/4294967296);
  }
  function pick(arr, r=Math.random()){ return arr[Math.floor(r*arr.length)] }

  // Generate a smooth "blob" path using quadratic curves
  function blobPath(rng, cx, cy, radius=120, points=10, variance=0.34){
    const step = (Math.PI*2)/points;
    const pts = [];
    for (let i=0;i<points;i++){
      const ang = i*step;
      const rad = radius*(1-variance/2 + rng()*variance);
      const x = cx + Math.cos(ang)*rad;
      const y = cy + Math.sin(ang)*rad;
      pts.push({x,y});
    }
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i=0;i<pts.length;i++){
      const p0 = pts[i];
      const p1 = pts[(i+1)%pts.length];
      const cxp = (p0.x + p1.x)/2;
      const cyp = (p0.y + p1.y)/2;
      d += ` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`;
    }
    return d + " Z";
  }

  function ensureHolder(){
    let holder = document.getElementById('shapes');
    if(!holder){
      holder = document.createElement('div');
      holder.id = 'shapes';
      document.body.appendChild(holder);
    }
    return holder;
  }

  function spawn(holder){
    const W = window.innerWidth, H = window.innerHeight;
    const seed = (Math.random()*0xffffffff)>>>0;
    const r = rand(seed);
    const color = pick(palette, r());
    const size = (0.18 + r()*0.16) * Math.min(W,H); // 18–34% of min viewport
    const x = r()*(W - size);
    const y = r()*(H - size);
    const trend = r() < 0.5 ? -1 : 1; // some shrink, some grow over time

    const el = document.createElement('div');
    el.className = 'shape';
    el.style.color = color;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    // SVG contents
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const fill = document.createElementNS(svgNS,'path');
    const stroke = document.createElementNS(svgNS,'path');
    fill.setAttribute('class','blob-fill'); stroke.setAttribute('class','blob-stroke');
    svg.appendChild(fill); svg.appendChild(stroke);
    el.appendChild(svg);

    // Motion state
    let t = r()*1000;
    const baseRotX = (r()*10-5); // -5..5 deg
    const baseRotY = (r()*10-5);
    const rotZRate  = (r()*8 - 4) * 0.008; // slow
    const scaleBreath = 0.04 + r()*0.03; // 0.04..0.07
    const trendRate = 0.0006 + r()*0.0005; // very slow
    const life = 12000 + r()*8000; // 12–20s

    function draw(){
      // Organic center drift
      const cx = 200 + Math.sin(t*0.0019)*28;
      const cy = 200 + Math.cos(t*0.0017)*22;
      const rad = 145 + Math.sin(t*0.0023)*8;
      const d = blobPath(r, cx, cy, rad, 10, 0.34);
      fill.setAttribute('d', d);
      stroke.setAttribute('d', d);

      // 3D + breathe
      const breathe = 1 + Math.sin(t*0.0015)*scaleBreath; // slow breathing
      const trendScale = 1 + trend * trendRate * t;       // slow grow/shrink
      const rotX = baseRotX + Math.sin(t*0.0012)*6;
      const rotY = baseRotY + Math.cos(t*0.0011)*6;
      const rotZ = t*rotZRate;
      el.style.transform = `translate3d(0,0,0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${(breathe*trendScale).toFixed(3)})`;

      t += 16;
      el.__raf = requestAnimationFrame(draw);
    }

    // link behaviour (home only)
    if(isHome){
      const href = pick(targets, r());
      el.addEventListener('click', () => {
        try{ window.EngineLite && window.EngineLite.start(1050 + Math.random()*800); }catch{}
        setTimeout(()=> location.href = href, 140);
      });
      el.setAttribute('role','link');
      el.setAttribute('tabindex','0');
      el.setAttribute('aria-label','Navigation');
      el.addEventListener('keydown', (ev)=>{
        if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); el.click(); }
      });
    }

    holder.appendChild(el);
    // enter
    requestAnimationFrame(()=> el.classList.add('show'));
    draw();

    // exit after life
    setTimeout(()=>{
      el.classList.remove('show');
      setTimeout(()=>{
        cancelAnimationFrame(el.__raf);
        el.remove();
        spawn(holder);
      }, 1400);
    }, life);
  }

  function init(){
    const holder = ensureHolder();
    // initial batch
    const count = Math.max(5, Math.min(8, Math.round(Math.min(window.innerWidth, window.innerHeight)/220)));
    for(let i=0;i<count;i++) setTimeout(()=>spawn(holder), 500 + i*700);
    // stop engine when leaving page
    window.addEventListener('beforeunload', ()=>{ try{ window.EngineLite && window.EngineLite.stop(); }catch{} });
  }

  if(document.readyState!=="loading") init();
  else document.addEventListener('DOMContentLoaded', init);
})();
