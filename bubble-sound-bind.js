
(function(){
  function init(){ if(!window.EngineSim||typeof EngineSim.init!=='function'){ console.info('[BubbleSound] EngineSim not present, skip'); return; }
    if(EngineSim._initDone) return; EngineSim.init({mode:'v12',rpm:1500,volume:0.28,attachToggle:false,autoStartOnGesture:false}); EngineSim._initDone=true; }
  function prof(el,i){ const map=[{mode:'v12',rpm:1700,vol:0.30},{mode:'motorcycle',rpm:1100,vol:0.34},{mode:'v12',rpm:2200,vol:0.32},{mode:'motorcycle',rpm:1300,vol:0.33}]; return map[i%map.length]; }
  async function start(p){ EngineSim.setMode(p.mode); EngineSim.setRPM(p.rpm); EngineSim.setVolume(p.vol); await EngineSim.start(); }
  async function stop(){ try{ await EngineSim.stop(); }catch(e){} }
  function bind(){
    init(); const shapes=[...document.querySelectorAll('.shape')]; if(!shapes.length || !window.EngineSim) return;
    let active=null;
    shapes.forEach((el,i)=> el.addEventListener('click', async ev=>{
      ev.stopPropagation();
      if(active===el){ await stop(); el.classList.remove('playing'); active=null; return; }
      if(active){ active.classList.remove('playing'); }
      active=el; el.classList.add('playing'); await start(prof(el,i));
    }));
    document.addEventListener('click', e=>{ if(!e.target.closest('.shape') && active){ stop(); active.classList.remove('playing'); active=null; } });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
