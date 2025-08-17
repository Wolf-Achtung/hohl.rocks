/*
 * Generiert weiche Neon-Shapes, die langsam morphen.
 * Auf der Startseite verlinken Shapes zufällig auf die Unterseiten.
 */
(function(){
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || location.pathname==='/';
  const targets = ['/ueber-mich.html','/projekte.html','/kontakt.html'];

  const palette = [
    '#38bdf8', // sky
    '#a78bfa', // violet
    '#22d3ee', // cyan
    '#10b981', // emerald
    '#f472b6', // pink
    '#84cc16'  // acid green
  ];

  function randomBetween(a,b){return a + Math.random()*(b-a)}

  function spawn(container){
    const el = document.createElement('div');
    el.className='shape';
    el.style.color = palette[(Math.random()*palette.length)|0];
    el.dataset.variant = Math.random()>.5 ? 'blob' : 'comet';
    // random size & position
    const size = randomBetween(16, 34);
    el.style.width = size+'vmin'; el.style.height=size+'vmin';
    el.style.left = randomBetween(4, 70)+'vw';
    el.style.top = randomBetween(10, 68)+'vh';

    // pointer
    el.addEventListener('pointerenter', ()=>{
      el.style.filter = 'drop-shadow(0 12px 34px rgba(0,0,0,.45)) drop-shadow(0 0 30px currentColor)';
    });
    el.addEventListener('pointerleave', ()=>{
      el.style.filter = '';
    });

    // random linking on home only
    if(isHome){
      el.addEventListener('click', ()=>{
        // kleiner Delay damit Sound hörbar "anspringt"
        const target = targets[(Math.random()*targets.length)|0];
        setTimeout(()=>{ location.href = target; }, 140);
      });
    }

    container.appendChild(el);
    // morph loop
    const morph = ()=>{
      const v = Math.random();
      el.dataset.variant = v>.66 ? 'blob' : (v>.33 ? 'comet' : '');
      // wander a little
      el.style.left = randomBetween(2, 78)+'vw';
      el.style.top  = randomBetween(8, 72)+'vh';
      el.style.color = palette[(Math.random()*palette.length)|0];
    };
    const iv = setInterval(morph, randomBetween(3800, 6200));
    // gentle appear
    el.style.opacity = .0;
    requestAnimationFrame(()=>{
      el.style.transition = 'opacity 1.2s ease, transform 2.8s ease';
      el.style.opacity = .95;
    });
    // remove occasionally and respawn to keep variety
    setTimeout(()=>{
      el.style.opacity = 0;
      setTimeout(()=>{ el.remove(); spawn(container); }, 1400);
      clearInterval(iv);
    }, randomBetween(12000, 18000));
  }

  function init(){
    const holder = document.getElementById('shapes');
    if(!holder) return;
    for(let i=0;i<5;i++) setTimeout(()=>spawn(holder), 600 + i*650);
  }

  if(document.readyState!=="loading") init();
  else document.addEventListener('DOMContentLoaded', init);
})();
