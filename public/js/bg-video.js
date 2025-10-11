const v = document.getElementById('bg-video');
if (v) {
  v.muted = true;
  const tryPlay = () => {
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };
  v.addEventListener('canplay', tryPlay, { once:true });
  v.addEventListener('loadeddata', tryPlay, { once:true });
  v.addEventListener('error', () => {
    console.warn('[bg-video] failed to load', v.error);
    document.body.classList.add('no-video');
  });
  setTimeout(tryPlay, 500);
}
