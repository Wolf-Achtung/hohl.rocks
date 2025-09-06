/*
 * ticker-filters.js — Kategorie-Filter für den Ticker
 *
 *  Dieses Skript initialisiert die Kategorie‑Filterleiste und setzt
 *  `window.currentTickerCategory`, wenn ein Filter ausgewählt wird. Es
 *  markiert den aktiven Filter optisch und löst einen Ticker-Rebuild
 *  aus. Die Filter-Leiste befindet sich im DOM unter #ticker-filters.
 */
(function(){
  'use strict';
  function init(){
    const bar = document.getElementById('ticker-filters');
    if(!bar) return;
    bar.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('button');
      if(!btn) return;
      const cat = btn.dataset.cat || '';
      // Setze die globale Kategorie (leer = alle)
      window.currentTickerCategory = cat || null;
      // Aktiven Button markieren
      bar.querySelectorAll('button').forEach(b=>{
        if(b === btn) b.classList.add('active'); else b.classList.remove('active');
      });
      // Ticker neu aufbauen
      try { window.Ticker?.rebuild?.(); window.Ticker?.resume?.(); } catch(e){}
    });
  }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();