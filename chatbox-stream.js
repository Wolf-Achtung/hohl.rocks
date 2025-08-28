/*
 * chatbox-stream.js (Root) — delegiert an js/chatbox-stream.js
 *
 * Diese Datei existiert lediglich als Proxy, um sicherzustellen, dass
 * ältere Imports ("/chatbox-stream.js") weiterhin funktionieren. Sie lädt
 * das eigentliche Modul aus dem Unterordner „js“ nach und exportiert
 * nichts. Wenn Sie eine neuere Version nutzen, importieren Sie bitte
 * direkt /js/chatbox-stream.js.
 */
(function(){
  const script = document.createElement('script');
  script.src = '/js/chatbox-stream.js?v=1';
  document.currentScript && document.currentScript.parentNode.insertBefore(script, document.currentScript);
})();