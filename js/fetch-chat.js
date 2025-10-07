/*! fetch-chat.js – Simplified Chat Fetcher (JSON-only)
 *
 *  Dieses Modul stellt die Funktion `window.fetchAnswer(prompt)` bereit. Sie
 *  verwendet ausschließlich den JSON-Endpoint des Backends (POST /chat)
 *  und extrahiert aus der Antwort nur den eigentlichen Text. Die Ausgabe
 *  wird als `chat:delta`- und `chat:done`-Event dispatcht, so dass das
 *  bestehende Spotlight-System die Antwort anzeigen kann. Diese Lösung
 *  vermeidet Server-Sent Events und damit etwaige Streaming-/JSON‑Fehler.
 */
(function(){
  'use strict';

  /**
   * Sendet eine Frage an den Backend-Endpoint `/chat` und dispatcht die
   * Antwort als Chat-Ereignis. Bei Fehlern wird eine Fehlermeldung
   * dispatcht. Der Parameter `prompt` kann auch ein leerer String sein.
   *
   * @param {string} prompt Der Inhalt der Anfrage.
   */
  function fetchAnswer(prompt){
    // Falls kein Chat-Pane vorhanden ist, trotzdem Events dispatchen
    var pane = document.querySelector('#chat-output');
    if (pane){
      pane.innerHTML = '';
      var streamEl = document.createElement('div');
      streamEl.className = 'stream';
      pane.appendChild(streamEl);
    }
    try {
      window.dispatchEvent(new CustomEvent('chat:send'));
    } catch(_) {}

    // Basis-URL bereinigen (nur Trailing Slashes entfernen)
    var base = String(window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/, '');
    var url  = base + '/chat';
    // Frage im Cache prüfen. Wir nutzen sessionStorage für einfache Caching, damit
    // wiederholte Prompts innerhalb einer Session schneller beantwortet werden.
    var cacheKey = 'qaCache:' + encodeURIComponent(String(prompt || ''));
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        // Bereits vorhandene Antwort: sofort dispatchen
        var cachedAnswer = cached;
        window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: cachedAnswer } }));
        window.dispatchEvent(new CustomEvent('chat:done'));
        return;
      }
    } catch(_){ /* ignore cache errors */ }
    var body = { message: prompt || '' };
    // Wenn ein Systemprompt gesetzt ist, anhängen
    if (window.WOLF_SYSTEM_PROMPT) body.systemPrompt = String(window.WOLF_SYSTEM_PROMPT);
    // Standardmodell, wenn nicht anders angegeben
    body.model = (window.DEFAULT_GPT_MODEL || 'gpt-4o-mini');

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'cors'
    }).then(function(res){
      return res.json();
    }).then(function(json){
      var text = '';
      if (json){
        if (typeof json.answer === 'string' && json.answer) text = json.answer;
        else if (typeof json.text === 'string' && json.text) text = json.text;
        else if (typeof json.message === 'string' && json.message) text = json.message;
        else if (typeof json.content === 'string' && json.content) text = json.content;
        else {
          // Fallback: versuche, aus bekannten Feldern zu lesen oder JSON zu stringifizieren
          text = JSON.stringify(json);
        }
      }
      try {
        // Im Cache speichern
        sessionStorage.setItem(cacheKey, text);
      } catch(_){ /* ignore */ }
      try {
        window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: text } }));
        window.dispatchEvent(new CustomEvent('chat:done'));
      } catch(_) {}
    }).catch(function(err){
      var msg = 'Fehler: ' + (err && err.message ? err.message : String(err));
      try {
        window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: msg } }));
        window.dispatchEvent(new CustomEvent('chat:done'));
      } catch(_) {}
    });
  }

  // Im globalen Namespace registrieren
  window.fetchAnswer = fetchAnswer;
})();