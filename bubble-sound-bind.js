(function(){
  function initEngineOnce(){
    if (!window.EngineSim || typeof EngineSim.init!=='function') { console.warn('[BubbleSound] EngineSim missing'); return; }
    if (!EngineSim._wolfInitDone){
      EngineSim.init({ mode:'v12', rpm:1500, volume:0.28, attachToggle:false, autoStartOnGesture:false });
      EngineSim._wolfInitDone = true;
      console.log('[BubbleSound] EngineSim initialized');
    }
  }
  function profileFor(el, i){
    const m=(el.getAttribute('data-engine-mode')||'').toLowerCase();
    const rpm=+el.getAttribute('data-rpm'); const vol=parseFloat(el.getAttribute('data-vol'));
    if (m||rpm||vol) return { mode:(m==='motorcycle'?'motorcycle':'v12'), rpm:isFinite(rpm)?rpm:1500, vol:isFinite(vol)?vol:0.28 };
    const map=[{mode:'v12',rpm:1700,vol:0.30},{mode:'motorcycle',rpm:1100,vol:0.34},{mode:'v12',rpm:2200,vol:0.32},{mode:'motorcycle',rpm:1300,vol:0.33}];
    return map[i%map.length];
  }
  async function startFor(el,i){ const p=profileFor(el,i); EngineSim.setMode(p.mode); EngineSim.setRPM(p.rpm); EngineSim.setVolume(p.vol); await EngineSim.start(); }
  async function stopAll(st){ try{await EngineSim.stop();}catch(e){} if(st.active) st.active.classList.remove('playing'); st.active=null; }
  function bind(){
    initEngineOnce();
    const shapes=[...document.querySelectorAll('.shape')]; const st={active:null}; if(!shapes.length) return;
    shapes.forEach((el,i)=>el.addEventListener('click',async ev=>{ ev.stopPropagation();
      if(st.active===el){ await stopAll(st); return; }
      if(st.active) st.active.classList.remove('playing'); st.active=el; el.classList.add('playing'); await startFor(el,i);
    }));
    document.addEventListener('click',e=>{ if(!e.target.closest('.shape')) stopAll(st); });
    document.addEventListener('touchstart',()=>{}, {passive:true});
  }
  window.addEventListener('DOMContentLoaded', bind);
})();
<script>
(() => {
  const DESTS = ['/projekte.html','/ueber-mich.html','/kontakt.html'];
  const current = location.pathname.replace(/\/+$/, '');

  function randomDest() {
    const pool = DESTS.filter(d => !current.endsWith(d));
    return pool[(Math.random() * pool.length) | 0] || DESTS[0];
  }

  // wir greifen auf die bereits vorhandene Logik zurück (Sound per Klick)
  window.addEventListener('DOMContentLoaded', () => {
    const shapes = [...document.querySelectorAll('.shape')];
    let lpTimer = null;
    let longPressed = false;

    shapes.forEach(el => {
      el.addEventListener('pointerdown', () => {
        longPressed = false;
        lpTimer = setTimeout(() => {
          longPressed = true;
          // sanfter Visual-Hint
          el.classList.add('playing');
          // kleine Verzögerung, damit die Outline kurz sichtbar ist
          setTimeout(() => { window.location.href = randomDest(); }, 120);
        }, 650); // Long-Press-Dauer
      });

      const cancel = () => { if (lpTimer) clearTimeout(lpTimer); };
      el.addEventListener('pointerup', cancel);
      el.addEventListener('pointerleave', cancel);
      el.addEventListener('click', (ev) => {
        if (longPressed) {
          // Klick nach Long-Press nicht doppelt ausführen
          ev.stopPropagation();
          ev.preventDefault();
        }
      }, true);
    });
  });
})();
</script>
