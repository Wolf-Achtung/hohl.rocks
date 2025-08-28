/*! analytics-lite.js — DSGVO‑schlankes Event‑Zählwerk ohne Cookies
 * Speicherung in localStorage; optionaler Beacon, falls HOHL_METRICS_URL gesetzt.
 */
(function(){
  'use strict';
  const KEY = 'wolf.analytics.counts';
  const METRICS = (window.HOHL_METRICS_URL || '').trim(); // optional

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(_){ return {}; } }
  function save(obj){ try{ localStorage.setItem(KEY, JSON.stringify(obj)); }catch(_){} }

  function emit(name, data){
    const now = Date.now();
    const counts = load();
    counts[name] = (counts[name]||0) + 1;
    save(counts);
    if (METRICS && navigator.sendBeacon){
      try{
        const payload = JSON.stringify({ name, ts: now, ua: navigator.userAgent, data: data||{} });
        navigator.sendBeacon(METRICS, payload);
      }catch(_){}
    }
  }

  // Public API
  window.AnalyticsLite = { emit, load };

  // Generic hooks (others feuern gezielt selbst)
  window.addEventListener('chat:send', ()=> emit('chat_send'));
  window.addEventListener('chat:done', ()=> emit('chat_done'));
})();
