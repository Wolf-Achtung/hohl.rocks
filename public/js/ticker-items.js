// public/js/ticker-items.js
// Kurze, produktive „Mini-Apps“ für die Bubbles. Jede hat:
// label, hint, explain, action ('claude-input' | 'research' | 'cage-match' | ''),
// prompt (an Claude), optional placeholder (nur bei 'claude-input').

window.__TICKER_ITEMS = [

  // ──────────────────────────────────────────────── Writing / Edit
  {
    label: 'Texteditor (Korrektur)',
    hint: 'Klick → Text einfügen',
    explain: 'Korrigiert Grammatik/Stil und erklärt die wichtigsten Änderungen.',
    action: 'claude-input',
    placeholder: 'Rohtext oder Absatz hier einfügen …',
    prompt: `Du bist ein präziser deutschsprachiger Lektor.
Analysiere den folgenden Text und liefere:
1) KORREKTUR (verbesserter Text, gleiche Intention)
2) HINWEISE (stichpunktartig: Grammatik, Stil, Wortwahl; max. 6 Punkte)
3) OPTION (wenn sinnvoll: knackigere Alternative, 1–2 Sätze)
Nur deutsch.`
  },
  {
    label: 'One‑Minute‑Plan',
    hint: 'Klick → 5 Schritte',
    explain: 'Formt ein Ziel in 5 konkrete, kleine Schritte (≈1 Minute je Schritt).',
    action: 'claude-input',
    placeholder: 'Ziel oder Aufgabe (z. B. „Landingpage verbessern“) …',
    prompt: `Erstelle einen 5‑Schritte‑Plan, der in ≈5–7 Minuten umsetzbar ist.
Format:
• Ziel (1 Satz)
• Schritte (5 kurze, klare ToDos; jeweils 1 Minute)
• Mini‑Check (3 Erfolgskriterien)`
  },
  {
    label: 'GIST → FACT → CITE',
    hint: 'Klick → komprimieren',
    explain: 'Ein Satz Kernaussage, 5 Fakten, Quellen/URLs am Ende.',
    action: 'claude-input',
    placeholder: 'Thema/Absatz/URL …',
    prompt: `Erzeuge
• GIST: 1 Satz Kernaussage
• FACT: 5 kurze Bullet‑Fakten
• CITE: verlässliche Quellen/Links (wenn vorhanden)
Nur präzise, ohne Füllwörter.`
  },
  {
    label: 'Meeting‑Kurzprotokoll',
    hint: 'Klick → Stichpunkte rein',
    explain: 'Dreht Notizen in Entscheidungen, Aufgaben, Nächste Schritte.',
    action: 'claude-input',
    placeholder: 'Stichpunkte oder Transkript‑Ausschnitt …',
    prompt: `Fasse als Kurzprotokoll:
• Entscheidungen (max. 5)
• Aufgaben (Wer → Was → Bis wann)
• Risiken/Offene Punkte (max. 5)
• Nächste Schritte (3) – sehr konkret`
  },
  {
    label: 'Prompt‑Linter',
    hint: 'Klick → Prompt verbessern',
    explain: 'Diagnose + 2 überarbeitete Varianten (präzise & belastbar).',
    action: 'claude-input',
    placeholder: 'Dein aktueller Prompt …',
    prompt: `Analysiere den Prompt nach Ziel, Format, Constraints, Negativliste.
Liefere:
1) Diagnose (max. 6 Bullet‑Findings)
2) V1 (klar & kurz)
3) V2 (robust, mit Qualitäts-Checks)
4) Testfrage, um die Qualität vor dem Senden zu prüfen`
  },
  {
    label: 'Kontrast‑Paar',
    hint: 'Klick → 2 Wege + Kriterien',
    explain: 'Zwei gegensätzliche Ansätze inkl. Auswahl‑Kriterien.',
    action: 'claude-input',
    placeholder: 'These/Problem (z. B. „Blog vs. YouTube starten?“) …',
    prompt: `Erstelle ein Kontrast‑Paar:
• Weg A (Vorteile, Risiken)
• Weg B (Vorteile, Risiken)
• Kriterien‑Tabelle (5 Kriterien, Bewertung A/B)
• Empfehlung (1–2 Sätze, begründet)`
  },

  // ──────────────────────────────────────────────── Growth / Comm
  {
    label: 'Betreff‑Generator',
    hint: 'Klick → 10 Varianten',
    explain: '10 E‑Mail‑Betreffs in 3 Stilen: Nutzen, Frage, Neugier.',
    action: 'claude-input',
    placeholder: 'Kernbotschaft / Angebot / Zielgruppe …',
    prompt: `Erzeuge 10 E‑Mail‑Betreffzeilen in 3 Stilen:
• Nutzenorientiert (4)
• Frage‑Form (3)
• Neugier/Pattern‑Break (3)
Jeweils ≤ 42 Zeichen; kein Clickbait, präzise.`
  },
  {
    label: 'LinkedIn‑Hook',
    hint: 'Klick → 10 Hooks',
    explain: 'Erste Zeile, die Scroll stoppt – ohne Buzzwords.',
    action: 'claude-input',
    placeholder: 'Thema/Takeaway …',
    prompt: `Erzeuge 10 LinkedIn‑Hooks (erste Zeile).
Kriterien: konkret, überraschend, ohne Floskeln, ≤ 16 Wörter.`
  },
  {
    label: 'Design‑Brief (Kurz)',
    hint: 'Klick → Briefing‑Gerüst',
    explain: 'Gerüst für ein klares Design‑/Kreativ‑Briefing.',
    action: 'claude-input',
    placeholder: 'Projekt/Ziel/Deadline …',
    prompt: `Erstelle einen kompakten Design‑Brief:
• Ziel & Ergebnis
• Stimmung/Marke (3 Adjektive)
• Muss‑Elemente (Logo, Farben, Formate)
• Grenzen/No‑Gos
• 3 Beispiel‑Referenzen (Beschreibung)
• Erfolgskriterien`
  },
  {
    label: 'Style‑Transfer',
    hint: 'Klick → Stil ändern',
    explain: 'Formt deinen Text in den gewünschten Stil um.',
    action: 'claude-input',
    placeholder: 'Text + gewünschter Stil (z. B. „klar & trocken“) …',
    prompt: `Übertrage den Stil des folgenden Textes in den gewünschten Ziel‑Stil.
Liefere: (A) Re‑Write, (B) 3 Begründungen für die Änderungen.`
  },

  // ──────────────────────────────────────────────── Strategy / Ops
  {
    label: 'Use‑Case‑Ideen',
    hint: 'Klick → 12 Ideen',
    explain: '12 KI‑Use‑Cases für Branche/Job – sortiert nach Wirkung/Einfachheit.',
    action: 'claude-input',
    placeholder: 'Branche/Job/Stack (z. B. Mittelstand, Vertrieb, HubSpot) …',
    prompt: `Erzeuge 12 KI‑Use‑Cases als Tabelle:
• Titel | Nutzen | Aufwand (S/M/L) | Risiko (L/M/H) | 1. Schritt
Sortiere nach hohem Nutzen & geringem Aufwand.`
  },
  {
    label: '30‑Tage‑Plan',
    hint: 'Klick → Tagesfahrplan',
    explain: 'Ein realer Lern‑ oder Umsetzungsplan in 30 kleinen Etappen.',
    action: 'claude-input',
    placeholder: 'Skill/Projekt (z. B. „Prompt‑Engineering Basics“) …',
    prompt: `Baue einen 30‑Tage‑Plan:
• Wöchentliche Ziele (4)
• Tages‑Etappen (30 × 10–20 Min)
• Mini‑Meilensteine (wöchentlich)
• Minimal‑Ergebnis am Ende`
  },
  {
    label: 'Risiko‑Check',
    hint: 'Klick → Top‑Risiken',
    explain: 'Risiken, Eintrittswahrscheinlichkeit, Gegenmaßnahmen.',
    action: 'claude-input',
    placeholder: 'Vorhaben/Entscheidung …',
    prompt: `Erstelle eine Risiko‑Tabelle:
• Risiko | Eintritt (niedrig/mittel/hoch) | Auswirkung | Gegenmaßnahme | Frühindikator
Schließe mit 3 Sofort‑Checks.`
  },
  {
    label: 'PRD‑Generator (1‑Pager)',
    hint: 'Klick → PRD‑Gerüst',
    explain: 'Einseitiges Product‑Requirements‑Dokument – fokussiert.',
    action: 'claude-input',
    placeholder: 'Produkt/Feature + Ziel …',
    prompt: `Erzeuge ein PRD auf 1 Seite:
• Problem, Ziel, Zielgruppe
• Nutzer‑Stories (max. 5)
• Annahmen & Grenzen
• Metriken (3)
• Risiken & Offene Fragen (max. 5)`
  },
  {
    label: 'KI‑Policy (Skizze)',
    hint: 'Klick → Unternehmensrahmen',
    explain: 'Leitplanken für sicheren KI‑Einsatz (kurz & praktisch).',
    action: 'claude-input',
    placeholder: 'Unternehmens‑Kontext (Branche, Größe, Daten) …',
    prompt: `Entwirf eine kurze KI‑Policy:
• Erlaubt / Verboten
• Umgang mit personenbezogenen/streng vertraulichen Daten
• Modell‑/Tool‑Freigaben
• Qualitätssicherung & Audit‑Trails
• Schulung & Support`
  },

  // ──────────────────────────────────────────────── Learn / Coach
  {
    label: '5‑Warum‑Coach',
    hint: 'Klick → Ursachen finden',
    explain: 'Leitet dich durch 5‑Warum bis zur Wurzelursache.',
    action: 'claude-input',
    placeholder: 'Problem/Aktuelle Beobachtung …',
    prompt: `Führe mich durch 5‑Warum. Stelle nacheinander Fragen (max. 5 Ebenen),
führe einen Ursachen‑Baum und schließe mit 3 Gegenmaßnahmen.`
  },
  {
    label: 'Root‑Cause‑Skizze',
    hint: 'Klick → Fehlerbild analysieren',
    explain: 'Verdichtet Symptome → Hypothesen → Tests.',
    action: 'claude-input',
    placeholder: 'Symptome/Logs/Beobachtungen …',
    prompt: `Erstelle:
• Symptom‑Liste
• 3–5 Hypothesen (mit Plausibilität)
• Schnelltest je Hypothese (geringer Aufwand)
• Entscheidung: welche 2 Tests zuerst`
  },
  {
    label: 'Onboarding‑Mini‑Guide',
    hint: 'Klick → in 10 Minuten startklar',
    explain: 'Schnelleinführung für Tool/Team/Projekt, nur das Wesentliche.',
    action: 'claude-input',
    placeholder: 'Tool/Team/Projektname + Zielgruppe …',
    prompt: `Erzeuge einen 10‑Minuten‑Onboarding‑Guide:
• Warum/Was | 3 wichtigste Funktionen
• Erstkonfiguration (Schrittfolge)
• 3 häufige Fehler & Vermeidung
• Checkliste Start‑bereit`
  },
  {
    label: 'Persona‑Destillat',
    hint: 'Klick → Zielbild konkret',
    explain: 'Verdichtet Zielgruppe in 1 Seite mit Jobs‑to‑be‑Done.',
    action: 'claude-input',
    placeholder: 'Zielgruppe/Segment …',
    prompt: `Erstelle eine knappe Persona (1 Seite):
• JTBD (Top 3)
• Schmerzpunkte (Top 5)
• Kaufkriterien (5)
• Medien/Touchpoints (5)
• Satz: „Sie entscheidet sich, wenn …“`
  },

  // ──────────────────────────────────────────────── Research / Live
  {
    label: 'Research‑Agent',
    hint: 'Klick → Live‑Recherche mit Quellen',
    explain: 'Frage eingeben → Tavily + Claude → Quellen & Kurzfazit.',
    action: 'research',
    prompt: '' // wird im Frontend per Prompt-Dialog abgefragt
  },
  {
    label: 'FAQ‑Destillat',
    hint: 'Klick → 10 FAQs',
    explain: 'Schürft aus Text/Links die 10 häufigsten Fragen & Antworten.',
    action: 'claude-input',
    placeholder: 'Produkt/Service/URL/Material …',
    prompt: `Erzeuge 10 FAQs (Frage + präzise Antwort).
Wenn Links gegeben, nutze sie zur Ableitung; keine Spekulation.`
  },

  // ──────────────────────────────────────────────── Mail / Docs
  {
    label: 'E‑Mail‑Assistent',
    hint: 'Klick → Stichpunkte rein',
    explain: 'Rohstichpunkte in prägnante Mail mit Betreff + Call‑to‑Action.',
    action: 'claude-input',
    placeholder: 'Stichpunkte oder grobe Rohfassung …',
    prompt: `Forme die Stichpunkte in eine klare E‑Mail:
• Betreff (3 Varianten)
• Mailtext (kurz, 2–3 Absätze)
• Call‑to‑Action (1 Satz)
• PS (wenn sinnvoll)`
  },
  {
    label: 'Bild‑Alt‑Texte',
    hint: 'Klick → SEO‑Alttexte',
    explain: 'Erzeugt 8 Alt‑Texte aus deiner knappen Bildbeschreibung.',
    action: 'claude-input',
    placeholder: 'Motiv, Kontext, Ziel‑Keyword …',
    prompt: `Erzeuge 8 prägnante Alt‑Texte (≤ 110 Zeichen) aus der Beschreibung.
Variation: informativ, emotional, transaktional, neutral.`
  },

  // ──────────────────────────────────────────────── Visual / Fun (dein VisualLab)
  {
    label: 'Synästhesie‑Symphonie',
    hint: 'Klick → Tippen → Audio/Visual',
    explain: 'Claude erzeugt Parameter; dein Canvas rendert live (Wow‑Moment).',
    action: 'visual-synesthesia',
    prompt: `Liefere JSON für ein Audio‑Visual‑Preset:
{ "mood":"dawn|drive|rain", "tempo": 72..126, "palette":["#..","#..","#.."], "pulse":0.2..0.9 }`
  },
  {
    label: 'Sakura Explorer 3D',
    hint: 'Klick → Endlos‑Teegarten',
    explain: 'Parametereingabe → Shader/Canvas generiert die Szene.',
    action: 'visual-sakura',
    prompt: `Gib JSON‑Parameter für Sakura‑Shader zurück:
{ "bloom":0..1,"wind":0..1,"petals":60..180,"twinkle":0..1 }`
  },

  // ──────────────────────────────────────────────── Compare / Lab
  {
    label: 'Cage‑Match',
    hint: 'Klick → Prompt & Modelle wählen',
    explain: 'Zwei Modelle gegeneinander – gleiche Aufgabe, direkte Vergleichsansicht.',
    action: 'cage-match',
    prompt: ''
  },

  // ──────────────────────────────────────────────── Mini‑RAG / Cite
  {
    label: 'Mini‑RAG',
    hint: 'Klick → RAG‑Baukasten',
    explain: 'Frage + 3–8 URLs/Notizen → Antwort mit Zitaten.',
    action: 'claude-input',
    placeholder: 'Frage + (optional) Quellen/URLs in Zeilen …',
    prompt: `Wenn Quellen enthalten sind: beantworte die Frage NUR daraus und zitiere wörtlich mit URL+Absatz‑Hinweis.
Sonst: gib eine saubere, kurze Antwort und markiere [Keine Quellen übergeben].`
  },

  // ──────────────────────────────────────────────── Micro‑helpers
  {
    label: 'Kurz‑Checkliste',
    hint: 'Klick → 7 Punkte',
    explain: 'Schnelle 7‑Punkte‑Checkliste zu deinem Thema.',
    action: 'claude-input',
    placeholder: 'Thema/Output (z. B. „Landingpage‑Hero“) …',
    prompt: `Erzeuge eine 7‑Punkte‑Checkliste (kurz, messbar formuliert).`
  },
  {
    label: 'Mini‑Story‑Hook',
    hint: 'Klick → 5 Zeilen',
    explain: '5‑Zeilen‑Story mit Spannungsbogen, ready für Social.',
    action: 'claude-input',
    placeholder: 'Aussage/Produkt/Insight …',
    prompt: `Schreibe eine 5‑Zeilen‑Mini‑Story:
1 Aufhänger, 2 Konflikt, 3 Wendung, 4 Lösung, 5 Outcome (Zahl/Beleg).`
  }

];
