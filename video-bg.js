(function(){
  const SRC = window.BG_VIDEO_SRC || '/media/desert-drive.mp4';
  const POSTER = window.BG_VIDEO_POSTER || '/media/desert-poster.jpg';
  function ensureBg(){
    if (document.querySelector('.bg-video')) return;
    const wrap = document.createElement('div'); wrap.className='bg-video';
    const v = document.createElement('video');
    v.src=SRC; v.poster=POSTER; v.autoplay=true; v.muted=true; v.loop=true; v.playsInline=true;
    wrap.appendChild(v); document.body.prepend(wrap);
    try{ const key='bgvid:t'; const saved=+sessionStorage.getItem(key)||0;
      v.addEventListener('loadedmetadata',()=>{ if(saved>0 && v.duration) v.currentTime = saved % v.duration; });
      setInterval(()=>{ if(!isNaN(v.currentTime)) sessionStorage.setItem(key, Math.floor(v.currentTime)); }, 3000);
    }catch(e){}
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', ensureBg); else ensureBg();
})();
