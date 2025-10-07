/* /js/ticker-items.js – Gold Microcopy + Prompts
 * action:
 *  - 'claude-input'  → öffnet Texteingabe + sendet Prompt + {userText}
 *  - 'claude'        → sendet Prompt ohne Input (reine Generierung/Demo)
 *  - 'research'      → nutzt deinen Tavily-Research-Endpunkt (falls verdrahtet)
 */

window.__TICKER_ITEMS = [
  {
    label: "E‑Mail‑Assistent",
    hint:  "Aus Stichpunkten wird eine versandfertige Mail. Ton & Länge wählbar.",
    explain: "Füge Stichpunkte ein, wähle ggf. Ton (freundlich/sachlich) und erhalte Betreff + saubere E‑Mail.",
    action: "claude-input",
    placeholder: "Stichpunkte oder grobe Rohfassung …",
    prompt: `Du bist ein E‑Mail‑Schreibassistent. Aus den Stichpunkten des Nutzers erzeugst du:
- prägnanten Betreff,
- fertig formulierter Text (max. 120–180 Wörter),
- klare Abschlusszeile mit CTA.
Wähle automatisch einen geeigneten Ton (freundlich/sachlich/professionell), falls der Nutzer nichts angibt.
Lass Füllwörter weg, strukturiere sauber, niemals Halluzinationen.`
  },
  {
    label: "Texteditor (Korrektur)",
    hint:  "Verbessert Grammatik, Stil & Verständlichkeit – inkl. kurzer Begründungen.",
    explain:"Füge deinen Text ein. Du bekommst eine überarbeitete Version + Mini‑Begründungen je Änderung.",
    action: "claude-input",
    placeholder: "Text hier einfügen …",
    prompt: `Korrigiere Grammatik, Rechtschreibung und Stil. Gib aus:
1) Überarbeitete Fassung.
2) Stichpunktliste „Was verbessert wurde“ (max. 6 Punkte).
Behalte Inhalt & Tonfall bei. Keine Erfindungen.`
  },
  {
    label: "Prompt‑Linter",
    hint:  "Macht schwache Prompts stark: Ziel, Format, Constraints, Negativliste.",
    explain:"Füge deinen Prompt ein. Du erhältst Diagnose + eine optimierte Fassung.",
    action: "claude-input",
    placeholder: "Dein aktueller Prompt …",
    prompt: `Analysiere den Prompt. Liefere:
- Diagnose: Ziel, Format, Constraints, Negativliste (je 1–2 Sätze).
- Optimierte Prompt‑Version (klar, messbar, testbar).
- Mini‑Testfall (Input/Output‑Beispiel).`
  },
  {
    label: "GIST→FACT→CITE",
    hint:  "Ein Satz Kernbotschaft, Fakten in Bullets, dazu Quellen‑Links.",
    explain:"Füge Text/URL ein. Ergebnis: 1‑Satz‑GIST, 5 FACT‑Bullets, 3+ belegte Quellen.",
    action: "claude-input",
    placeholder: "Text oder URL …",
    prompt: `Wenn URL: analysiere Seite. Wenn Text: nutze Text.
Gib aus:
- GIST (ein Satz).
- FACT (5 Bullets mit Zahlen/Daten).
- CITE (mind. 3 Quellen mit Titeln + URLs).
Keine Spekulation, nur Belegbares.`
  },
  {
    label: "Mini‑RAG",
    hint:  "Fragen an einen eingefügten Text/Link – Antwort mit Zitaten.",
    explain:"Füge Text oder Link ein, stelle 1–2 Fragen – du bekommst präzise Antworten mit Quellenzitaten.",
    action: "claude-input",
    placeholder: "Kontext (Text/URL) + Frage(n) …",
    prompt: `Beantworte die Nutzerfrage ausschließlich aus dem gelieferten Kontext. Zitiere wörtliche Belege (Zeilen-/Absatz‑Marker) und gib eine kurze Begründung. Wenn Beleg fehlt: „Nicht belegt“.`
  },
  {
    label: "PRD‑Generator (1‑Pager)",
    hint:  "Aus Idee → schlanker Produkt‑1‑Pager (Problem, Zielgruppe, KPIs, Risiken).",
    explain:"Skizziere Idee + Zielgruppe. Du bekommst einen kompakten 1‑Pager mit KPIs & Risiken.",
    action: "claude-input",
    placeholder: "Idee, Zielgruppe, Nutzen …",
    prompt: `Erzeuge einen prägnanten PRD‑1‑Pager:
- Problem & Zielgruppe,
- Nutzenversprechen,
- Kernfeatures (3–5),
- Nicht‑Ziele,
- Risiken & Annahmen,
- KPIs (3) und Messplan,
- Next Steps (3).
Kurz, umsetzbar, keine Floskeln.`
  },
  {
    label: "5‑Warum‑Coach",
    hint:  "Führt dich in 5 Schritten zur Ursache + Gegenmaßnahmen.",
    explain:"Beschreibe das Problem. Du wirst durch 5 „Warum?“ geführt und erhältst 3 Maßnahmen.",
    action: "claude-input",
    placeholder: "Beschreibe das Problem …",
    prompt: `Moderiere eine 5‑Warum‑Analyse mit dem Nutzer (iterativ, knapp). Am Ende:
- vermutete Kernursache,
- drei konkrete Gegenmaßnahmen (mit Verantwortlichen & Zeithorizont).`
  },
  {
    label: "Entstehungsgeschichte",
    hint:  "Story in 120–180 Wörtern für Landingpage/Deck – mit Hook.",
    explain:"Gib Produkt/Projekt + „Warum“. Du bekommst eine kurze, ehrliche Origin‑Story mit Hook.",
    action: "claude-input",
    placeholder: "Produkt + Anlass/Warum …",
    prompt: `Schreibe eine 120–180‑Wörter‑Origin‑Story:
- starker Eröffnungs‑Hook,
- 1–2 reale Momente/Beobachtungen,
- kein Hype, kein Jargon,
- Schlusssatz mit Blick nach vorn (Einladung/CTA).`
  },
  {
    label: "KI‑Plattformer",
    hint:  "Mini‑Game‑Konzept: Loop, Level, Skill – in 1 Minute verständlich.",
    explain:"Beschreibe Thema/Genre. Du erhältst ein spielbares Loop‑Konzept + 3 Levelideen.",
    action: "claude-input",
    placeholder: "Thema, Ziel, Stimmung …",
    prompt: `Erzeuge ein kompaktes Konzept für ein 2D‑Plattformer‑Mini‑Game:
- Core Loop (3 Sätze),
- Progression (3 Levelideen),
- einzigartige Mechanik,
- Audio/Art‑Stichworte.
Max. 160 Wörter, klar umsetzbar.`
  },
  {
    label: "Sakura Explorer 3D",
    hint:  "Claude generiert Parameter – deine Seite rendert Partikel‑„Sakura“ live.",
    explain:"Klick → live generierte Shader/Partikel‑Parameter (Showcase). Kein Input nötig.",
    action: "claude",
    prompt: `Gib JSON‑Parameter für ein sanftes Partikel‑Sakura‑Preset aus:
{ "petals": 1600, "wind": 0.28, "gravity": 0.06, "bloom": 0.35, "hue": [320,345], "spawn": "pulse", "seed": <int> }
Nur gültiges JSON ohne Kommentare.`
  },
  {
    label: "Synästhesie‑Symphonie",
    hint:  "Text → Audio‑Mapping: Tempo, Skala, Timbre, Layer (für Sound‑Engine).",
    explain:"Gib Stimmung & Bildsprache. Du bekommst Audio‑Parameter für deinen Ambient‑Player.",
    action: "claude-input",
    placeholder: "Stimmung, Bilder, Anlass …",
    prompt: `Liefere JSON‑Audio‑Parameter für Ambient:
{ "bpm": 72, "scale": "D dorian", "pad": "warm", "texture": "granular", "motif": "ascending-3", "reverb": 0.42, "lowpass": 0.18 }
Passe Werte an die Nutzerbeschreibung an. Nur JSON.`
  },
  {
    label: "GIST‑FACT‑CITE (News)",
    hint:  "Tagesnews zu KI – in 60s verstehbar, mit belegten Quellen.",
    explain:"Klick startet Live‑Recherche (Tavily). Ergebnis: GIST, FACTs, CITE.",
    action: "research",
    prompt: "Heute wichtigste KI‑News in DE/EN (Technik/Policy/Market) – GIST, 4–6 FACTs, 3+ Quellen."
  },
  {
    label: "One‑Minute‑Plan",
    hint:  "Aus Ziel → 5 Schritte für die nächsten 60 Minuten.",
    explain:"Schreibe dein Ziel in einem Satz. Du erhältst 5 knackige Schritte (mit Minutenzahl).",
    action: "claude-input",
    placeholder: "Mein Ziel in 60 Minuten …",
    prompt: `Erzeuge einen 5‑Schritte‑Plan (je 10–15 Minuten). Format:
1) <Schritt> — <Minuten> — <Ergebnis>
Zum Schluss: „Definition of Done“ in 1 Satz.`
  }
];
