/* hero-shapes.js — Smooth Wander + 3.5s Fade */
(function(){
  const TAU = Math.PI*2;
  const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function rand(seed){ let x=seed||Math.floor(Math.random()*0xffffffff); return ()=>(x^=x<<13,x^=x>>17,x^=x<<5,(x>>>0)/4294967296); }
  function blobPath(rng, cx, cy, radius=150, points=16, variance=0.12){
    const step=TAU/points, pts=[];
    for(let i=0;i<points;i++){ const ang=i*step, rad=radius*(1-variance/2+rng()*variance); pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<pts.length;i++){ const p0=pts[i], p1=pts[(i+1)%pts.length]; const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+' Z';
  }
  function ensureHolder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; h.style.perspective='900px'; document.body.appendChild(h); } return h; }
  function spawn(holder){
    const W=innerWidth, H=innerHeight, base=Math.min(W,H); const r=rand();
    const size=base*lerp(0.12,0.32,r()); const AX=lerp(24,72,r()), AY=lerp(20,64,r());
    const x0=lerp(AX,Math.max(AX,W-size-AX),r()), y0=lerp(AY,Math.max(AY,H-size-AY),r());
    const el=document.createElement('div'); el.className='shape'; el.style.left=`${(x0-size/2)|0}px`; el.style.top=`${(y0-size/2)|0}px`; el.style.width=`${size}px`; el.style.height=`${size}px`;
    el.style.zIndex=String(1000-Math.floor(r()*1000)); el.style.transition='opacity 3.5s ease'; el.style.color='#00F5D4';
    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const fill=document.createElementNS(ns,'path'); const stroke=document.createElementNS(ns,'path'); svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);
    const d=blobPath(r,200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d); el.style.mixBlendMode='screen';
    const t0=performance.now()-r()*25000*0.3; const TX=lerp(180,320,r()), TY=lerp(200,340,r());
    const SCALE_START=lerp(0.88,0.96,r()), SCALE_END=lerp(1.07,1.16,r()); const PULSE_A=0.001 + r()*0.002, PULSE_T=lerp(14,22,r());
    function draw(){ const now=performance.now(), t=(now-t0)/1000; const dx=Math.sin((TAU*t)/TX)*AX, dy=Math.cos((TAU*t)/TY)*AY;
      el.style.left=`${Math.round((x0-size/2)+dx)}px`; el.style.top=`${Math.round((y0-size/2)+dy)}px`;
      const p=clamp((now-t0)/25000,0,1); const eIn=clamp(p/0.1,0,1), eOut=clamp((1-p)/0.1,0,1); const env=Math.min(eIn,eOut);
      el.style.opacity=(0.9*env).toFixed(2); const grow=1-Math.pow(1-p,2); const base=lerp(SCALE_START,SCALE_END,grow); const pulse=Math.sin((TAU*t)/PULSE_T)*PULSE_A;
      el.style.transform=`scale(${(base+pulse).toFixed(3)})`;
      el.__raf=requestAnimationFrame(draw);
    }
    el.style.opacity='0'; holder.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.9'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(holder); }, 3600); }, 25000);
  }
  function init(){ const holder=ensureHolder(); const n=innerWidth<820?5:8; for(let i=0;i<n;i++) setTimeout(()=>spawn(holder), 1000+i*1500); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();