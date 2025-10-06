// public/js/ticker-items.js — Kuratierte Mini‑Apps/Prompts
//
// Dieses Array enthält 30 deutschsprachige Mini‑Apps, die verschiedene
// Anwendungsgebiete der KI abdecken: Recherche, Schreiben, Design,
// Visualisierung, Tipps & Tricks, Eye‑Candy, Kunst, KI‑Potenziale,
// alltägliche Benefits und Operations. Jede Bubble wird von hero‑shapes.js
// zufällig erzeugt und enthält Label, Kurzhinweis, Erklärung, Aktion,
// Eingabe‑Placeholder und den Prompt.

window.__TICKER_ITEMS = [
  {
    label: "Schnelle Recherche",
    hint: "Klick → Thema eingeben",
    explain: "Finde Fakten und Quellen in einem Satz.",
    action: "claude-input",
    placeholder: "Thema oder Frage …",
    prompt: `Recherchiere das Thema prägnant: Nenne drei verlässliche Fakten und je eine Quelle.`
  },
  {
    label: "Marktanalyse",
    hint: "Klick → Branche nennen",
    explain: "Analyse in 3 Punkten mit Trend.",
    action: "claude-input",
    placeholder: "Branche/Produkt …",
    prompt: `Analysiere den Markt: 1. Größe, 2. Haupttrends, 3. Chancen (kompakt).`
  },
  {
    label: "Quellencheck",
    hint: "Klick → Link einfügen",
    explain: "Bewertung der Quelle nach Seriosität.",
    action: "claude-input",
    placeholder: "URL einfügen …",
    prompt: `Bewerte die Seriosität und Relevanz der folgenden Quelle. Gib eine kurze Begründung.`
  },
  {
    label: "Blogpost‑Skelett",
    hint: "Klick → Thema eingeben",
    explain: "Schreibe die Gliederung für einen Blogartikel.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Erstelle eine Gliederung (Einleitung, drei Abschnitte, Fazit) zum genannten Thema.`
  },
  {
    label: "LinkedIn‑Post",
    hint: "Klick → Idee eingeben",
    explain: "Formuliere einen inspirierenden LinkedIn‑Beitrag.",
    action: "claude-input",
    placeholder: "Idee / Nachricht …",
    prompt: `Schreibe einen LinkedIn‑Post (2–3 Sätze), der Fachleute anspricht. Verwende klare Sprache und einen Call‑to‑Action.`
  },
  {
    label: "E‑Mail‑Assistent",
    hint: "Klick → Stichpunkte eingeben",
    explain: "Formuliere höfliche, klare E‑Mails.",
    action: "claude-input",
    placeholder: "Stichpunkte …",
    prompt: `Formuliere aus den Stichpunkten eine höfliche E‑Mail (max. 6 Sätze). Beginne mit einer passenden Anrede und schließe mit einem Dank.`
  },
  {
    label: "Kurzgeschichte",
    hint: "Klick → Thema nennen",
    explain: "Erstelle eine Minigeschichte in vier Sätzen.",
    action: "claude-input",
    placeholder: "Thema oder Ort …",
    prompt: `Schreibe eine kreative Kurzgeschichte in vier Sätzen zum genannten Thema. Beziehe eine überraschende Wendung ein.`
  },
  {
    label: "Landing‑Page‑Layout",
    hint: "Klick → Produkt eingeben",
    explain: "Erzeuge eine Inhaltsstruktur für eine Landing‑Page.",
    action: "claude-input",
    placeholder: "Produkt / Dienst …",
    prompt: `Erstelle ein schematisches Layout für eine Landing‑Page: Header, USP‑Abschnitte, Social Proof und Call‑to‑Action.`
  },
  {
    label: "Logo‑Ideen",
    hint: "Klick → Markenname eingeben",
    explain: "Drei kreative Richtungen für ein Logo.",
    action: "claude-input",
    placeholder: "Markenname …",
    prompt: `Beschreibe drei unterschiedliche Logo‑Konzeptideen für den genannten Namen (Stil, Farbe, Symbolik).`
  },
  {
    label: "Farbpalette",
    hint: "Klick → Stil eingeben",
    explain: "Empfiehlt fünf harmonische Farben.",
    action: "claude-input",
    placeholder: "Stil / Stimmung …",
    prompt: `Schlage eine Farbpalette aus fünf harmonischen Farben für den genannten Stil vor. Nenne die jeweiligen Hex‑Codes.`
  },
  {
    label: "Diagramm‑Text",
    hint: "Klick → Daten beschreiben",
    explain: "Formuliert Beschriftungen für Diagramme.",
    action: "claude-input",
    placeholder: "Welche Daten / Achsen …",
    prompt: `Formuliere Titel und Achsenbeschriftungen für ein Diagramm basierend auf deiner Beschreibung.`
  },
  {
    label: "Folie entwerfen",
    hint: "Klick → Thema nennen",
    explain: "Inhaltliche Struktur einer Präsentationsfolie.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Skizziere die inhaltliche Struktur einer überzeugenden Präsentationsfolie zum angegebenen Thema (Überschrift, Kernpunkte, Visual).`
  },
  {
    label: "Zeitersparnis‑Trick",
    hint: "Klick → Bereich wählen",
    explain: "Kleiner Trick, um Zeit zu sparen.",
    action: "claude-input",
    placeholder: "Arbeitsbereich …",
    prompt: `Nenne einen konkreten Tipp, wie man im genannten Bereich mit KI täglich zehn Minuten spart.`
  },
  {
    label: "Produktivitätshack",
    hint: "Klick → Problem nennen",
    explain: "Tipps für mehr Effizienz im Alltag.",
    action: "claude-input",
    placeholder: "Problem oder Herausforderung …",
    prompt: `Gib einen kurzen Hack, um dieses Problem effizienter zu lösen. Verwende praxisorientierte Tipps.`
  },
  {
    label: "Haiku generieren",
    hint: "Klick → Motiv nennen",
    explain: "Kreiere ein kurzes Haiku.",
    action: "claude-input",
    placeholder: "Thema / Motiv …",
    prompt: `Schreibe ein Haiku (5‑7‑5 Silben) über das genannte Motiv.`
  },
  {
    label: "Meme‑Idee",
    hint: "Klick → Thema nennen",
    explain: "Beschreibung für ein lustiges KI‑Meme.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Beschreibe eine originelle Meme‑Idee zum genannten Thema (Bild + Textbeschreibung).`
  },
  {
    label: "Bildidee",
    hint: "Klick → Konzept nennen",
    explain: "Skizziert ein kreatives Kunstwerk.",
    action: "claude-input",
    placeholder: "Konzept …",
    prompt: `Beschreibe detailliert eine Bildidee (Stil, Elemente, Stimmung) zum genannten Konzept – ideal für Midjourney oder DALL·E.`
  },
  {
    label: "KI‑Poesie",
    hint: "Klick → Thema nennen",
    explain: "Kreative Lyrik.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Verfasse ein kurzes Gedicht (vier Zeilen) über das angegebene Thema im Stil von Rilke.`
  },
  {
    label: "KI im Gesundheitswesen",
    hint: "Klick → Fokus nennen",
    explain: "Praxisbeispiel für KI‑Potenziale.",
    action: "claude-input",
    placeholder: "Fokus (z. B. Diagnostik) …",
    prompt: `Nenne zwei konkrete Beispiele, wie KI den genannten Bereich im Gesundheitswesen verbessert und welche Vorteile sich ergeben.`
  },
  {
    label: "KI in der Bildung",
    hint: "Klick → Fach nennen",
    explain: "Potenziale der KI im Unterricht.",
    action: "claude-input",
    placeholder: "Fach / Thema …",
    prompt: `Erkläre, wie KI den Unterricht in diesem Fach bereichern kann und welche konkreten Tools genutzt werden könnten.`
  },
  {
    label: "Einkaufsplaner",
    hint: "Klick → Anlass nennen",
    explain: "Alltagshelfer zur Optimierung der Einkaufsliste.",
    action: "claude-input",
    placeholder: "Anlass / Mahlzeit …",
    prompt: `Erstelle eine optimale Einkaufsliste für den genannten Anlass, achte auf Nachhaltigkeit und saisonale Produkte.`
  },
  {
    label: "Reise‑Assistent",
    hint: "Klick → Ziel nennen",
    explain: "KI‑gestützte Reiseplanung.",
    action: "claude-input",
    placeholder: "Stadt / Ziel …",
    prompt: `Plane einen Tag in der angegebenen Stadt: Sehenswürdigkeiten, Restaurantempfehlung, Geheimtipp.`
  },
  {
    label: "Haushalt organisieren",
    hint: "Klick → Aufgaben nennen",
    explain: "Planung täglicher Haushaltsaufgaben.",
    action: "claude-input",
    placeholder: "Aufgaben …",
    prompt: `Erstelle einen Wochenplan, um die genannten Aufgaben effizient und gleichmäßig zu verteilen.`
  },
  {
    label: "Prozessoptimierung",
    hint: "Klick → Prozess beschreiben",
    explain: "Verbesserungsvorschläge für Abläufe.",
    action: "claude-input",
    placeholder: "Prozessbeschreibung …",
    prompt: `Analysiere den Prozess und nenne drei konkrete Optimierungsvorschläge (Zeit/Effizienz).`
  },
  {
    label: "KPI‑Dashboard",
    hint: "Klick → Daten nennen",
    explain: "Kernmetriken und Visualisierungen.",
    action: "claude-input",
    placeholder: "Datenquelle / Ziel …",
    prompt: `Definiere die wichtigsten KPIs für die gegebene Datenquelle und schlage eine Dashboard‑Struktur vor.`
  },
  {
    label: "Trendanalyse",
    hint: "Klick → Thema nennen",
    explain: "Recherchiere aktuelle Trends.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Fasse die drei wichtigsten aktuellen Trends zum genannten Thema kurz zusammen.`
  },
  {
    label: "Textzusammenfassung",
    hint: "Klick → Text eingeben",
    explain: "Verdichte lange Texte auf das Wesentliche.",
    action: "claude-input",
    placeholder: "Längerer Text …",
    prompt: `Fasse diesen Text in zwei prägnanten Sätzen zusammen und nenne die Kernbotschaft.`
  },
  {
    label: "User‑Flow‑Entwurf",
    hint: "Klick → Ziel nennen",
    explain: "Skizziert einen Ablauf im UX‑Design.",
    action: "claude-input",
    placeholder: "Ziel / Aktion …",
    prompt: `Erstelle einen einfachen User‑Flow mit drei Schritten, um das Ziel zu erreichen.`
  },
  {
    label: "Daten interpretieren",
    hint: "Klick → Kennzahlen nennen",
    explain: "Helfen, Zahlen zu verstehen.",
    action: "claude-input",
    placeholder: "Kennzahlen …",
    prompt: `Interpretiere die genannten Kennzahlen und gib eine kurze Handlungsempfehlung.`
  },
  {
    label: "Stress reduzieren",
    hint: "Klick → Kontext nennen",
    explain: "Stressabbau‑Tipp mit KI‑Hilfe.",
    action: "claude-input",
    placeholder: "Kontext …",
    prompt: `Gib einen Tipp, wie KI im genannten Kontext hilft, Stress zu reduzieren (z. B. durch Automatisierung).`
  }
];
