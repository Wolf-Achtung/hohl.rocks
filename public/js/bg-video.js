const v = document.getElementById('bg-video');
if (v) { v.muted = true; const p = v.play(); if (p && typeof p.catch === 'function') { p.catch(() => {}); } }
