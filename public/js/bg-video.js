// File: public/js/bg-video.js
const v = document.getElementById('bg-video');
if (v) { v.muted = true; const p = v.play(); if (p?.catch) p.catch(() => {}); }
