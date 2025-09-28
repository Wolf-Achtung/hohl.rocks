/* public/js/hero-shapes.js — bigger, readable, collision-aware bubbles + focus + input action */
(function(){
  const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t;
  const NEON=['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pick=()=>NEON[(Math.random()*NEON.length)|0];
  const pool=[];

  function collides(x,y,r){
    for(const s of pool){
      const dx=x-s.cx, dy=y-s.cy;
      if (Math.hypot(dx,dy) < (r+s.r+24)) return true;
    }
    return false;
  }

  function path(cx,cy,r=150,n=16,v=0.12){
    const step=TAU/n, pts=[];
    for(let i=0;i<n;i++){ const ang=i*step, rad=r*(1-v/2+Math.random()*v); pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<n;i++){ const p0=pts[i], p1=pts[(i+1)%pts.length]; const cxp=(p0.x+p1.x)/2,cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+' Z';
  }

  function holder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; document.body.appendChild(h);} return h; }

  function spawn(h){
    const W=innerWidth,H=innerHeight,B=Math.min(W,H);
    const size=B*lerp(0.28,0.56,Math.random());
    const r=size/2, pad=60; let cx,cy,ok=false,tries=24;
    while(tries-- > 0){ cx=lerp(pad,W-pad,Math.random()); cy=lerp(pad+40,H-pad-120,Math.random()); if(!collides(cx,cy,r)){ ok=true; break; } }
    if(!ok){ cx=lerp(pad,W-pad,Math.random()); cy=lerp(pad+40,H-pad-120,Math.random()); }

    const color=pick();
    const el=document.createElement('div'); el.className='shape';
    Object.assign(el.style,{position:'absolute',left:`${(cx-r)|0}px`,top:`${(cy-r)|0}px`,width:`${size}px`,height:`${size}px`,
      zIndex:String(500+((Math.random()*500)|0)), transition:'opacity 2.6s ease', willChange:'transform,opacity'});

    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.style.mixBlendMode='screen';
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('fill',color); fill.setAttribute('opacity','0.78');
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('stroke',color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    const d=path(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d); svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);

    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const it=window.__TICKER_ITEMS[(window.__bubbleIndex++) % window.__TICKER_ITEMS.length];

      const wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;';
      const title=document.createElement('div'); title.textContent=it.label;
      Object.assign(title.style,{color:'#0a1118',fontWeight:'800',fontSize:'14px',background:'rgba(255,255,255,.35)',padding:'6px 10px',borderRadius:'10px',textShadow:'0 1px 2px rgba(255,255,255,.6)'});
      const hint=document.createElement('div'); hint.textContent=it.hint||'Klick – Ergebnis im Fenster';
      Object.assign(hint.style,{marginTop:'6px',fontSize:'11px',opacity:.9,background:'rgba(12,16,22,.35)',color:'#eaf2ff',padding:'4px 8px',borderRadius:'8px'});
      wrap.appendChild(title); wrap.appendChild(hint); el.appendChild(wrap);

      el.dataset.prompt=it.prompt||''; el.dataset.action=it.action||''; el.dataset.placeholder=it.placeholder||''; el.style.cursor='pointer';

      el.addEventListener('click',()=>{
        if(window.Ambient) try{ Ambient.ensureStart(); }catch(e){}
        // Focus mode
        document.querySelectorAll('.shape').forEach(s=>{ if(s!==el) s.style.opacity='0.1'; });
        setTimeout(()=>{ document.querySelectorAll('.shape').forEach(s=>{ if(s!==el) s.style.opacity='0.25'; }); }, 1200);

        const act=el.dataset.action;
        const label=it.label;
        const p=el.dataset.prompt||'';

        if(act==='research' && window.startResearch){ const q=prompt('Thema für Live-Recherche?'); if(q) startResearch(q); return; }
        if(act==='cage-match' && window.openCageMatch){ openCageMatch(); return; }
        if(act==='claude-input' && window.openInputBubble){ return openInputBubble(label, p, { placeholder: el.dataset.placeholder||'Text hier einfügen…' }); }
        if(act && window.VisualLab && typeof VisualLab.handle==='function'){ return VisualLab.handle(act); }

        if(window.openAnswerPopup) window.openAnswerPopup(p, false, label);
      });
    }

    // Motion
    const AX=lerp(40, 96, Math.random()), AY=lerp(36, 82, Math.random());
    const speed=lerp(0.004, 0.010, Math.random());
    const TX=lerp(480, 720, Math.random()), TY=lerp(520, 820, Math.random());
    const t0=performance.now()*speed, life=56000;
    const state={ el, cx, cy, r }; pool.push(state);

    function draw(){ const t=(performance.now()*speed)-t0; const dx=Math.sin(t/TX)*AX, dy=Math.cos(t/TY)*AY; el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`; el.__raf=requestAnimationFrame(draw); }

    el.style.opacity='0'; h.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.96'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); const i=pool.indexOf(state); if(i>=0) pool.splice(i,1); spawn(h); }, 2400); }, life);
  }

  function init(){
    const h=holder(); const target = innerWidth<820 ? 7 : 10;
    for(let i=0;i<target;i++) setTimeout(()=>spawn(h), 400+i*900);
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 8000);
  }
  if(document.readyState!=='loading') init(); else addEventListener('DOMContentLoaded', init);
})();
