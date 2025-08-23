/* ticker-items.js — curiosity + interactivity for the Aktuell-Ticker */
(function () {
  window.__TICKER_ITEMS = [
    // ——— Conversational (GPT) ———
    { label: "Überrasch mich 🤯", prompt: "Zeig mir etwas Unerwartetes, das KI heute schon gut kann – in 3 Sätzen, mit einem kleinen Beispiel.", preview: "Kleine Demo, große Wirkung." },
    { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach ein kurzer Titel. Ton: smart, knapp, überraschend.", preview: "Fünf Wörter, ein Plot." },
    { label: "Haiku zur Fahrt", prompt: "Schreibe ein kurzes Haiku über eine nächtliche Highway-Fahrt, Winterluft, Fernlicht, Weite. Ton: ruhig, präzise.", preview: "Drei Zeilen Highway-Luft." },
    { label: "Erklär’s mir einfach", prompt: "Erkläre mir ein aktuelles KI-Thema (deiner Wahl) zuerst extrem einfach in 2–3 Sätzen, dann normal, dann nerdy (je 2 Sätze).", preview: "einfach → normal → nerdy" },
    { label: "KI-Mythos: Halluziniert?", prompt: "Entkräfte den Mythos 'KI halluziniert immer und ist unzuverlässig' in 3 Sätzen. Nenne 2 pragmatische Gegenmaßnahmen.", preview: "Mythos freundlich entkräften." },
    { label: "KI-Mythos: Klau-Maschine?", prompt: "Entkräfte den Mythos 'GenAI ist nur Copy&Paste' in 3 Sätzen. Ergänze 1 sinnvollen Usecase mit kleinem Prompt.", preview: "Fair & faktisch." },
    { label: "Kleinstes Experiment (24h)", prompt: "Entwirf mir ein 24-Stunden-KI-Pilotexperiment mit Hypothese, Setup, Erfolgskriterium, Aufwand < 2h. Bulletpoints, konkret.", preview: "Heute anfangen – ohne Drama." },

    // ——— Foto-gestützt (wenn Nutzer will) ———
    { label: "Avatar-Briefing (mit Foto)", prompt: "Wenn ich gleich ein Portraitfoto hochlade: Formuliere ein neutrales Avatar-Briefing in 6 Stichpunkten (ohne Bewertungen), inkl. 3 Ideen für passende professionelle Wirkung.", preview: "Erst Foto, dann Briefing." },
    { label: "Brand-Farben aus Foto", prompt: "Wenn ich gleich ein Bild hochlade: Nenne 5 Farb-Namen (Hex) aus dem Bild, gib 2 Einsatzideen (UI/Text/Fläche) und 1 Kontrastwarnung.", preview: "Palette aus deinem Bild." },

    // ——— Interaktiv (Client-Effekte, kein GPT) ———
    { label: "Freeze-Frame 📸",       prompt: "!action:freeze",  preview: "Schnappschuss aus dem Highway-Video." },
    { label: "Bokeh-Burst ✨",        prompt: "!action:bokeh",   preview: "Kurz glühende Partikel im Raum." },
    { label: "Neon-Pulse 🔆",         prompt: "!action:ring",    preview: "Sanfter Neonring-Impuls." },
    { label: "Whoosh-FX",            prompt: "!action:whoosh",  preview: "Filmischer Swoosh (WebAudio)." },
    { label: "Bass-Drop",            prompt: "!action:bass",    preview: "Kurze V-Twin-artige Bass-Akzente." },
    { label: "Palette aus Video",     prompt: "!action:palette", preview: "5 HEX-Farben aus dem aktuellen Frame." }
  ];
})();
