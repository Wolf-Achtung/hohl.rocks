
(function(){
  const palette = [
    'radial-gradient(100% 100% at 30% 30%, rgba(5,179,255,.85), rgba(122,92,255,.85))',
    'radial-gradient(100% 100% at 30% 30%, rgba(60,220,255,.85), rgba(0,120,255,.75))',
    'radial-gradient(100% 100% at 30% 30%, rgba(120,80,255,.85), rgba(30,200,255,.75))',
    'radial-gradient(100% 100% at 30% 30%, rgba(40,200,180,.85), rgba(0,140,200,.75))'
  ];
  function rand(a,b){ return Math.random()*(b-a)+a }
  function make(i){
    const el = document.createElement('div'); el.className='shape'; if(i%4===0) el.classList.add('neon'); if(i%5===0) el.classList.add('large'); if(i%3===0) el.classList.add('small');
    el.style.setProperty('--x1', Math.round(rand(5,75))+'vw'); el.style.setProperty('--y1', Math.round(rand(10,70))+'vh');
    el.style.setProperty('--x2', Math.round(rand(5,75))+'vw'); el.style.setProperty('--y2', Math.round(rand(10,70))+'vh');
    el.style.background = i%2? palette[i%palette.length] : el.style.background;
    return el;
  }
  function mount(){
    const layer = document.createElement('div'); layer.className='shapes'; document.body.appendChild(layer);
    const n = 6; let t=0;
    function add(){ const i = layer.children.length; const el = make(i); layer.appendChild(el);
      setTimeout(()=> el.classList.toggle('variant'), 1800+Math.random()*2000);
    }
    const seed = setInterval(()=>{ add(); if(++t>=n) clearInterval(seed); }, 700);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
