/* hero-shapes.js — Neon Bubbles, slower & smoother */
(function(){
  const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const NEON=['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pick=()=>NEON[(Math.random()*NEON.length)|0];

  function path(cx,cy,r=150,n=16,v=0.12){
    const step=TAU/n, pts=[];
    for(let i=0;i<n;i++){ const ang=i*step, rad=r*(1-v/2+Math.random()*v); pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<n;i++){ const p0=pts[i], p1=pts[(i+1)%n]; const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+' Z';
  }

  function holder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; document.body.appendChild(h);} return h; }

  function spawn(h){
    const W=innerWidth,H=innerHeight,B=Math.min(W,H);
    const size=B*lerp(0.22,0.46,Math.random());      // etwas größer
    const AX=lerp(48,110,Math.random()), AY=lerp(42,95,Math.random()); // etwas kleinere Amplitude
    const speed=lerp(0.018,0.065,Math.random());     // deutlich langsamer
    const TX=lerp(220,360,Math.random()), TY=lerp(240,380,Math.random()); // längere Wege
    const x0=lerp(AX,Math.max(AX,W-size-AX),Math.random()), y0=lerp(AY,Math.max(AY,H-size-AY),Math.random());
    const color=pick();

    const el=document.createElement('div'); el.className='shape';
    Object.assign(el.style,{position:'absolute',left:`${(x0-size/2)|0}px`,top:`${(y0-size/2)|0}px`,width:`${size}px`,height:`${size}px`,
      zIndex:String(1000-((Math.random()*1000)|0)),transition:'opacity 4s ease',mixBlendMode:'screen',willChange:'transform,opacity'});

    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400');
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('fill',color);
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('stroke',color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    const d=path(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d); svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);

    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const it=window.__TICKER_ITEMS[ (window.__bubbleIndex++) % window.__TICKER_ITEMS.length ];
      const lbl=document.createElement('div'); lbl.textContent=it.label;
      Object.assign(lbl.style,{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',color:'#EAF2FF',textAlign:'center',pointerEvents:'none',fontSize:'13px',fontWeight:'700',textShadow:'0 1px 3px rgba(0,0,0,.45)'});
      el.appendChild(lbl); el.dataset.prompt=it.prompt; el.style.cursor='pointer';
      el.addEventListener('click',()=>{ const p=el.dataset.prompt||''; if(window.openAnswerPopup) window.openAnswerPopup(p); });
    }

    const t0=performance.now()*speed, PULSE_A=lerp(0.001,0.002,Math.random()), PULSE_T=lerp(16,26,Math.random());
    function draw(){
      const t=(performance.now()*speed)-t0;
      const dx=Math.sin(t/TX)*AX, dy=Math.cos(t/TY)*AY;
      const life=35000; // 35s Lebensdauer
      const p=Math.min(1,(performance.now()-t0/speed)/life);
      const eIn=Math.min(1,p/0.12), eOut=1-Math.min(1,(p-0.88)/0.12), env=Math.min(eIn,eOut);
      const grow=1-Math.pow(1-p,2), base=lerp(0.92,1.10,grow), pulse=Math.sin(t/PULSE_T)*PULSE_A;
      el.style.opacity=(0.9*env).toFixed(2);
      el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${(base+pulse).toFixed(3)})`;
      el.__raf=requestAnimationFrame(draw);
    }
    el.style.opacity='0'; h.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.95'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(h); }, 4200); }, 35000);
  }

  function init(){ const h=holder(); const n= innerWidth<820 ? 8 : 12; for(let i=0;i<n;i++) setTimeout(()=>spawn(h), 600+i*1400);
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 10000);
  }
  if(document.readyState!=='loading') init(); else addEventListener('DOMContentLoaded', init);
})();