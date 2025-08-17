(function(){
  const AC = window.AudioContext||window.webkitAudioContext; let ctx, engine, current=null;
  function ensure(){ if(ctx) return true; if(!AC) return false; ctx=new AC(); engine=new (window.EngineSimLite||function(){}) (ctx); return !!engine; }
  function resumeArm(){ const doc=document; const kick=()=>{ if(ctx?.state==='suspended') ctx.resume(); doc.removeEventListener('pointerdown',kick); doc.removeEventListener('keydown',kick); }; doc.addEventListener('pointerdown',kick); doc.addEventListener('keydown',kick); }
  function startFor(el){ if(!ensure()) return; resumeArm(); if(current===el && engine.running){ engine.stop(); current=null; return; } engine.setRPM(800+Math.random()*500); engine.start(); current=el; }
  function stop(){ if(engine) engine.stop(); current=null; }
  function bind(){ const shapes=[...document.querySelectorAll('.shape')]; shapes.forEach(s=> s.addEventListener('click',(e)=>{e.stopPropagation(); startFor(s);},{passive:true})); document.addEventListener('click',e=>{ if(!e.target.closest('.shape')) stop(); }); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();