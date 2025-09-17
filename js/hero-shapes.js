/* public/js/hero-shapes.js — title + hint inside bubbles */
(function(){
  const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t, NEON=['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pick=()=>NEON[(Math.random()*NEON.length)|0];
  function path(cx,cy,r=150,n=16,v=0.12){const step=TAU/n, pts=[];for(let i=0;i<n;i++){const ang=i*step, rad=r*(1-v/2+Math.random()*v);pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad});}
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;for(let i=0;i<n;i++){const p0=pts[i], p1=pts[(i+1)%pts.length];const cxp=(p0.x+p1.x)/2,cyp=(p0.y+p1.y)/2;d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`;}return d+' Z';}
  function holder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; document.body.appendChild(h);} return h; }
  function spawn(h){
    const W=innerWidth,H=innerHeight,B=Math.min(W,H);
    const size=B*lerp(0.28,0.56,Math.random()), AX=lerp(50,110,Math.random()), AY=lerp(42,96,Math.random());
    const speed=lerp(0.008,0.018,Math.random()), TX=lerp(360,560,Math.random()), TY=lerp(380,600,Math.random());
    const x0=lerp(AX,Math.max(AX,W-size-AX),Math.random()), y0=lerp(AY,Math.max(AY,H-size-AY),Math.random()), color=pick();
    const el=document.createElement('div'); el.className='shape'; Object.assign(el.style,{position:'absolute',left:`${(x0-size/2)|0}px`,top:`${(y0-size/2)|0}px`,width:`${size}px`,height:`${size}px`,zIndex:String(1000-((Math.random()*1000)|0)),transition:'opacity 4s ease',willChange:'transform,opacity'});
    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.style.mixBlendMode='screen';
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('fill',color); fill.setAttribute('opacity','0.78');
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('stroke',color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    const d=path(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d); svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);
    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const it=window.__TICKER_ITEMS[ (window.__bubbleIndex++) % window.__TICKER_ITEMS.length ];
      const wrap=document.createElement('div'); wrap.style.position='absolute'; wrap.style.left='50%'; wrap.style.top='50%'; wrap.style.transform='translate(-50%,-50%)'; wrap.style.textAlign='center'; wrap.style.pointerEvents='none';
      const title=document.createElement('div'); title.textContent=it.label; Object.assign(title.style,{color:'#0a1118',fontWeight:'800',fontSize:'13px',background:'rgba(255,255,255,.35)',padding:'4px 8px',borderRadius:'10px',textShadow:'0 1px 2px rgba(255,255,255,.6)'});
      const hint=document.createElement('div'); hint.textContent=it.hint||'Klick – Ergebnis erscheint im Fenster'; Object.assign(hint.style,{marginTop:'6px',fontSize:'11px',opacity:.9,background:'rgba(12,16,22,.35)',color:'#eaf2ff',padding:'3px 6px',borderRadius:'8px'});
      wrap.appendChild(title); wrap.appendChild(hint); el.appendChild(wrap);
      el.dataset.prompt=it.prompt||''; el.dataset.action=it.action||''; el.style.cursor='pointer';
      el.addEventListener('click',()=>{
        const act=el.dataset.action;
        if(act && window.VisualLab && typeof VisualLab.handle==='function'){ VisualLab.handle(act); return; }
        if(act==='research' && window.startResearch){ const q=prompt('Thema für Live‑Recherche?'); if(q) startResearch(q); return; }
        if(act==='cage-match' && window.openCageMatch){ openCageMatch(); return; }
        const p=el.dataset.prompt||''; if(window.openAnswerPopup) window.openAnswerPopup(p);
      });
    }
    let running=true; const io=new IntersectionObserver((e)=>{ running=e[0]?.isIntersecting!==false; }); io.observe(el);
    const t0=performance.now()*speed, life=56000;
    function draw(){ if(running){ const t=(performance.now()*speed)-t0, dx=Math.sin(t/TX)*AX, dy=Math.cos(t/TY)*AY, p=Math.min(1,(performance.now()-t0/speed)/life), eIn=Math.min(1,p/0.2), eOut=1-Math.min(1,(p-0.8)/0.2), env=Math.min(eIn,eOut); const base=0.98, pulse=Math.sin(t/24)*0.002; el.style.opacity=(0.94*env).toFixed(2); el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${(base+pulse).toFixed(3)})`; } el.__raf=requestAnimationFrame(draw); }
    el.style.opacity='0'; h.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.95'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); spawn(h); }, 4200); }, life);
  }
  function init(){ const h=holder(); const n= innerWidth<820 ? 8 : 12; for(let i=0;i<n;i++) setTimeout(()=>spawn(h), 600+i*1600);
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 10000); }
  if(document.readyState!=='loading') init(); else addEventListener('DOMContentLoaded', init);
})();