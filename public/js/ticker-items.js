// public/js/ticker-items.js — curated micro-apps with clear input expectations

export const __TICKER_ITEMS = [
  {
    label: 'Heute neu',
    explain: 'Tages‑Spotlight aus News',
    placeholder: '—',
    help: 'Automatisch befüllt. Zeigt eine frische, kuratierte Notiz des Tages.',
    action: 'info',
    prompt: 'Tagesnotiz erscheint hier.'
  },

  {
    label: 'Trailer‑Generator (30s, Kino)',
    explain: 'Input: Thema + Zielgruppe → Output: 8–12 Shots',
    placeholder: 'Thema/Produkt + Zielgruppe + Tonalität (z. B. „ruhig, mysteriös“)',
    help: [
      'Eingabe: Thema/Produkt, Zielgruppe, Tonalität, Besonderheiten (z. B. reale Drehs, generativ).',
      'Ausgabe: 8–12 Shots (Dauer, Motiv/Bildsprache, Kamerabewegung, Ton/SFX, Voice‑over‑Zeile).',
      'Format: nummerierte Liste; Gesamtdauer ca. 30 Sek.; Schluss‑Card mit Claim.',
      'Tipp: Nenne 2–3 visuelle Referenzen (Regie/Kamera).'
    ].join('\n'),
    action: 'input',
    prompt: 'Erzeuge einen 30‑Sekunden‑Kino‑Trailer als Shot‑by‑Shot‑Plan. Für jeden Shot gib an: (1) Dauer in Sekunden, (2) Motiv/Bildsprache, (3) Kamerabewegung/Optik, (4) Ton (SFX/Musik), (5) Voice‑over‑Zeile. Schließe mit einer Schluss‑Card (Claim + Website).'
  },

  {
    label: 'TikTok Hook‑Lab',
    explain: 'Input: Produkt/These → Output: 10 Hooks ≤7 Wörter',
    placeholder: 'Produkt/These/Insight in 1–2 Sätzen',
    help: [
      'Eingabe: Produkt/These/Insight + Zielgruppe.',
      'Ausgabe: 10 Hook‑Lines ≤ 7 Wörter – je 1 Satz Begründung.',
      'Muster: Neugier, Kontrast, Zahl, Tabu, Shortcut.',
      'Format: Tabelle oder nummerierte Liste.'
    ].join('\n'),
    action: 'input',
    prompt: 'Gib 10 starke Hooklines (≤ 7 Wörter), sortiert nach Muster (Neugier, Kontrast, Zahl, Tabu, Shortcut). Füge hinter jeder Hook eine 1‑Satz‑Begründung an, warum sie wirkt.'
  },

  {
    label: 'Moodboard‑Prompts',
    explain: 'Input: Stichworte → Output: 6 Art‑Direktion‑Prompts',
    placeholder: 'Stichworte (z. B. „winterlich, neon, ruhig“), Zielästhetik',
    help: [
      'Eingabe: Stichworte + Zielästhetik + Produktionskontext.',
      'Ausgabe: 6 präzise Bild‑Prompts im Stil professioneller Art‑Direktion.',
      'Struktur je Prompt: Motiv • Licht • Optik (Objektiv/Blende) • Farbwelt • Komposition • 3 Stilreferenzen • Negatives.',
      'Tipp: Bühne/Ort angeben (Studio, Nacht, Nebel …).'
    ].join('\n'),
    action: 'input',
    prompt: 'Erzeuge 6 präzise Bild‑Prompts. Struktur: Motiv, Licht, Optik (Objektiv/Blende), Farbwelt, Komposition, 3 Stilreferenzen (Fotograf:in/Künstler:in), Negatives.'
  },

  {
    label: 'Voice‑of‑Brand Destiller',
    explain: 'Input: Beispieltexte → Output: 5 Do / 5 Don’t',
    placeholder: '3–5 kurze Beispieltexte oder Markenbeschreibung',
    help: [
      'Eingabe: Beispieltexte oder Markenbeschreibung.',
      'Ausgabe: 5 Regeln (Do), 5 Verbote (Don’t), 3 Satzmuster, 10 Power‑Wörter, kurzes Style‑Snippet (80–120 Wörter).',
      'Format: Listen + kurzer Beispielabsatz.'
    ].join('\n'),
    action: 'input',
    prompt: 'Destilliere eine Brand Voice: 5 Do, 5 Don’t, 3 typische Satzmuster, 10 Power‑Wörter. Beende mit einem Beispielabsatz (80–120 Wörter) im definierten Stil.'
  },

  {
    label: 'Podcast → Teaser (15 s)',
    explain: 'Input: Thema/Transkript → Output: Skript + Beats',
    placeholder: 'Transkript‑Auszug oder Thema/Take‑away',
    help: [
      'Eingabe: Thema + ggf. kurzer Transkript‑Abschnitt.',
      'Ausgabe: 15‑Sekunden‑Teaser‑Skript: Hook (Cold Open), 2 Punch‑Zeilen, CTA.',
      'Format: mit Timings/Beats (0.0s, 2.5s …).'
    ].join('\n'),
    action: 'input',
    prompt: 'Schreibe ein 15‑Sekunden‑Teaser‑Skript: Hook (Cold Open), 2 Punch‑Zeilen, CTA. Markiere Beat‑Schnitte (0.0s, 2.5s, …).'
  },

  {
    label: 'Spec‑Ad‑Konzept',
    explain: 'Input: Produkt/Insight → Output: 1 Leitidee + 3 Variationen',
    placeholder: 'Produkt/Brand + Insight + Ziel',
    help: [
      'Eingabe: Produkt, Insight, Ziel, Tonalität.',
      'Ausgabe: 1 starke Leitidee (Logline + visuelle Leitmetapher) und 3 Variationen: Social Cut, OOH‑Motiv, Kino‑Version.',
      'Format: kurze Absätze mit klaren Bildern/Aktionen.'
    ].join('\n'),
    action: 'input',
    prompt: 'Entwickle 1 starke Werbeidee (Logline, visuelle Leitmetapher) und 3 Variationen (Social Cut, OOH, Kino). Klare Bilder, keine Floskeln.'
  },

  {
    label: 'Live‑Demo‑Storyboard',
    explain: 'Input: Feature → Output: 6–10 Shots',
    placeholder: 'Funktion/Feature + Ziel der Demo',
    help: [
      'Eingabe: Produkt‑Feature, was beeindruckt werden soll.',
      'Ausgabe: 6–10 Shots, je 1 UI‑Aktion, Kamera/Macro‑Detail, Text‑Overlay.',
      'Zusatz: Liste generativer Video‑Prompts je Shot.'
    ].join('\n'),
    action: 'input',
    prompt: 'Wandle eine Produktdemo in ein filmisches Storyboard: 6–10 Shots, je UI‑Aktion, Kamera & Macro‑Detail, Text‑Overlay. Ergänze zu jedem Shot einen kurzen generativen Videoprompt.'
  },

  {
    label: 'EU‑AI‑Act Übersetzer',
    explain: 'Input: Use‑Case → Output: Einstufung & Pflichten',
    placeholder: 'Use‑Case + Daten + Zielgruppe',
    help: [
      'Eingabe: Use‑Case, Datentypen, Nutzerkreis.',
      'Ausgabe: Einstufung (verboten/hoch/begrenzt/minimal), Pflichten/Lücken, 5 To‑dos.',
      'Format: kurze Listen ohne Juristenjargon. (Kein Rechtsrat.)'
    ].join('\n'),
    action: 'input',
    prompt: 'Ordne den Use‑Case in den EU‑AI‑Act ein (verboten, hoch, begrenzt, minimal). Liste Pflichten/Lücken & 5 To‑dos, klar und knapp (kein Rechtsrat).'
  },

  {
    label: 'Cold‑Open‑Magnet',
    explain: 'Input: Text/These → Output: 12 Start‑Sätze',
    placeholder: 'Thema/These/Story in 1–2 Sätzen',
    help: [
      'Eingabe: Thema/These/Story.',
      'Ausgabe: 12 alternative erste Sätze (Sachlich, Poetisch, Drastisch, Humor, Kontrast …), je 1‑Satz‑Wirkbegründung.'
    ].join('\n'),
    action: 'input',
    prompt: 'Schreibe 12 alternative erste Sätze (Cold Open) in unterschiedlichen Stilen (Sachlich, Poetisch, Drastisch, Humor, Kontrast). Erkläre kurz, warum sie wirken.'
  },

  {
    label: 'Research‑Sprint (30 min)',
    explain: 'Input: Frage → Output: Plan + 8 Quellen',
    placeholder: 'Fragestellung + ggf. Randbedingungen',
    help: [
      'Eingabe: Konkrete Frage + Randbedingungen (Region, Zeitraum, Sprache).',
      'Ausgabe: 30‑Minuten‑Plan (Schritte, Zeit, Kriterium) + 8 hochwertige Quellen (Titel + 1‑Satz‑Nutzen).'
    ].join('\n'),
    action: 'input',
    prompt: 'Erstelle einen 30‑Minuten‑Recherche‑Plan (Schritte, Zeit, Kriterium). Liefere 8 hochwertige Quellen (Titel + 1‑Satz‑Nutzen).'
  },

  {
    label: 'E‑Mail Schärfer Pro',
    explain: 'Input: Entwurf → Output: Betreff, Logik, CTA',
    placeholder: 'E‑Mail‑Entwurf einfügen',
    help: [
      'Eingabe: Bestehender Entwurf.',
      'Ausgabe: Betreff ≤ 6 Wörter, 3 Kernpunkte, 1 klare Bitte mit Deadline, 2 Alternativtermine.',
      'Ton: professionell, freundlich, deutsch.'
    ].join('\n'),
    action: 'input',
    prompt: 'Schärfe die Mail: Betreff ≤ 6 Wörter, 3 Kernpunkte, 1 klare Bitte mit Deadline, 2 Alternativtermine. Ton: professionell, freundlich, deutsch.'
  },

  {
    label: 'Storyboard aus 1 Bild',
    explain: 'Input: Frame‑Beschreibung → Output: 5 Shots',
    placeholder: 'Ein starker Bild‑Frame (Motiv, Licht, Stimmung)',
    help: [
      'Eingabe: Ein starkes Einzelbild bzw. dessen Beschreibung.',
      'Ausgabe: 5‑Shot‑Sequenz (Einstellung, Bewegung, Dramaturgie).',
      'Format: nummerierte Liste, präzise Kameraangaben.'
    ].join('\n'),
    action: 'input',
    prompt: 'Erfinde aus einem beschriebenen Frame eine 5‑Shot‑Sequenz (Einstellung, Bewegung, Dramaturgie). Formatiere als nummerierte Shot‑Liste.'
  },

  {
    label: 'UX‑Microcopy‑Kit',
    explain: 'Input: Flow → Output: Buttons, Tooltips, Fehler',
    placeholder: 'Kurz den Nutzer‑Flow beschreiben',
    help: [
      'Eingabe: Kurze Beschreibung eines UI‑Flows.',
      'Ausgabe: 10 Buttons (≤ 2 Wörter), 6 Tooltips, 5 Fehlermeldungen mit „nächstem Schritt“.',
      'Stil: klar, inklusiv, ohne Jargon.'
    ].join('\n'),
    action: 'input',
    prompt: 'Schreibe prägnante Microcopy für 1 Flow: 10 Buttons (≤ 2 Wörter), 6 Tooltips, 5 Fehlermeldungen mit „nächstem Schritt“. Stil: klar, inklusiv.'
  },

  {
    label: 'One‑Minute‑Plan (Turbo)',
    explain: 'Input: Ziel/Blockade → Output: 5 Mikro‑Schritte',
    placeholder: 'Ziel oder Blockade in 1–2 Sätzen',
    help: [
      'Eingabe: Konkretes Ziel oder Blockade.',
      'Ausgabe: 5 Mikro‑Schritte (< 60 s) für sofortigen Fortschritt, ohne Theorie.'
    ].join('\n'),
    action: 'input',
    prompt: 'Skizziere 5 Mikro‑Schritte (< 60 s) für sofortigen Fortschritt. Nur konkrete Aktionen, keine Theorie.'
  }
];
