(function(){
  const LINKS=['ueber-mich.html','projekte.html','kontakt.html'];
  const COLORS=[
    {fill:'rgba(55,190,255,.18)',stroke:'rgba(0,255,160,.85)'},
    {fill:'rgba(80,120,255,.18)',stroke:'rgba(0,255,200,.85)'},
    {fill:'rgba(20,240,140,.18)',stroke:'rgba(0,255,120,.85)'},
    {fill:'rgba(150,80,255,.18)',stroke:'rgba(0,240,200,.85)'}
  ];
  function rand(a,b){return Math.random()*(b-a)+a}
  function p2(x,y){return `${x.toFixed(1)},${y.toFixed(1)}`}
  function shapePath(cx,cy,r,sp){const pts=[];const ang=(Math.PI*2)/sp;for(let i=0;i<sp;i++){const rr=r*(0.7+Math.random()*0.6);const x=cx+Math.cos(i*ang)*rr*(0.8+Math.random()*0.4);const y=cy+Math.sin(i*ang)*rr*(0.8+Math.random()*0.4);pts.push([x,y]);}
    let d=`M ${p2(pts[0][0],pts[0][1])}`;for(let i=1;i<pts.length;i++){const a=pts[(i-1+pts.length)%pts.length],b=pts[i];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;d+=` Q ${p2(a[0],a[1])} ${p2(mx,my)}`;}const a=pts[pts.length-1],b=pts[0];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;d+=` Q ${p2(a[0],a[1])} ${p2(mx,my)} Z`;return d;}
  function spawn(layer){const el=document.createElement('div');el.className='shape hidden';el.style.left=`${rand(6,72)}vw`;el.style.top=`${rand(10,70)}vh`;el.style.width=`${rand(22,36)}vmin`;el.style.height=el.style.width;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');const path=document.createElementNS('http://www.w3.org/2000/svg','path');svg.setAttribute('viewBox','0 0 100 100');svg.appendChild(path);el.appendChild(svg);const c=COLORS[(Math.random()*COLORS.length)|0];path.setAttribute('fill',c.fill);path.setAttribute('stroke',c.stroke);path.setAttribute('d',shapePath(50,50,40,7+(Math.random()*4|0)));el.addEventListener('click',()=>{const url=LINKS[(Math.random()*LINKS.length)|0];window.location.href=url;});layer.appendChild(el);requestAnimationFrame(()=>el.classList.remove('hidden'));
    const morph=()=>{path.setAttribute('d',shapePath(50,50,40,7+(Math.random()*4|0)));const c2=COLORS[(Math.random()*COLORS.length)|0];path.setAttribute('fill',c2.fill);path.setAttribute('stroke',c2.stroke)};const id=setInterval(morph,2600+Math.random()*1200);setTimeout(()=>{el.classList.add('hidden');setTimeout(()=>{el.remove();clearInterval(id)},600)},14000+Math.random()*6000);}
  function run(){const layer=document.querySelector('.shapes-layer');if(!layer) return;setTimeout(()=>spawn(layer),1200);setInterval(()=>{if(document.hidden) return;const alive=layer.querySelectorAll('.shape').length;if(alive<5) spawn(layer)},2000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();