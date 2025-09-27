/* public/js/hero-shapes.js — threads, daily-idea slot, news ts, generate&show */
(function(){
  const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t;
  const NEON=['#00F5D4','#7CF4FF','#FFD400','#FF4FA3','#00E676','#A0FF1A','#9C64FF','#FFA26B'];
  const pick=()=>NEON[(Math.random()*NEON.length)|0];
  const pool=[];
  const THREADS = JSON.parse(localStorage.getItem('bubble_threads_v1')||'{}');
  function saveThreads(){ localStorage.setItem('bubble_threads_v1', JSON.stringify(THREADS)); }
  function getThread(id){ if(!THREADS[id]) THREADS[id] = (Math.random().toString(36).slice(2,10)); saveThreads(); return THREADS[id]; }

  function path(cx,cy,r=150,n=16,v=0.12){
    const step=TAU/n, pts=[];
    for(let i=0;i<n;i++){ const ang=i*step, rad=r*(1-v/2+Math.random()*v); pts.push({x:cx+Math.cos(ang)*rad,y:cy+Math.sin(ang)*rad}); }
    let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for(let i=0;i<n;i++){ const p0=pts[i], p1=pts[(i+1)%pts.length]; const cxp=(p0.x+p1.x)/2,cyp=(p0.y+p1.y)/2; d+=` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}, ${cxp.toFixed(2)} ${cyp.toFixed(2)}`; }
    return d+' Z';
  }
  function collides(x,y,r){ for(const s of pool){ if(Math.hypot(x-s.cx,y-s.cy) < (r+s.r+24)) return true; } return false; }
  function holder(){ let h=document.getElementById('shapes'); if(!h){ h=document.createElement('div'); h.id='shapes'; document.body.appendChild(h);} return h; }

  function spawn(h){
    const W=innerWidth,H=innerHeight,B=Math.min(W,H);
    const size=B*lerp(0.28,0.52,Math.random()); const r=size/2, pad=60;
    let cx,cy,ok=false,tries=24; while(tries--){ cx=lerp(pad,W-pad,Math.random()); cy=lerp(pad+40,H-pad-120,Math.random()); if(!collides(cx,cy,r)){ok=true;break;} }
    if(!ok){ cx=lerp(pad,W-pad,Math.random()); cy=lerp(pad+40,H-pad-120,Math.random()); }
    const color=pick(); const el=document.createElement('div'); el.className='shape';
    Object.assign(el.style,{position:'absolute',left:`${(cx-r)|0}px`,top:`${(cy-r)|0}px`,width:`${size}px`,height:`${size}px`,zIndex:String(600+((Math.random()*400)|0)),transition:'opacity 2.6s ease',willChange:'transform,opacity'});
    const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 400 400'); svg.style.mixBlendMode='screen';
    const fill=document.createElementNS(ns,'path'); fill.setAttribute('fill',color); fill.setAttribute('opacity','0.78');
    const stroke=document.createElementNS(ns,'path'); stroke.setAttribute('stroke',color); stroke.setAttribute('fill','none'); stroke.setAttribute('opacity','0.55');
    const d=path(200,200,150,16,0.12); fill.setAttribute('d',d); stroke.setAttribute('d',d); svg.appendChild(fill); svg.appendChild(stroke); el.appendChild(svg);

    if(Array.isArray(window.__TICKER_ITEMS)&&window.__TICKER_ITEMS.length){
      if(typeof window.__bubbleIndex!=='number') window.__bubbleIndex=0;
      const idx = window.__bubbleIndex % window.__TICKER_ITEMS.length;
      const it=window.__TICKER_ITEMS[idx]; window.__bubbleIndex++;

      // daily-idea hydration: fetch once per page load
      if(it.action==='daily-idea' && !it._hydrated){
        fetch('/daily/idea').then(r=>r.json()).then(j=>{
          it.label=j.label||it.label; it.hint=j.hint||'Heute neu'; it.prompt=j.prompt||it.prompt; it._hydrated=true; it._ts=j.cachedAt;
        }).catch(_=>{ it._hydrated=true; });
      }

      const wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;';
      if(it.tag){
        const badge=document.createElement('div'); badge.textContent=it.tag;
        Object.assign(badge.style,{position:'absolute',left:'-50%',top:'-60%',transform:'translate(-12px,-6px)',fontSize:'10px',padding:'4px 8px',borderRadius:'999px',background:'rgba(12,16,22,.55)',color:'#eaf2ff',border:'1px solid rgba(255,255,255,.18)',pointerEvents:'none'});
        wrap.appendChild(badge);
      }
      const title=document.createElement('div'); title.textContent=it.label; Object.assign(title.style,{color:'#0a1118',fontWeight:'800',fontSize:'14px',background:'rgba(255,255,255,.35)',padding:'6px 10px',borderRadius:'10px',textShadow:'0 1px 2px rgba(255,255,255,.6)'});
      const hint=document.createElement('div'); hint.textContent=it.hint||'Klick – Ergebnis im Fenster'; Object.assign(hint.style,{marginTop:'6px',fontSize:'11px',opacity:.9,background:'rgba(12,16,22,.35)',color:'#eaf2ff',padding:'4px 8px',borderRadius:'8px'});
      wrap.appendChild(title); wrap.appendChild(hint); el.appendChild(wrap);

      el.dataset.prompt=it.prompt||''; el.dataset.action=it.action||'claude'; el.dataset.heading=it.heading||it.label; el.dataset.id = String(it.id || idx);
      el.style.cursor='pointer';
      el.addEventListener('click',()=>{
        try{ window.Ambient && Ambient.ensureStart(); }catch(e){}
        document.querySelectorAll('.shape').forEach(s=>{ if(s!==el) s.style.opacity='0.25'; });
        const act=el.dataset.action; const label=el.dataset.heading; const prompt=el.dataset.prompt;
        const thread = getThread(el.dataset.id);

        if(act==='daily-news'){
          fetch('/news/today').then(r=>r.json()).then(j=>{
            const d = new Date(j.cachedAt||Date.now());
            const hh = String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0');
            const t=`${j.title || 'KI‑News'} — Stand: ${hh}:${mm}\n\n${j.summary || ''}\n\nQuellen:\n${(j.links||[]).map(u=>'• '+u).join('\n')}`;
            window.openAnswerPopup && openAnswerPopup(t,false,'KI‑News heute');
          }).catch(_=> window.openAnswerPopup && openAnswerPopup('Keine News verfügbar.','', 'KI‑News'));
          return;
        }

        if(act==='daily-idea'){
          if(!it._hydrated){ return window.openAnswerPopup && openAnswerPopup('Lade „Heute neu“…','', 'Heute neu'); }
          const head = it._ts ? `${label} — Stand: ${new Date(it._ts).toLocaleTimeString().slice(0,5)}` : label;
          return window.runClaudeToPopup ? window.runClaudeToPopup(head, it.prompt, { thread }) : alert('Claude-Runner fehlt');
        }

        if(act==='claude-json'){
          return window.runClaudeJSONToCanvas ? window.runClaudeJSONToCanvas(label, prompt, it.schemaHint || '') : alert('Claude JSON Runner fehlt');
        }

        // default: claude text
        return window.runClaudeToPopup ? window.runClaudeToPopup(label, prompt, { thread }) : alert('Claude-Runner fehlt');
      });
    }

    const AX=lerp(40,96,Math.random()), AY=lerp(36,82,Math.random());
    const speed=lerp(0.003,0.006,Math.random()); const TX=lerp(520,840,Math.random()), TY=lerp(560,900,Math.random());
    const t0=performance.now()*speed, life=60000; const state={el,cx,cy,r}; pool.push(state);
    function draw(){ const t=(performance.now()*speed)-t0; const dx=Math.sin(t/TX)*AX, dy=Math.cos(t/TY)*AY; el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`; el.__raf=requestAnimationFrame(draw); }
    el.style.opacity='0'; h.appendChild(el); requestAnimationFrame(()=>{ el.style.opacity='0.96'; }); draw();
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ cancelAnimationFrame(el.__raf); el.remove(); const i=pool.indexOf(state); if(i>=0) pool.splice(i,1); spawn(h); }, 2400); }, life);
  }
  function init(){
    // visuals canvas for generate&show
    const c = document.createElement('script'); c.src='/public/js/visuals-canvas.js'; document.head.appendChild(c);
    const h=holder(); const target=innerWidth<820?7:10; for(let i=0;i<target;i++) setTimeout(()=>spawn(h), 400+i*900);
    setTimeout(()=>{ const pm=document.getElementById('pre-msg'); if(pm) pm.remove(); }, 9000);
  }
  if(document.readyState!=='loading') init(); else addEventListener('DOMContentLoaded', init);
})();