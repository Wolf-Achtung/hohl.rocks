// public/js/ticker-items.js
export const __TICKER_ITEMS = [
  {
    label: "E‑Mail‑Assistent",
    explain: "Grobe Stichpunkte rein → perfekte, freundliche E‑Mail raus – mit Ton & Zielgruppe.",
    placeholder: "Stichpunkte oder grobe Rohfassung …",
    action: "input",
    prompt: `Du bist ein präziser E-Mail-Redakteur. Schreibe aus den Notizen eine klare E-Mail.
Ton bitte: freundlich, prägnant, deutsch. 
Wenn nötig: Betreff vorschlagen, 1 Call-to-Action, 1 höfliche Abschlussformel.
Text: {{INPUT}}`
  },
  {
    label: "LinkedIn‑Post",
    explain: "Aus einer Idee 3 knackige Post-Varianten (Hook/Body/CTA), dazu 5 Hashtags.",
    placeholder: "Thema, Kernbotschaft, Ziel (Reichweite/Recruiting/Authority) …",
    action: "input",
    prompt: `Du bist Social-Copy-Pro. Erstelle 3 LinkedIn-Post-Varianten (Hook/Body/CTA) + 5 Hashtags.
Stil: menschlich, konkret, kein Marketing-Blabla. Text: {{INPUT}}`
  },
  {
    label: "One‑Minute‑Plan",
    explain: "In 60 Sekunden von Idee zu 5 konkreten nächsten Schritten.",
    placeholder: "Projekt/Problem + Ziel …",
    action: "input",
    prompt: `Du bist Umsetzungs-Coach. 
Gib 5 konkrete, kleine nächste Schritte (mit Aufwand/Impact). Kontext: {{INPUT}}`
  },
  {
    label: "Texteditor (Korrektur)",
    explain: "Grammatik/ Stil schärfen, aber deine Stimme erhalten. Erklärt Änderungen verständlich.",
    placeholder: "Füge hier deinen Text ein …",
    action: "input",
    prompt: `Du bist Lektor. Korrigiere Grammatik, Stil und Verständlichkeit.
Gib zuerst die verbesserte Version, danach Stichpunkte mit Begründung der Änderungen.
Text: {{INPUT}}`
  },
  {
    label: "GIST → FACT → CITE",
    explain: "1 Satz Essenz → 3–5 Fakten → 2–3 zitierfähige Quellen (Links).",
    placeholder: "Thema/Artikel/Notizen …",
    action: "input",
    prompt: `Strukturiere wie folgt:
GIST (1 Satz), FACTS (3–5 Bulletpoints), CITE (2–3 Quellen mit URL).
Thema: {{INPUT}}`
  },
  {
    label: "Prompt‑Linter",
    explain: "Diagnose für bessere Prompts: Ziel/Format/Constraints/Negativliste – mit Vorschlagen.",
    placeholder: "Dein aktueller Prompt …",
    action: "input",
    prompt: `Analysiere diesen Prompt nach Ziel, Format, Constraints, Negativliste.
Schlage 2 bessere Prompt-Varianten vor (eine kurz, eine präzise). Prompt: {{INPUT}}`
  },
  {
    label: "Mini‑RAG",
    explain: "Baustein, um eigene FAQ/Docs zu befragen (Checkliste & Struktur).",
    placeholder: "Kurze Beschreibung deines Dokuments/FAQ …",
    action: "input",
    prompt: `Gib eine knappe Anleitung, wie ich ein Mini-RAG aufbaue (Dateien, Embeddings, Abfragen).
Passe es an meinen Kontext an: {{INPUT}}`
  },
  {
    label: "Sakura Explorer 3D",
    explain: "Kreativprompt für kurze 3D‑Trails (Shader‑Parameter) – generiert Variationen.",
    placeholder: "Stimmung, Farben, Bewegung …",
    action: "input",
    prompt: `Gib 4 alternative Parametermixe (je 1 Zeile) für eine sanfte 3D‑Partikel/Sakura-Szene.
Jede Zeile: seed, hue, drift, swirl, bloom, life (kurz). Kontext: {{INPUT}}`
  },
  {
    label: "Research‑Agent (Live)",
    explain: "Kompakte Web‑Recherche mit Quellen, seriös & sachlich.",
    placeholder: "Fragestellung + was genau herausfinden? …",
    action: "input",
    prompt: `Führe eine kompakte Recherche durch (seriöse Quellen, deutsch).
Struktur: Ergebnis-Kernaussage (2–3 Sätze), Bullets, 2–4 Quellen mit URL. Thema: {{INPUT}}`
  },
  {
    label: "Stil‑Transfer",
    explain: "Schreibe deinen Text im Stil von „präzise & warm“ oder „sachlich & knapp“.",
    placeholder: "Dein Text + Wunschstil …",
    action: "input",
    prompt: `Schreibe den Text in dem gewünschten Stil neu. Ggf. Beispiele für passende Formulierungen.
Text+Stil: {{INPUT}}`
  },
  {
    label: "PRD‑Generator (1‑Pager)",
    explain: "Ein Produkt‑1‑Pager mit Problem, Ziel, Nutzen, KPIs, Risiken.",
    placeholder: "Idee, Zielgruppe, grobe Lösung …",
    action: "input",
    prompt: `Erzeuge einen 1‑Pager (Problem, Ziel, Nutzen, KPIs, Risiken, Nächste Schritte).
Kontext: {{INPUT}}`
  },
  {
    label: "FAQ‑Destillat",
    explain: "Mach aus langen Beschreibungen eine verständliche FAQ (10 Fragen/Antworten).",
    placeholder: "Thema/Produkt/Leistung …",
    action: "input",
    prompt: `Erzeuge 10 prägnante FAQ‑Paare (Frage+Antwort, deutsch, laienverständlich).
Thema: {{INPUT}}`
  },
  {
    label: "Use‑Case‑Ideen",
    explain: "Für dein Team/Branche 7 smarte KI‑Use‑Cases mit Aufwand/Impact.",
    placeholder: "Team/Branche/Tools …",
    action: "input",
    prompt: `Liste 7 Use‑Cases für {{INPUT}} (je Aufwand/Impact kurz einschätzen).`
  },
  {
    label: "Risiko‑Check",
    explain: "Kurzcheck AI‑Risiken (Bias, Datenschutz, Halluzinationen) + pragmatische Gegenmaßnahmen.",
    placeholder: "Kontext: Datenarten, Outputs, Stakeholder …",
    action: "input",
    prompt: `Kurzer AI‑Risiko‑Check (Bias, Datenschutz, Halluzinationen, IP).
Gib konkrete Gegenmaßnahmen und Verantwortlichkeiten. Kontext: {{INPUT}}`
  },
  {
    label: "Kontrast‑Paar",
    explain: "Zeige 2 Wege zum Ziel (Lean vs. Deluxe) – mit Kosten/Nutzen/Tempo.",
    placeholder: "Ziel/Feature/Projekt …",
    action: "input",
    prompt: `Zeige 2 Alternativen (Lean vs. Deluxe) als Tabelle (Schritte, Dauer, Kosten, Risiko). Thema: {{INPUT}}`
  },
  {
    label: "5‑Warum‑Coach",
    explain: "Symptom → Ursache (5 Why) → kleine Experimente gegen die Wurzel.",
    placeholder: "Problem kurz beschreiben …",
    action: "input",
    prompt: `Führe eine 5‑Why‑Kausalkette durch und schlage 3 kleine Experimente vor. Problem: {{INPUT}}`
  },
  {
    label: "Entstehungsgeschichte",
    explain: "Schreibe eine kurze Projekt‑Entstehungsstory mit Wendepunkt & Lerneffekten.",
    placeholder: "Projekt/Produkt/Erfahrung …",
    action: "input",
    prompt: `Erzeuge eine kurze Entstehungsstory (1–2 Absätze) mit klarer Moral. Thema: {{INPUT}}`
  },
  {
    label: "KI‑Plattformer",
    explain: "3 Levels: Anfänger → Fortgeschritten → Pro – jeweils 3 Aufgaben zum Üben.",
    placeholder: "Thema/Skill …",
    action: "input",
    prompt: `Erstelle 3 Lernstufen mit je 3 Aufgaben & kurzem Leitfaden. Thema: {{INPUT}}`
  },
  {
    label: "Meeting‑Kurzprotokoll",
    explain: "Stichpunkte rein → strukturierte Notiz mit Entscheidungen & Action Items.",
    placeholder: "Stichpunkte, Teilnehmer, Datum …",
    action: "input",
    prompt: `Formatiere ein Meeting-Kurzprotokoll (Themen, Entscheidungen, Aufgaben mit Owner+Date). Stichpunkte: {{INPUT}}`
  },
  {
    label: "Synästhesie‑Symphonie",
    explain: "Aus 5 Wörtern kurze Audio/Visual‑Stimmungen (Parameter‑Vorschlag).",
    placeholder: "5 Stichworte zu Stimmung …",
    action: "input",
    prompt: `Erzeuge 4 Zeilen an Parametern (tempo, texture, grain, chord, color), inspiriert von {{INPUT}}.`
  },
  {
    label: "Storyboard",
    explain: "Aus einer Idee 6‑Bild‑Storyboard (Shot‑Liste) – klar und filmisch.",
    placeholder: "Kurzidee/Produkt/Ort …",
    action: "input",
    prompt: `Erstelle eine 6‑Shot‑Shotliste mit Bildinhalt, Kamera, Licht, Text-Overlay. Idee: {{INPUT}}`
  },
  {
    label: "Quest‑Briefing",
    explain: "Gamifizierter Arbeitsauftrag in 5 Schritten + XP/Belohnung.",
    placeholder: "Aufgabe + Ziel + Rahmen …",
    action: "input",
    prompt: `Schreibe ein kurzes Quest-Briefing in 5 Schritten (XP, kleine Belohnung). Kontext: {{INPUT}}`
  },
  {
    label: "Konzept‑PR",
    explain: "Presse‑Pitch in 7 Sätzen (Wert, neu, Beweis, Call‑to‑Action).",
    placeholder: "Innovation/Projekt …",
    action: "input",
    prompt: `Erzeuge einen PR‑Pitch in 7 Sätzen (Wert, Neuheit, Beweis, CTA). Thema: {{INPUT}}`
  },
  {
    label: "Subject‑Generator",
    explain: "5 Betreff‑Zeilen (A/B/C/D/E) – kurz, konkret, neugierig.",
    placeholder: "E‑Mail‑Thema, Zielgruppe …",
    action: "input",
    prompt: `Gib 5 Betreffzeilen (max. 55 Zeichen), deutsch, variierend. Thema: {{INPUT}}`
  },
  // Daily Spotlight Slot (wird dynamisch ersetzt)
  {
    label: "Heute neu",
    explain: "Tägliches Micro‑Topic (News → Kurzformat).",
    placeholder: "—",
    action: "info",
    prompt: `Tagesaktuelle Kurzinfo (wird serverseitig über /api/daily befüllt).`
  }
];
