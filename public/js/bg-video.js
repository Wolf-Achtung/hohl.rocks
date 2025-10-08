// public/js/bg-video.js — ensure background video plays or degrade gracefully
// - Autoplay muted should work on modern browsers. If the source is missing or
//   playback fails, we hide the <video> and keep a subtle gradient background.

(function () {
  const vid = document.getElementById('bg-video');
  if (!vid) return;

  // Try to play once the document is visible
  const tryPlay = async () => {
    try {
      await vid.play();
    } catch (e) {
      // Will retry on first pointer/keydown
    }
  };

  if (document.visibilityState === 'visible') tryPlay();
  else document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryPlay();
  }, { once: true });

  // Unlock on first user gesture (some browsers require this even if muted)
  const unlock = async () => {
    try { await vid.play(); } catch {}
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  const fallback = () => {
    vid.style.display = 'none';
    // stage already has a solid bg via CSS; nothing else to do
  };

  vid.addEventListener('error', fallback);
  vid.addEventListener('stalled', fallback);
  vid.addEventListener('abort', fallback);
})();
