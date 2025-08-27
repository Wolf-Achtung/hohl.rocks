/* ticker-items.js — Melody-Sektion + Combos (melody2) */
(function () {
  window.__TICKER_ITEMS = [
    { label: "Überrasch mich 🤯", prompt: "Zeig mir in 3 Sätzen etwas Unerwartetes, das KI heute schon gut kann – inkl. 1 Mini-Beispiel + 1 pragmatischem nächsten Schritt." },
    { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach 1 kurzer Titel. Stil: smart, knapp, überraschend." },
    { label: "Haiku zur Fahrt", prompt: "Haiku über nächtliche Highway-Fahrt: Winterluft, Fernlicht, Weite. Ton: ruhig, präzise." },
    { label: "Prompt-Studio 🎛️", prompt: "Nimm meine nächste Frage und forme sie in einen Gold-Standard-Prompt mit Rollenbild, Kontext, Ziel, Leitplanken, Output-Format. Danach 1 Kurz-Version." },

    { label: "Freeze-Frame 📸", prompt: "!action:freeze" },
    { label: "Bokeh-Burst ✨",  prompt: "!action:bokeh" },
    { label: "Neon-Pulse 🔆",   prompt: "!action:ring" },
    { label: "Palette aus Video", prompt: "!action:palette" },

    { label: "Trailer-Teaser 🎬", prompt: "!action:whoosh; gpt:Schreibe eine 12-Sekunden-Trailer-Hookline zur aktuellen Szene. 1 Satz, poetisch-prägnant, deutsch." },
    { label: "Freeze → Voiceover", prompt: "!action:freeze; gpt:Formuliere einen 12-Sekunden-Voiceover-Text zur eben fixierten Szene. Ton: ruhig, cineastisch, deutsch." },
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
    { label: "Palette → Ambient + Claim", prompt: "!action:palette; !action:melody=gpt:farben der aktuellen Szene; gpt:Erfinde 3 kurze Claims, die zur generierten Ambient-Stimmung passen (deutsch)." }
  
    /* Klarere Fragen */
    { label: "Persona‑Switch 🧠", prompt: "Wechsle in die Persona »TÜV‑zertifizierter KI‑Manager & Trailer‑Stratege«. Beantworte meine nächste Frage in 3 knackigen Sätzen mit 1 Zahl, 1 Beispiel und 1 nächstem Schritt." },
    { label: "Red‑Team‑Check 🛡️", prompt: "Überprüfe die letzte Antwort kritisch: Wo sind blinde Flecken, Risiken oder Annahmen? Nenne 3 Gegenargumente und einen Prüfplan." },
    { label: "Meeting‑Destillat ⏱️", prompt: "Destilliere die letzten 5 Chat‑Nachrichten in 3 Bullet‑Points »Was zählt – Was fehlt – Nächste 10‑Minuten‑Aktion«." },
    { label: "Avatar‑Briefing aus Foto", prompt: "!action:palette; gpt:Erzeuge aus der angezeigten Farbpalette ein neutrales Avatar‑Briefing in 6 Stichpunkten (Stil, Licht, Hintergrund, Pose, Kleidung, CI‑Kontext)." },
    { label: "Palette → Claims", prompt: "!action:palette; gpt:Leite aus den 5 HEX‑Farben 3 prägnante Claims (max. 6 Wörter) ab und skizziere je 1 passende UI‑Theme‑Idee (Primary/Secondary/Accent/Surface/Text)." }
];
})();