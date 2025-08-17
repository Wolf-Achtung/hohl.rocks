// bubble-random-nav.js — Long-Press auf Bubbles => Random-Navigation
// Bewahrt Single-Klick für Sound. Fügt Long-Press (650ms) für Navigation hinzu.
(() => {
  const DESTS = ['/projekte.html','/ueber-mich.html','/kontakt.html'];
  const LONG_PRESS_MS = 650;

  function currentPath() { return location.pathname.replace(/\/+/g,'/').replace(/\/?$/, ''); }
  function randomDest() {
    const cur = currentPath();
    const pool = DESTS.filter(d => !cur.endsWith(d));
    return pool[(Math.random() * pool.length) | 0] || DESTS[0];
  }

  window.addEventListener('DOMContentLoaded', () => {
    const shapes = Array.from(document.querySelectorAll('.shape'));
    shapes.forEach(el => {
      let timer = null, longPressed = false;

      el.addEventListener('pointerdown', () => {
        longPressed = false;
        timer = setTimeout(() => {
          longPressed = true;
          // Optional kurzer Glow
          el.classList.add('playing');
          setTimeout(() => { window.location.href = el.dataset.nav || randomDest(); }, 120);
        }, LONG_PRESS_MS);
      });

      const cancel = () => { if (timer) clearTimeout(timer); };
      el.addEventListener('pointerup', cancel);
      el.addEventListener('pointerleave', cancel);

      // Klick nach Long-Press unterdrücken, damit der Sound-Klick nicht zusätzlich feuert
      el.addEventListener('click', (ev) => {
        if (longPressed) { ev.stopPropagation(); ev.preventDefault(); }
      }, true);
    });
  });
})();
