
// Long-Press (650ms) => navigate; click reserved for sound
(() => {
  const DESTS = ['/projekte.html','/ueber-mich.html','/kontakt.html'];
  const LONG=650;
  function current(){ return location.pathname.replace(/\/+$/,'') }
  function pick(){ const cur=current(); const pool = DESTS.filter(d=>!cur.endsWith(d)); return pool[(Math.random()*pool.length)|0]||DESTS[0]; }
  window.addEventListener('DOMContentLoaded', ()=>{
    const shapes=[...document.querySelectorAll('.shape')];
    shapes.forEach(el=>{
      let t=null, lp=false;
      el.addEventListener('pointerdown', ()=>{ lp=false; t=setTimeout(()=>{ lp=true; el.classList.add('playing'); setTimeout(()=>{ location.href = el.dataset.nav || pick(); },120); }, LONG); });
      const cancel=()=>{ if(t) clearTimeout(t); }; el.addEventListener('pointerup', cancel); el.addEventListener('pointerleave', cancel);
      el.addEventListener('click', ev=>{ if(lp){ ev.stopPropagation(); ev.preventDefault(); } }, true);
    });
  });
})();
