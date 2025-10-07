(function(w,d){
  const els = Array.from(d.querySelectorAll('.bubble'));
  const R = ()=> (Math.random()*2-1);

  const bubbles = els.map((el,i)=>({
    el, x: Math.random()*100, y: Math.random()*100,
    vx: (R()*0.06), vy:(R()*0.05),
    s:  0.85 + Math.random()*0.6,
    a:  0
  }));

  els.forEach(el=>{
    el.style.willChange='transform, opacity';
    el.style.opacity='0';
    el.style.transition='opacity 3.2s ease';
    requestAnimationFrame(()=> el.style.opacity='1');
  });

  function tick(){
    for(const b of bubbles){
      b.x += b.vx; b.y += b.vy;
      // sanfte Korrekturen
      if(b.x<-10||b.x>110) b.vx*=-1;
      if(b.y<-10||b.y>110) b.vy*=-1;
      b.a += 0.0016;
      const wob = 1 + Math.sin(b.a)*0.04;
      b.el.style.transform = `translate3d(${b.x}vw, ${b.y}vh, 0) scale(${b.s*wob})`;
    }
    requestAnimationFrame(tick);
  }
  tick();
})(window, document);
