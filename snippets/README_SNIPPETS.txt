# Einbau-Snippets für den Streaming-Chat

## 1) Dateien ablegen
- Kopiere `js/chatbox-stream.js` nach `/js/` deiner Seite.
- Kopiere `css/chatbox.css` nach `/css/` deiner Seite.

## 2) In jeder Seite (index.html, ueber-mich.html, projekte.html, kontakt.html)

### a) In den <head> (NACH deiner bestehenden site-frame.css):
<link rel="stylesheet" href="/css/chatbox.css?v=1">

<script>
  // Deine Railway-URL hier eintragen (ohne Slash am Ende):
  window.HOHLROCKS_CHAT_BASE = "https://<dein>.railway.app";
</script>

### b) Direkt vor </body>:
<!-- Chat-Dock (falls nicht bereits vorhanden) -->
<div class="chat-dock">
  <input id="chat-input" placeholder="Frage stellen… (KI, EU AI Act, Projekte)" autocomplete="off"/>
  <button id="chat-send">Senden</button>
</div>
<div id="chat-output" class="chat-output"></div>

<!-- Chat-Client -->
<script src="/js/chatbox-stream.js?v=1"></script>
<script>
  ChatDock.initChatDock({
    inputSel: '#chat-input',
    buttonSel: '#chat-send',
    outputSel: '#chat-output',
    systemPrompt: 'Antworte präzise, deutsch, knapp, Fokus: KI-Management & EU AI Act.'
  });
</script>

## 3) Serverseitig (Railway)
- ALLOWED_ORIGINS: https://hohl.rocks,https://www.hohl.rocks
- OPENAI_API_KEY: (dein Key)
- (optional) OPENAI_MODEL: gpt-4o-mini

## 4) Test
- Seite neu laden (Hard-Reload: Cmd/Ctrl+Shift+R).
- Frage senden → Text erscheint LIVE im Ausgabefeld über dem Dock.
