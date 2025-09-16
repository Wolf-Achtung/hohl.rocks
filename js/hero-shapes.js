/* hero-shapes.js — Neon Bubbles with smooth transform-based motion */
(function(){
  const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const NEON = ['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pickNeon = ()=> NEON[(Math.random()*NEON.length)|0];
  function blobPath(cx,cy,radius=150,points=16,variance=0.12){
    const step=TAU/points, pts=[];
    for(let i=0;i<points;i++){ const ang=i*step, rad=radius*(1-variance/2 + Math.random()*variance); pts.push({x:cx+Math.cos(ang)*rad, y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<points;i++){ const p0=pts[i], p1=pts[(i+1)%pts.length]; const cxp=(p0.x+p1.x)/2, cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+' Z';
  }
  function ensureHolder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; h.style.perspective='900px'; document.body.appendChild(h);} return h; }
  function spawn(holder){
    const W=innerWidth, H=innerHeight, base=Math.min(W,H);
    const size=base*lerp(0.18,0.40,Math.random());
    const AX=lerp(64,140,Math.random()), AY=lerp(56,120,Math.random());
    const speed=lerp(0.05,0.18,Math.random());
    const x0=lerp(AX,Math.max(AX,W-size-AX),Math.random()), y0=lerp(AY,Math.max(AY,H-size-AY),Math.random());
    const color=pickNeon();
    const el=document.createElement('div'); el.className='shape';
    el.style.position='absolute'; el.style.left=`${(x0-size/2)|0}px`; el.style.top=`${(y0-size/2)|0}px`; el.style.width=`${size}px`; el.style.height=`${size}px`;
    el.style.zIndex=String(1000-((Math.random()*1000)|0)); el.style.transition='opacity 3.5s ease'; el.style.mixBlendMode='screen'; el.style.willChange='transform,opacity';
    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const fill=document.createElementNS(ns,'path'); const stroke=document.createElementNS(ns,'path');
    fill.setAttribute('fill', color); stroke.setAttribute('stroke', color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);
    const d=blobPath(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d);
    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const idx=window.__bubbleIndex++ % window.__TICKER_ITEMS.length;
      const item=window.__TICKER_ITEMS[idx];
      const lbl=document.createElement('div'); lbl.textContent=item.label;
      Object.assign(lbl.style,{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',color:'#EAF2FF',textAlign:'center',pointerEvents:'none',fontSize:'13px',fontWeight:'700',textShadow:'0 1px 3px rgba(0,0,0,.45)'});
      el.appendChild(lbl); el.dataset.prompt=item.prompt; el.style.cursor='pointer';
      el.addEventListener('click', ()=>{ const p=el.dataset.prompt||''; if(window.openAnswerPopup) window.openAnswerPopup(p); });
    }
    const t0=performance.now()*speed, TX=lerp(120,220,Math.random()), TY=lerp(140,260,Math.random()), PULSE_A=lerp(0.001,0.003,Math.random()), PULSE_T=lerp(14,22,Math.random());
    function draw(){
      const t=(performance.now()*speed)-t0;
      const dx=Math.sin(t/TX)*AX, dy=Math.cos(t/TY)*AY;
      const p=Math.min(1,(performance.now()-t0/speed)/25000);
      const eIn=Math.min(1,p/0.1), eOut=1-Math.min(1,(p-0.9)/0.1), env=Math.min(eIn,eOut);
      const grow=1-Math.pow(1-p,2), base=lerp(0.88,1.16,grow), pulse=Math.sin(t/PULSE_T)*PULSE_A;
      el.style.opacity=(0.95*env).toFixed(2);
      el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${(base+pulse).toFixed(3)})`;
      el.__raf=requestAnimationFrame(draw);
    }
    el.style.opacity='0'; holder.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.95'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(holder); }, 3600); }, 25000);
  }
  function init(){ const holder=ensureHolder(); const count = innerWidth<820 ? 8 : 12;
    for(let i=0;i<count;i++) setTimeout(()=>spawn(holder), 600 + i*1200);
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 10000);
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();