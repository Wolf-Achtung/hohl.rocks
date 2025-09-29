<!-- Datei: public/js/ticker-items.js -->
<script>
/* __TICKER_ITEMS — kuratierte Bubble-Liste (Gold-Standard+)
 * Jedes Item liefert:
 *  - label:    Bubble-Titel
 *  - hint:     kleine Unterzeile in der Bubble
 *  - explain:  1-Zeilen-Erklärung (erscheint im Popup unter dem Titel)
 *  - action:   "claude-input" (mit Eingabefeld) | "research" | "cage-match" | (oder leer = direkt Prompt senden)
 *  - prompt:   der Prompt-Text (wird an Claude gesendet)
 *  - placeholder: optionaler Platzhaltertext fürs Eingabefeld (bei action "claude-input")
 */

window.__TICKER_ITEMS = [
  /* ───────────── Writing & Editing ───────────── */
  {
    label: "Texteditor (Korrektur)",
    hint: "Klick → Text einfügen",
    explain: "Präziser Grammatik‑, Stil‑ und Rechtschreib‑Check mit Begründungen.",
    action: "claude-input",
    placeholder: "Füge deinen Text hier ein …",
    prompt: `Du bist ein präziser, freundlicher Lektor. Korrigiere Grammatik, Rechtschreibung, Zeichensetzung und Stil.
- Erkläre nur wichtige Änderungen knapp (⚑-Bullets).
- Optional: bessere Formulierung, aber in meinem Ton.
- Gib am Ende eine 3‑Punkte‑Checkliste (klarer, kürzer, konkreter).`
  },
  {
    label: "GIST → FACT → CITE",
    hint: "Klick → komprimieren",
    explain: "Ein Satz Kernbotschaft, Stichpunkt‑Fakten, dazu Quellen‑URLs.",
    action: "",
    prompt: `Fasse den nachfolgenden Inhalt in drei Ebenen:
1) GIST (ein präziser Satz).
2) FACTS (3–6 bullets, nummeriert).
3) CITES (saubere, klickbare URLs).`
  },
  {
    label: "One‑Minute‑Plan",
    hint: "Klick → 5 Schritte",
    explain: "5 mikro‑konkrete Schritte, die sofort machbar sind – 60‑Sekunden‑Plan.",
    action: "",
    prompt: `Forme die Aufgabe in 5 konkrete Mikro‑Schritte (≤ 120 Zeichen je Schritt), beginnend mit einem Verb.
Schließe mit “Wenn nur 1 Schritt: …”`
  },
  {
    label: "Meeting‑Kurzprotokoll",
    hint: "Klick → Stichpunkte rein",
    explain: "Aus Stichpunkten werden Beschlüsse, To‑dos (mit Owner & Deadline) und Risiken.",
    action: "claude-input",
    placeholder: "Stichpunkte oder Rohnotizen …",
    prompt: `Strukturiere die Notizen in: Beschlüsse • Aufgaben (Owner, Deadline) • Risiken (mit Mitigation).
Am Ende ein Mini‑Changelog (3 Zeilen).`
  },
  {
    label: "E‑Mail‑Assistent",
    hint: "Klick → Rohfassung rein",
    explain: "Dein Ton, aber klarer: Betreff + 3‑Absatz‑Mail + Varianten (kurz/formell/locker).",
    action: "claude-input",
    placeholder: "Stichpunkte oder grobe Rohfassung …",
    prompt: `Schreibe eine klare E‑Mail.
Liefere: 1) Betreff‑Vorschläge (3) 2) finale Mail (3 Absätze) 3) 2 Kurz‑Varianten (formell/locker).
Nutze meinen Stil.`
  },
  {
    label: "Präsentations‑Struktur",
    hint: "Klick → 10‑20‑30‑Gerüst",
    explain: "Erzeuge eine knackige 10‑20‑30‑Slidestruktur inkl. Sprecher‑Notizen.",
    action: "claude-input",
    placeholder: "Thema, Zielgruppe, Ziel …",
    prompt: `Baue ein 10‑Folie‑Gerüst (Titel, 8 Kern, Schluss) + 1‑Zeilen‑Sprechernotiz je Folie.
Halte dich an 20min‑Taktung; Schließe mit 3 Q&A‑„Trickfragen“.`
  },
  {
    label: "FAQ‑Destillat",
    hint: "Klick → aus Text",
    explain: "Destilliere die 8 häufigsten Fragen + pointierte Antworten.",
    action: "claude-input",
    placeholder: "Füge Produkttext/Website‑Abschnitt ein …",
    prompt: `Extrahiere 8 häufige Fragen + kurze Antworten (≤ 90 Zeichen).
Sortiere von “Einsteiger” → “Pro”.`
  },
  {
    label: "PRD‑Generator (1‑Pager)",
    hint: "Klick → PRD‑Vorlage",
    explain: "Produkt‑1‑Pager mit Ziel, Scopes, Non‑Goals, KPIs, Risiken – in 10 Minuten.",
    action: "claude-input",
    placeholder: "Feature‑Idee, Kontext, Zielnutzer …",
    prompt: `Erstelle einen präzisen PRD‑1‑Pager:
Problem, Ziel, Zielgruppe, Scope (Must/Should/Won’t), KPIs, Risiken+Mitigation, Milestones (3).`
  },
  {
    label: "Stil‑Transfer",
    hint: "Klick → Voice kopieren",
    explain: "Schreibe meinen Text in einem anderen Ton (Marke, Autor, Stil).",
    action: "claude-input",
    placeholder: "Quelltext + gewünschter Stil (z. B. „Apple‑Werbung“)…",
    prompt: `Schreibe den Text neu im gewünschten Stil (Tone‑of‑Voice), ohne Inhalte zu verändern.
Gib am Ende die „Stilformel“ (3 Regeln) aus.`
  },

  /* ───────────── Prompt Engineering ───────────── */
  {
    label: "Prompt‑Linter",
    hint: "Klick → Diagnose",
    explain: "Diagnose: Ziel, Format, Constraints, Negativliste – plus bessere Version.",
    action: "",
    prompt: `Analysiere den Prompt (falls vorhanden) und liefere:
- Diagnose (Ziel/Format/Constraints/Negativliste)
- Verbesserter Prompt (final)
- 3 Mikro‑Varianten (kürzer/konkreter/robuster)`
  },
  {
    label: "Cage‑Match",
    hint: "Klick → 2 Modelle vergleichen",
    explain: "Zwei Modelle antworten – du bekommst eine differenzierte Kurzauswertung.",
    action: "cage-match",
    prompt: `Vergleiche zwei Modelle auf denselben Prompt und bewerte Präzision, Nützlichkeit, Risiken.`
  },
  {
    label: "Quest‑Briefing",
    hint: "Klick → Aufgaben zerlegen",
    explain: "Zerlegt dein Ziel in Sub‑Quests (Who/What/How/Stop/Metric) – sofort abarbeitbar.",
    action: "claude-input",
    placeholder: "Ziel oder Problem …",
    prompt: `Zerlege das Ziel in Sub‑Quests:
Who? What? How? Stop‑Rule? Metric?
Liefern: Roadmap mit 3 Sprints à 3 Tasks.`
  },

  /* ───────────── Research & Strategy ───────────── */
  {
    label: "Live‑Recherche",
    hint: "Klick → Thema eingeben",
    explain: "Fresh‑Web‑Recherche (Tavily) mit Quellen, Bias‑Check & TL;DR.",
    action: "research",
    prompt: `Thema für 10‑Min‑Briefing (mit 6 aktuellen Quellen, kurzer Bias‑Bewertung und TL;DR).`
  },
  {
    label: "Risiko‑Check",
    hint: "Klick → Fallstricke finden",
    explain: "Liste Top‑Risiken + Gegenmaßnahmen; Ampel‑Rating & Frühwarn‑Signale.",
    action: "claude-input",
    placeholder: "Projekt/Idee/Plan …",
    prompt: `Bewerte Risiken (Ampel). Für jedes Rot/Gelb: Gegenmaßnahme + Frühwarn‑Signal.
Schließe mit “Was übersehen wir?” (3 Hypothesen).`
  },
  {
    label: "Use‑Case‑Ideen",
    hint: "Klick → 12 Ideen",
    explain: "12 KI‑Use‑Cases für deine Branche – sortiert nach Impact × Machbarkeit.",
    action: "claude-input",
    placeholder: "Branche/Team/Problemraum …",
    prompt: `Erzeuge 12 Use‑Cases. Tabelle: Titel • Nutzen • Aufwand • Datenquelle • Start in 2 Wochen?
Sortiere nach Impact×Machbarkeit.`
  },
  {
    label: "KPI‑Destillat",
    hint: "Klick → Metriken ableiten",
    explain: "3 North‑Star‑KPIs + 6 Leading‑KPIs – mit Messmethode & Zielwert.",
    action: "claude-input",
    placeholder: "Ziel/Produkt/Team …",
    prompt: `Leite KPIs ab (3 North‑Star, 6 Leading). Gib Messmethode, Intervall, Zielwert, Anti‑Metrik.`
  },

  /* ───────────── Visual & Creative ───────────── */
  {
    label: "Storyboard",
    hint: "Klick → Shotliste",
    explain: "Miniserie aus 8 Shots: Bildidee, Text, Audio – drehfertig.",
    action: "claude-input",
    placeholder: "Thema/Produkt/Hook …",
    prompt: `Erzeuge eine Shotliste (8 Einstellungen): Bild • Text/VO • Audio.
Füge am Ende 3 Alternativ‑Hooks hinzu.`
  },
  {
    label: "Synästhesie‑Symphonie",
    hint: "Klick → Tippen = Audio/Visual",
    explain: "Aus Stichworten werden Visual‑/Audio‑Loops (Parameter für dein Canvas/Shader).",
    action: "claude-input",
    placeholder: "Stichworte (Farbe, Tempo, Stimmung) …",
    prompt: `Gib JSON‑Parameter für Visual‑ und Audio‑Loop aus (keys: hue, speed, waveform, particles, mood).`
  },
  {
    label: "Design‑Brief",
    hint: "Klick → Struktur kopieren",
    explain: "Kristallklarer Design‑Brief inkl. No‑Gos und Erfolgskriterien.",
    action: "claude-input",
    placeholder: "Ziel, Zielgruppe, Markenwerte …",
    prompt: `Erstelle einen präzisen Design‑Brief:
Ziel, Zielgruppe, Markenwerte, Do/Don't, Stilreferenzen (3), Erfolgskriterien, Review‑Plan.`
  },
  {
    label: "Emoji‑Ideator",
    hint: "Klick → 3 Emojis rein",
    explain: "3 Emojis → Kampagnen‑Konzept (Hook, Slogan, CTA, Meme‑Variante).",
    action: "claude-input",
    placeholder: "z. B. 🚀🧠🎯 …",
    prompt: `Deute die 3 Emojis als Kampagne.
Liefere Hook, Slogan (≤ 6 Wörter), CTA, 1 Meme‑Variante, 1 Guerilla‑Idee.`
  },

  /* ───────────── Ops & Enablement ───────────── */
  {
    label: "30‑Tage‑Plan",
    hint: "Klick → Wochenplan",
    explain: "4‑Wochen‑Plan (Ziele, W‑Meilensteine, Risiken, Review‑Rituale).",
    action: "claude-input",
    placeholder: "Ziel/Skill/Projekt …",
    prompt: `Erzeuge einen 4‑Wochen‑Plan: Wochenziele, Meilensteine, Risiken, Review‑Rituale.
Am Ende: “Tag‑1‑Starterkit” (3 Dinge).`
  },
  {
    label: "Agenten‑Plan",
    hint: "Klick → Rollen & Handoffs",
    explain: "Definiere KI‑Agenten‑Rollen inkl. Handoffs, Eingaben, Outputs, Guardrails.",
    action: "claude-input",
    placeholder: "Ziel/Prozess …",
    prompt: `Baue einen Agenten‑Plan: Rollen, Aufgaben, Eingaben, Output‑Format, Handoffs, Guardrails (Compliance/Sicherheit).`
  },
  {
    label: "Onboarding‑SOP",
    hint: "Klick → in 30 Min",
    explain: "Standard‑Onboarding als Checkliste + Templates + Verifikation.",
    action: "claude-input",
    placeholder: "Rolle/Team …",
    prompt: `Erstelle eine Onboarding‑SOP: Checkliste, Lernpfad (3 Module), Templates, Verifikation (Quiz/Task).`
  },

  /* ───────────── Learning & Safety ───────────── */
  {
    label: "Teach‑Me‑Mini",
    hint: "Klick → 5‑Min‑Lektion",
    explain: "Mikro‑Lesson mit Beispiel, Übung, Selbsttest (mit Lösung).",
    action: "claude-input",
    placeholder: "Thema, das ich in 5 Min lernen will …",
    prompt: `Baue eine 5‑Min‑Lektion: Beispiel, Übung, Selbsttest (3 Fragen) mit Lösungen, Mini‑Spickzettel.`
  },
  {
    label: "KI‑Sicherheits‑Quick‑Audit",
    hint: "Klick → Risiken & Fixes",
    explain: "Checkliste für Datenschutz, Halluzination, Prompt‑Injection, Copyright.",
    action: "claude-input",
    placeholder: "System/Prozess beschreiben …",
    prompt: `Erzeuge einen Quick‑Audit:
Risiken (Kurzbegründung), präzise Gegenmaßnahmen, Monitoring‑Hooks, Notfall‑Runbook (3 Schritte).`
  },

  /* ───────────── Produkt & Marketing ───────────── */
  {
    label: "LinkedIn‑Hook",
    hint: "Klick → 5 Varianten",
    explain: "5 starke Hooks inkl. Aufhänger, CTA und “Save/Share”‑Twist.",
    action: "claude-input",
    placeholder: "Thema oder Artikel‑Link …",
    prompt: `Gib 5 Hook‑Varianten (≤ 20 Wörter), je 1 CTA + „Save/Share“‑Twist.
Schließe mit 3 Kommentar‑Fragen.`
  },
  {
    label: "Betreff‑Generator",
    hint: "Klick → 12 Ideen",
    explain: "12 Betreff‑Zeilen (A/B‑Buckets), je 1 Emoji‑Variante und 1 Plain‑Variante.",
    action: "claude-input",
    placeholder: "E‑Mail‑Inhalt oder Ziel …",
    prompt: `Erzeuge 12 Betreffzeilen, gruppiert in 3 A/B‑Buckets (Neugier/Value/Dringlichkeit).
Gib pro Betreff 1 Emoji‑ und 1 Plain‑Variante.`
  },
  {
    label: "Kontrast‑Paar",
    hint: "Klick → 2 Wege + Kriterien",
    explain: "Stelle zwei Optionen gegenüber – Entscheidung nach Kriterien‑Matrix.",
    action: "claude-input",
    placeholder: "Zwei Optionen / Pfade …",
    prompt: `Vergleiche Option A vs. B: Nutzen, Kosten, Risiko, Time‑to‑Value.
Gib eine kompakte Entscheidung + Wenn‑dann‑Regel.`
  },

  /* ───────────── Dev & Data ───────────── */
  {
    label: "Mini‑RAG",
    hint: "Klick → RAG‑Baukasten",
    explain: "Kleines RAG‑Setup (Dateien → JSON‑Chunks, Retrieval‑Plan, Eval‑Prompts).",
    action: "claude-input",
    placeholder: "Datenquelle(n) + Ziel …",
    prompt: `Baue einen Mini‑RAG‑Plan: Chunking‑Strategie, Retrieval‑Pipeline, Negative‑Prompts, Eval‑Prompts, Guardrails.`
  },
  {
    label: "GIST+FACT+CITE (Code)",
    hint: "Klick → Code‑Kurzreview",
    explain: "1‑Satz‑Erklärung, 3 Befunde, 3 Fix‑Snippets (idiomatisch).",
    action: "claude-input",
    placeholder: "Code‑Ausschnitt einfügen …",
    prompt: `Gib 1‑Satz‑Gist, 3 Befunde (mit Fundstelle), 3 idiomatische Fix‑Snippets.
Nicht umformatieren, nur fokussierte Änderungen.`
  }
];
</script>
