Desert Audio Pack – Generative WebAudio
========================================

Inhalt
------
- audio-generative.js   → Ambient Pad + Wind + Doppler Whoosh, komplett generativ (keine Dateien)
- audio-generative.css  → Stil für den Sound-Toggle
- README.txt            → diese Datei

Einbindung
----------
1) Dateien in dein Webroot legen (z. B. neben index.html).
2) In deinem HTML (am Ende von <body>):
   <link rel="stylesheet" href="audio-generative.css">
   <script defer src="audio-generative.js"></script>

Funktion
--------
- Der Button „Sound: Off/On“ wird automatisch unten links eingefügt.
- Beim ersten User-Interaktions-Event wird das Audio initialisiert (Autoplay-Policy).
- Ein harmonischer, distanzierter, aber präsenter Ambient-Pad-Sound + leises Windrauschen laufen in Loop.
- Beim Klick auf Elemente mit der Klasse .shape wird ein kurzer Doppler-Whoosh getriggert.

Feintuning
----------
- In audio-generative.js kannst du CFG.pad / CFG.wind / CFG.whoosh anpassen (Lautstärken, Filter, Zeiten).
- Für andere Seiten-Stimmungen kannst du rootHz, intervals oder Filter-Cutoffs variieren.
