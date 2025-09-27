/* public/js/visuals-canvas.js — render JSON params from Claude in real-time */
(function(){
  let canvas, ctx, raf, params={ palette:['#00f5d4','#7cf4ff','#ffd400','#ff4fa3','#a0ff1a'], seed: 1, speed: 0.6, algorithm:'flow' };
  function ensure(){
    if(canvas) return canvas;
    canvas = document.createElement('canvas'); canvas.id='visuals-canvas';
    Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex: 350, pointerEvents:'none'});
    document.body.appendChild(canvas); ctx = canvas.getContext('2d');
    const resize = ()=>{ canvas.width = innerWidth*devicePixelRatio; canvas.height = innerHeight*devicePixelRatio; };
    addEventListener('resize', resize); resize(); return canvas;
  }
  function rnd(seed){ let x=Math.sin(seed)*10000; return x - Math.floor(x); }
  function draw(t){
    if(!ctx) return;
    const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h);
    const pal=params.palette||['#00f5d4','#7cf4ff','#ffd400','#ff4fa3','#a0ff1a']; const n=18;
    for(let i=0;i<n;i++){
      const k=i+1, r = (Math.min(w,h)/6)*(0.5 + (i/n));
      const x = w/2 + Math.sin((t*0.0002*params.speed) + i*0.7)*r*0.6;
      const y = h/2 + Math.cos((t*0.00025*params.speed) + i*0.6)*r*0.4;
      ctx.beginPath();
      ctx.fillStyle = pal[i % pal.length];
      ctx.globalAlpha = 0.10 + (i/n)*0.18;
      ctx.arc(x,y, r*0.6, 0, Math.PI*2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  function start(p){
    ensure(); params = Object.assign({}, params, p||{});
    cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  }
  function stop(){ cancelAnimationFrame(raf); }
  // Listen for custom events
  window.addEventListener('renderVisualParams', (e)=> start(e.detail||{}) );
  window.Visuals = { start, stop };
})();