/* public/js/ticker-items.js — curated, short & actionable */
window.__TICKER_ITEMS = [
  // ───────────────────── Writing / Editing
  {
    label: "Texteditor (Korrektur)",
    hint: "Klick → Text einfügen & prüfen",
    action: "claude-input",
    placeholder: "Stichpunkte oder Rohfassung …",
    explain: "Du fügst Text ein – Claude korrigiert Grammatik, Stil und erklärt kurz die Änderungen.",
    prompt:
`Du bist mein deutscher Grammatik- und Stil-Editor.
Bitte:
1) korrigiere Rechtschreibung, Zeichensetzung, Grammatik
2) glätte Stil (klar, prägnant, aktiv)
3) zeige wichtige Änderungen kurz begründet.
Antworte in Markdown mit den Blöcken:
- **Korrigierter Text**
- **Wesentliche Änderungen** (Bullets)`
  },
  {
    label: "GIST→FACT→CITE",
    hint: "Klick → Text reinkopieren",
    action: "claude-input",
    placeholder: "Artikel/Auszug einfügen …",
    explain: "Ein Satz Kern, 3 Fakten mit Zahlen, danach Quellen-URLs.",
    prompt:
`Fasse den Text in **1 Satz (GIST)** zusammen.
Gib danach **3 FACT-Bullets** mit Zahlen/Daten.
Füge **CITE** mit den exakten URLs an (wenn vorhanden).`
  },
  {
    label: "Prompt‑Linter",
    hint: "Klick → Prompt einfügen",
    action: "claude-input",
    placeholder: "Eigener Prompt …",
    explain: "Diagnose + Verbesserungsvorschlag zu Ziel, Format, Constraints, Negativliste.",
    prompt:
`Analysiere diesen Prompt:
- Ziel, Output-Format, Constraints, Negativliste
- Risiken/Ambiguitäten
- eine verbesserte Version (kompakt)`
  },

  // ───────────────────── Thinking / Planning
  {
    label: "One‑Minute‑Plan",
    hint: "Klick → 5 konkrete Schritte",
    action: "claude-input",
    placeholder: "Ziel / Aufgabe …",
    explain: "Erzeuge in 60 Sek. einen schlanken 5‑Schritte‑Plan + 1 Start‑Schritt.",
    prompt:
`Erstelle einen knackigen Plan in 5 Schritten.
Jeder Schritt: 1 Zeile, messbar.
Schließe mit **Erster Schritt heute (15 min)**.`
  },
  {
    label: "5‑Warum‑Coach",
    hint: "Klick → Root‑Cause + Lösung",
    action: "claude-input",
    placeholder: "Symptom/Problem …",
    explain: "Guided 5‑Why, danach 1–2 pragmatische Gegenmaßnahmen.",
    prompt:
`Leite mich durch **5‑Warum** (Frage/Antwort im Wechsel).
Danach: wahrscheinlichste Ursache + 2 Gegenmaßnahmen (Low‑Effort).`
  },

  // ───────────────────── Ops / Meeting
  {
    label: "Meeting‑Kurzprotokoll",
    hint: "Klick → Stichpunkte einfügen",
    action: "claude-input",
    placeholder: "Stichpunkte / Notizen …",
    explain: "Aus Notizen werden Entscheid, To‑Dos (RACI), Nächste Schritte.",
    prompt:
`Destilliere: **Entscheide**, **To‑Dos (RACI)**, **Risiken**, **Nächste Schritte (mit Termin)**.
Kurz & klar.`
  },

  // ───────────────────── Product / Design / Marketing
  {
    label: "PRD‑Generator (1‑Pager)",
    hint: "Klick → Idee skizzieren",
    action: "claude-input",
    placeholder: "Problem/Nutzen/Zielgruppe …",
    explain: "Aus einer Idee wird ein PRD‑1‑Pager (Problem, Nutzer, Jobs, Scope, Messung).",
    prompt:
`Erstelle ein **PRD (1‑Pager)**:
- Problem/Nutzen, Zielgruppe, JTBD
- Scope (in/out), Akzeptanzkriterien
- Erfolgsmessung (KPI), Risiken`
  },
  {
    label: "Design‑Brief",
    hint: "Klick → Anforderungen grob",
    action: "claude-input",
    placeholder: "Ziel, Zielgruppe, Look&Feel …",
    explain: "Komprimierter Creative‑Brief inkl. Mood & Edge‑Cases.",
    prompt:
`Forme einen **Design‑Brief**:
- Ziel, Audience, Botschaft
- Stil/Referenzen, Farbwelt, Typo
- Deliverables, Edge‑Cases, Erfolgskriterien`
  },
  {
    label: "LinkedIn‑Hook",
    hint: "Klick → Thema angeben",
    action: "claude-input",
    placeholder: "Thema / Kernaussage …",
    explain: "3 Hook‑Varianten + ein 5‑Satz‑Post, deutsch, ohne Buzzword‑Gulasch.",
    prompt:
`Gib mir 3 **Hook‑Varianten** und 1 **5‑Satz‑Post** (deutsch, prägnant, konkret, ohne Floskeln).`
  },
  {
    label: "Betreff‑Generator",
    hint: "Klick → E‑Mail‑Ziel angeben",
    action: "claude-input",
    placeholder: "Ziel / Kontext …",
    explain: "5 Betreffzeilen mit 2 Stilrichtungen, <50 Zeichen.",
    prompt:
`Erzeuge 5 Betreffzeilen (<50 Zeichen), je 2 Stilrichtungen (seriös/locker).`
  },

  // ───────────────────── Research / Compare
  {
    label: "FAQ‑Destillat",
    hint: "Klick → Quelle/Transkript einfügen",
    action: "claude-input",
    placeholder: "Quelle/Transkript …",
    explain: "Extrahiere 7–10 FAQs + prägnante Antworten, optional Quellen anfügen.",
    prompt:
`Extrahiere **7–10 FAQs** + **prägnante Antworten** aus dem Text.
Wenn vorhanden: kurze Quellenangabe.`
  },
  {
    label: "Research‑Agent",
    hint: "Klick → Live‑Recherche",
    action: "research",
    explain: "Live‑Suche (Tavily) → Kurzreport + 3 verlässliche Quellen.",
    prompt: ""
  },
  {
    label: "Cage‑Match",
    hint: "Klick → Prompt & Modelle wählen",
    action: "cage-match",
    explain: "Modell‑Vergleich A/B mit demselben Prompt.",
    prompt: ""
  },

  // ───────────────────── Fun / Visual
  {
    label: "Sakura Explorer 3D",
    hint: "Klick → Endlos‑Teegarten",
    action: "claude-input",
    placeholder: "Stichworte für die Szene …",
    explain: "Claude erzeugt Parameter – dein Canvas rendert Sakura‑Partikel live.",
    prompt:
`Erzeuge kompakte JSON‑Parameter für eine Sakura‑Partikel‑Szene:
{ density: 0–1, wind: 0–1, hue: [min,max], glow: 0–1, camera: { orbit: deg } }`
  },
  {
    label: "Synästhesie‑Symphonie",
    hint: "Klick → 3 Töne + 1 Gefühl",
    action: "claude-input",
    placeholder: "Gefühl + 3 Töne (z. B. A4, C5, E4) …",
    explain: "Aus Gefühl & Tönen entsteht ein kurzer generativer Clip (Audio/Visual).",
    prompt:
`Mappe Gefühl + Töne auf 10‑Sek‑Generative‑Clip:
- HSL‑Palette (3 Farben)
- 2 Bewegungsmuster (Namen)
- Timing { bpm, envelope }`
  }
];
