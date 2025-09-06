/* ticker-filters.js — Kategorie-Filter für den Ticker */
(function(){
  'use strict';
  function init(){
    const bar = document.getElementById('ticker-filters'); if(!bar) return;
    bar.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('button'); if(!btn) return;
      const all = bar.querySelectorAll('button'); all.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      window.currentTickerCategory = btn.getAttribute('data-cat')||'';
      try{ window.Ticker?.rebuild?.(); window.Ticker?.resume?.(); }catch(e){}
    });
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init, {once:true});
})();