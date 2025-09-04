/* js/ticker-items.js — Items + Combos */
(function () {
  window.__TICKER_ITEMS = [
    { label: "Überrasch mich 🤯", prompt: "Zeig mir in 3 Sätzen etwas Unerwartetes, das KI heute schon gut kann – inkl. 1 Mini-Beispiel + 1 pragmatischem nächsten Schritt." },
    { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach 1 kurzer Titel. Stil: smart, knapp, überraschend." },
    { label: "Haiku zur Fahrt", prompt: "Haiku über nächtliche Highway-Fahrt: Winterluft, Fernlicht, Weite. Ton: ruhig, präzise." },
    { label: "Prompt-Studio 🎛️", prompt: "!action:promptstudio" },

    { label: "Freeze-Frame 📸", prompt: "!action:freeze" },
    { label: "Bokeh-Burst ✨",  prompt: "!action:bokeh" },
    { label: "Neon-Pulse 🔆",   prompt: "!action:ring" },
    { label: "Palette aus Video", prompt: "!action:palette" },

    { label: "Trailer-Teaser 🎬",     prompt: "!action:whoosh; gpt:Schreibe eine 12-Sekunden-Trailer-Hookline zur aktuellen Szene. 1 Satz, poetisch-prägnant, deutsch." },
    { label: "Freeze → Voiceover",    prompt: "!action:freeze; gpt:Formuliere einen 12-Sekunden-Voiceover-Text zur eben fixierten Szene. Ton: ruhig, cineastisch, deutsch." },
    { label: "Palette → 3 UI-Themes", prompt: "!action:palette; gpt:Erzeuge aus 5 HEX-Farben drei UI-Themen (Primary/Secondary/Accent/Surface/Text) mit kurzen Begründungen, deutsch." },

    /* 🎵 Melody */
    { label: "Ambient START (Hopkins)", prompt: "!action:melody=start:hopkins" },
    { label: "Ambient STOP",            prompt: "!action:melody=stop" },
    { label: "Tempo +8%",               prompt: "!action:melody=tempo:+8" },
    { label: "Tempo −10%",              prompt: "!action:melody=tempo:-10" },
    { label: "Mood: dawn",              prompt: "!action:melody=mood:dawn" },
    { label: "Mood: drive",             prompt: "!action:melody=mood:drive" },
    { label: "Seed 7",                  prompt: "!action:melody=seed:7" },
    { label: "Seed 99",                 prompt: "!action:melody=seed:99" },
    { label: "Ambient GPT-Plan",        prompt: "!action:melody=gpt:neon winter highway" },

    /* Klarere Fragen */
    { label: "Persona-Switch 🧠",   prompt: "Wechsle in die Persona »TÜV-KI-Manager & Trailer-Stratege«. Beantworte meine nächste Frage kurz: 1 Zahl, 1 Beispiel, 1 nächster Schritt." },
    { label: "Red-Team-Check 🛡️",  prompt: "Überprüfe die letzte Antwort kritisch: Risiken, Annahmen, Trade-offs. Nenne 3 Gegenargumente + 1 Prüfplan." },
    { label: "Meeting-Destillat ⏱️", prompt: "Destilliere die letzten 5 Chat-Nachrichten: 1) Was zählt (max. 5 Bulletpoints) 2) Was fehlt 3) 10-Minuten-Aktion." }
  ];
})();
