/* ticker-items.js — curiosity + interactivity + KI-Combos (Gold-Standard) */
(function () {
  window.__TICKER_ITEMS = [
    // — Conversational (GPT – Basis bleibt)
    { label: "Überrasch mich 🤯", prompt: "Zeig mir in 3 Sätzen etwas Unerwartetes, das KI heute schon gut kann – inkl. 1 Mini-Beispiel + 1 pragmatischem nächsten Schritt." },
    { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach 1 kurzer Titel. Stil: smart, knapp, überraschend." },
    { label: "Haiku zur Fahrt", prompt: "Haiku über nächtliche Highway-Fahrt: Winterluft, Fernlicht, Weite. Ton: ruhig, präzise." },
    { label: "Prompt-Studio 🎛️", prompt: "Nimm meine nächste Frage und forme sie in einen Gold-Standard-Prompt mit Rollenbild, Kontext, Ziel, Leitplanken, Output-Format. Danach 1 Kurz-Version." },
    { label: "Persona-Switch", prompt: "Erkläre dasselbe Thema in 3 Stimmen: (1) C-Level direkt, (2) Coach freundlich, (3) Nerd präzise – je 3 Sätze." },
    { label: "Red-Team Light", prompt: "Formuliere 5 konstruktive Gegenfragen, die Schwächen in meiner Idee aufdecken – freundlich, praxisnah, deutsch." },
    { label: "Quickwins für meinen Job", prompt: "Nenne 5 typische KI-Quickwins für Alltagsarbeit – je 1 Satz + 1 Tool-Hinweis." },

    // — Foto-gestützt (optional)
    { label: "Avatar-Briefing (mit Foto)", prompt: "Wenn ich gleich ein Portraitfoto hochlade: Erstelle ein neutrales Avatar-Briefing (6 Stichpunkte) + 3 Ideen für professionelle Wirkung. Wenn kein Bild: erkläre in 2 Sätzen, wie der Upload geht." },
    { label: "Brand-Farben aus Foto", prompt: "Aus meinem Foto: 5 HEX-Farben + Rollen (Primary/Accent), 1 Kontrastwarnung, 1 Mini-Styleguide in 4 Zeilen." },

    // — Client-Aktionen (nur Effekt)
    { label: "Freeze-Frame 📸",       prompt: "!action:freeze" },
    { label: "Bokeh-Burst ✨",        prompt: "!action:bokeh" },
    { label: "Neon-Pulse 🔆",         prompt: "!action:ring" },
    { label: "Whoosh-FX",            prompt: "!action:whoosh" },
    { label: "Bass-Drop",            prompt: "!action:bass" },
    { label: "Palette aus Video",     prompt: "!action:palette" },

    // — KI-Combos: Effekt + Frage (Semikolon trennt Schritte)
    { label: "Trailer-Teaser 🎬",     prompt: "!action:whoosh; gpt:Schreibe eine 12-Sekunden-Trailer-Hookline zur aktuellen Szene. 1 Satz, poetisch-prägnant, deutsch." },
    { label: "Freeze → Voiceover",    prompt: "!action:freeze; gpt:Formuliere einen 12-Sekunden-Voiceover-Text zur eben fixierten Szene. Ton: ruhig, cineastisch, deutsch." },
    { label: "Palette → 3 UI-Themes", prompt: "!action:palette; gpt:Erzeuge aus 5 HEX-Farben drei UI-Themen (Primary/Secondary/Accent/Surface/Text) mit kurzen Begründungen, deutsch." },
    { label: "Neon-Pulse → Claim",    prompt: "!action:ring; gpt:Erfinde 5 knackige Claims für Wolf Hohl (TÜV-zertifizierter KI-Manager). Stil: seriös, frisch, deutsch." },
    { label: "Bokeh → Mood-Tags",     prompt: "!action:bokeh; gpt:Nenne 12 präzise Mood-Tags zur Szene (stark→schwach), deutsch." },
    { label: "Bass → Micro-Ad",       prompt: "!action:bass; gpt:Schreibe eine 2-Satz-Micro-Ad, die erklärt, wie KI heute konkret hilft – ohne Hype, deutsch." },

    // — Neue Gamechanger-Combos (viel Interaktivität + Nutzen)
    { label: "Freeze → Bildprompt",   prompt: "!action:freeze; gpt:Erzeuge einen präzisen Prompt für ein Fotomotiv, das die eben fixierte Szene stilvoll nachstellt (Kamera, Brennweite, Licht, Stimmung) – deutsch." },
    { label: "Freeze → Shotlist",     prompt: "!action:freeze; gpt:Erstelle eine 6-Shot-Liste für einen 30-Sekunden-Clip, der an der fixierten Szene anschließt. Je Shot: Zweck + Bewegung." },
    { label: "Freeze → 2-Satz-Beschreibung", prompt: "!action:freeze; gpt:Beschreibe die fixierte Highway-Szene in genau 2 Sätzen, jeweils max. 14 Wörter, bildhaft, deutsch." },
    { label: "Freeze → ASCII-Art",    prompt: "!action:freeze; gpt:Erzeuge eine kleine ASCII-Art, die die Szene abstrahiert (max. 15 Zeilen)." },

    { label: "Palette → CSS-Vars",    prompt: "!action:palette; gpt:Leite aus 5 HEX-Farben ein CSS-Variables-Set ab (--primary etc.) inkl. Kurzhinweisen zur Anwendung." },
    { label: "Palette → Poster-Look", prompt: "!action:palette; gpt:Skizziere einen Poster-Stil (Typo, Flächen, Kontrast, Akzente) in 6 Stichpunkten – deutsch." },
    { label: "Palette → Dark/Light",  prompt: "!action:palette; gpt:Mappe jede Farbe auf Dark- und Light-Mode (Text/Surface/Accent) und gib 1 Beispiel-Komponente." },

    { label: "Ring → Hook & CTA",     prompt: "!action:ring; gpt:Formuliere 1 Hook (1 Satz) + 1 CTA (5–7 Wörter) für diese Site – deutsch." },
    { label: "Whoosh → Storyboard",   prompt: "!action:whoosh; gpt:Entwirf ein 3-Panel-Storyboard (Setup, Build, Payoff) für einen 9-Sekunden-Teaser." },
    { label: "Bokeh → Poem-Tag",      prompt: "!action:bokeh; gpt:Schreibe ein kurzes 3-Zeilen-Poem mit 1 prägnantem Hashtag zur Stimmung." },
    { label: "Bass → 10-Wort-Pitch",  prompt: "!action:bass; gpt:Formuliere einen 10-Wort-Pitch für Wolf Hohl, deutsch." },

    // — Multi-Action: Effekte layern + GPT
    { label: "Freeze+Whoosh → Hook",  prompt: "!action:freeze; !action:whoosh; gpt:Erzeuge eine starke Hookline (1 Satz) als Opener für die eingefrorene Szene." },
    { label: "Palette+Ring → Claims", prompt: "!action:palette; !action:ring; gpt:Erfinde 5 Claims, die die Palette stilistisch aufgreifen (deutsch, präzise)." },
    { label: "Bokeh+Bass → Micro-Ad", prompt: "!action:bokeh; !action:bass; gpt:Schreibe eine 2-Satz-Ad, leise episch, deutsch." },
    { label: "Whoosh+Vibrate → CTA",  prompt: "!action:whoosh; !action:vibrate; gpt:Formuliere einen kurzen CTA (max. 7 Wörter) – deutsch." },

    // — Voice & Haptics
    { label: "Sprechen → TL;DR",      prompt: "!action:speak=Kurzfassung kommt.; gpt:Fasse die Kernbotschaft dieser Site in 2 Sätzen zusammen – deutsch." },
    { label: "Vibrate → Nudge",       prompt: "!action:vibrate; gpt:Nenne 3 Next-Steps, wie ich heute in 20 Min mit KI beginne." },

    // — Produktiv & Praxisnah
    { label: "Freeze → UX-Review",    prompt: "!action:freeze; gpt:Leite aus der Szene 5 UX-Heuristiken für Hero-Bereiche ab, je 1 Satz, deutsch." },
    { label: "Freeze → Accessibility",prompt: "!action:freeze; gpt:Nenne 6 barrierearme Text-/Kontrast-Tipps für heroische Videohintergründe." },
    { label: "Whoosh → E-Mail-Hook",  prompt: "!action:whoosh; gpt:Erzeuge 5 Betreffzeilen (deutsch, ≤55 Zeichen), die neugierig machen – seriös, prägnant." },
    { label: "Ring → Notif-Microcopy",prompt: "!action:ring; gpt:Schreibe 5 freundliche Micro-Copys für Erfolg-/Fehler-Mitteilungen (je ≤8 Wörter)." },

    // — Branding & Identity
    { label: "Palette → Namensideen", prompt: "!action:palette; gpt:Erfinde 10 Marken-/Projekt-Namen, die farblich zur Palette passen (deutsch, modern)." },
    { label: "Freeze → Visual Metaphern", prompt: "!action:freeze; gpt:Nenne 8 visuelle Metaphern, die zur Szene passen, inkl. 1 Mini-Einsatzidee." },
    { label: "Bokeh → Tag-Wolke",     prompt: "!action:bokeh; gpt:Baue eine Tag-Wolke mit 16 Schlagworten (Priorität → Gewichtung)." },

    // — Content-Fabriken
    { label: "Freeze → Social-Post",  prompt: "!action:freeze; gpt:Schreibe 1 LinkedIn-Post (max. 3 Sätze) + 3 Hashtags, Ton: professionell, freundlich, deutsch." },
    { label: "Freeze → Caption-Set",  prompt: "!action:freeze; gpt:Erzeuge 6 Short-Captions (≤7 Wörter) für Stories/Reels – deutsch." },
    { label: "Whoosh → Hook-Varianten", prompt: "!action:whoosh; gpt:Gib 7 Hook-Varianten (Listenform), deutsch, klar." },

    // — Lernmomente & Sicherheit
    { label: "Palette → Kontrast-Check", prompt: "!action:palette; gpt:Bewerte die Lesbarkeit (WCAG-Nah) für Text auf Primary/Surface kurz in 5 Punkten, deutsch." },
    { label: "Freeze → Risiko-Check", prompt: "!action:freeze; gpt:Nenne 5 typische KI-Fallstricke bei visuellen Hero-Seiten + je 1 Gegenmaßnahme." },

    // — Wolf-Signatur
    { label: "Trailer-Denke → Prompt", prompt: "!action:ring; gpt:Erstelle eine Prompt-Schablone ‚Trailer-Denke für Text‘ (Hook/Aufbau/Payoff), deutsch." },
    { label: "Signature-Prompt+",     prompt: "!action:whoosh; gpt:Erzeuge einen Signature-Prompt im Stil von Wolf Hohl (TÜV-zertifizierter KI-Manager) mit Platzhaltern {Ziel},{Publikum},{Ton},{Belege}." }
  ];
})();
