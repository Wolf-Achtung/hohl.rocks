/* ticker-items.js — curiosity + interactivity + KI-Combos */
(function () {
  window.__TICKER_ITEMS = [
    // — Conversational (GPT)
    { label: "Überrasch mich 🤯", prompt: "Zeig mir in 3 Sätzen etwas Unerwartetes, das KI heute schon gut kann – inkl. 1 Mini-Beispiel + 1 pragmatischem nächsten Schritt." },
    { label: "Mini-Story (5 Wörter)", prompt: "Erzeuge eine spannende Mini-Story mit genau 5 Wörtern. Danach 1 kurzer Titel. Stil: smart, knapp, überraschend." },
    { label: "Haiku zur Fahrt", prompt: "Haiku über nächtliche Highway-Fahrt: Winterluft, Fernlicht, Weite. Ton: ruhig, präzise." },
    { label: "Prompt-Studio 🎛️", prompt: "Nimm meine nächste Frage und forme sie in einen Gold-Standard-Prompt mit Rollenbild, Kontext, Ziel, Leitplanken, Output-Format. Danach 1 Kurz-Version." },
    { label: "Persona-Switch", prompt: "Erkläre dasselbe Thema in 3 Stimmen: (1) C-Level direkt, (2) Coach freundlich, (3) Nerd präzise – je 3 Sätze." },
    { label: "Red-Team Light", prompt: "Formuliere 5 konstruktive Gegenfragen, die Schwächen in meiner Idee aufdecken – freundlich, praxisnah, deutsch." },
    { label: "Quickwins für meinen Job", prompt: "Nenne 5 typische KI-Quickwins für Alltagsarbeit – je 1 Satz + 1 Tool-Hinweis." },

    // — Foto-gestützt (User kann Bild via Foto-Button liefern)
    { label: "Avatar-Briefing (mit Foto)", prompt: "Wenn ich gleich ein Portraitfoto hochlade: Erstelle ein neutrales Avatar-Briefing (6 Stichpunkte) + 3 Ideen für professionelle Wirkung. Wenn kein Bild: erkläre in 2 Sätzen, wie der Upload geht." },
    { label: "Brand-Farben aus Foto", prompt: "Aus meinem Foto: 5 HEX-Farben + Rollen (Primary/Accent), 1 Kontrastwarnung, 1 Mini-Styleguide in 4 Zeilen." },

    // — Client-Aktionen (nur Effekt)
    { label: "Freeze-Frame 📸",       prompt: "!action:freeze",  preview: "Schnappschuss aus dem Video." },
    { label: "Bokeh-Burst ✨",        prompt: "!action:bokeh",   preview: "Sanfte Partikel." },
    { label: "Neon-Pulse 🔆",         prompt: "!action:ring",    preview: "Neon-Impuls." },
    { label: "Whoosh-FX",            prompt: "!action:whoosh",  preview: "Filmischer Swoosh." },
    { label: "Bass-Drop",            prompt: "!action:bass",    preview: "Kurzer V-Twin-Akzent." },
    { label: "Palette aus Video",     prompt: "!action:palette", preview: "5 HEX aus aktuellem Frame." },

    // — KI-Combos: Effekt + Frage (Semikolon trennt Schritte)
    //   Syntax: "!action:<fx>; gpt:<prompt-Text>"
    { label: "Trailer-Teaser 🎬",     prompt: "!action:whoosh; gpt:Schreibe eine 12-Sekunden-Trailer-Hookline zur aktuellen Szene. 1 Satz, poetisch-prägnant, deutsch." },
    { label: "Freeze → Voiceover",    prompt: "!action:freeze; gpt:Formuliere einen 12-Sekunden-Voiceover-Text zur eben fixierten Szene. Ton: ruhig, cineastisch, deutsch." },
    { label: "Palette → 3 UI-Themes", prompt: "!action:palette; gpt:Erzeuge aus 5 HEX-Farben drei UI-Themen (Primary/Secondary/Accent/Surface/Text) mit kurzen Begründungen, deutsch." },
    { label: "Neon-Pulse → Claim",    prompt: "!action:ring; gpt:Erfinde 5 knackige Claims für Wolf Hohl (TÜV-zertifizierter KI-Manager). Stil: seriös, frisch, deutsch." },
    { label: "Bokeh → Mood-Tags",     prompt: "!action:bokeh; gpt:Nenne 12 präzise Mood-Tags zur Szene (stark→schwach), deutsch." },
    { label: "Bass → Micro-Ad",       prompt: "!action:bass; gpt:Schreibe eine 2-Satz-Micro-Ad, die erklärt, wie KI heute konkret hilft – ohne Hype, deutsch." },

    // — Produktiv
    { label: "Meeting-Destillat", prompt: "Zeig mir eine 4-Schritte-Routine, um aus Meetings 6 klare Action-Items zu ziehen – plus 1 Prompt-Schablone." },
    { label: "CSV-Cleanup leicht", prompt: "5 pragmatische Schritte, um CSV-Daten mit KI zu säubern (Dubletten, Ausreißer, fehlende Werte) – inkl. 1 Beispiel-Prompt." },
    { label: "10-Min-Präsentation", prompt: "Workflow: von Stichpunkten zu 6 Folien in 10 Minuten. Struktur + 1 Stil-Prompt (deutsch)." },

    // — Verantwortung
    { label: "Bias-Mini-Check", prompt: "6-Punkte-Checkliste, wie ich KI-Antworten schnell auf Verzerrungen prüfe (deutsch, praxisnah)." },
    { label: "Transparenz-Hinweis", prompt: "3 freundliche Kurz-Statements ‚Hier unterstützt KI‘ – je für Website, E-Mail, Pitch-Deck (deutsch)." },

    // — Wolf-Signatur
    { label: "Wolf fragt zurück", prompt: "Stelle mir 5 raffinierte Rückfragen, mit denen Wolf Hohl (TÜV-zertifizierter KI-Manager) meine Lage schnell versteht." },
    { label: "Trailer-Denke → Text", prompt: "Übertrage Trailer-Dramaturgie auf Text (Hook, Aufbau, Payoff). 5 Sätze + 1 Prompt-Schablone, deutsch." },
    { label: "Signature-Prompt", prompt: "Erzeuge einen wiederverwendbaren Prompt im Stil von Wolf Hohl. Platzhalter {Ziel},{Publikum},{Ton}. Danach 1 Beispiel, deutsch." }
  ];
})();
