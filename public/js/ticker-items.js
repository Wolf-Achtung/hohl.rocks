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
  ,
  // ── Zusätzliche kreative Mini‑Apps, um die Vielfalt der KI zu zeigen ──
  {
    label: "Songschmied",
    hint: "Klick → Thema eingeben",
    explain: "Komponiere einen Songtext mit Refrain und Akkorden.",
    action: "claude-input",
    placeholder: "Thema oder Stil …",
    prompt: `Schreibe einen kurzen Songtext (Refrain und zwei Zeilen Strophe) zum genannten Thema und gib passende Akkorde in Klammern an.`
  },
  {
    label: "Traumdeuter",
    hint: "Klick → Traum beschreiben",
    explain: "Symbolische Deutung deiner Träume.",
    action: "claude-input",
    placeholder: "Ich träume, dass …",
    prompt: `Interpretiere den beschriebenen Traum symbolisch und erkläre, was er über die aktuelle Lebenssituation aussagen könnte.`
  },
  {
    label: "Filmszene",
    hint: "Klick → Situation nennen",
    explain: "Dramatische Szene mit Dialogen und Kameraführung.",
    action: "claude-input",
    placeholder: "Ort / Situation …",
    prompt: `Schreibe eine kurze Filmszene (3–4 Sätze) mit Dialogen, Kameraanweisungen und einer überraschenden Wendung für die genannte Situation.`
  },
  {
    label: "Emoji‑Gedicht",
    hint: "Klick → Begriff nennen",
    explain: "Dichte mit Emojis.",
    action: "claude-input",
    placeholder: "Begriff …",
    prompt: `Formuliere ein Zweizeiler-Gedicht über den genannten Begriff ausschließlich mit Emojis (max. 10 Zeichen pro Zeile).`
  },
  {
    label: "Mindmap erstellen",
    hint: "Klick → Thema nennen",
    explain: "Strukturiere dein Thema als Mindmap.",
    action: "claude-input",
    placeholder: "Oberthema …",
    prompt: `Erstelle eine Mindmap für das Thema und nenne vier Hauptzweige sowie je zwei Unterpunkte.`
  },
  {
    label: "DIY‑Anleitung",
    hint: "Klick → Wunschprojekt nennen",
    explain: "Bauanleitung aus Alltagsmaterialien.",
    action: "claude-input",
    placeholder: "Was soll gebaut werden? …",
    prompt: `Erstelle eine Schritt-für-Schritt-DIY-Anleitung für das genannte Projekt aus gängigen Haushaltsmaterialien.`
  },
  {
    label: "Zutaten‑Rezept",
    hint: "Klick → Zutaten eingeben",
    explain: "Kochen mit Resten.",
    action: "claude-input",
    placeholder: "Zutaten (Komma getrennt) …",
    prompt: `Schlage ein leckeres Rezept vor, das die angegebenen Zutaten verwendet, und beschreibe die Zubereitung in kurzen Schritten.`
  },
  {
    label: "Workout‑Plan",
    hint: "Klick → Ziel nennen",
    explain: "20‑Minuten-Workout ohne Geräte.",
    action: "claude-input",
    placeholder: "Ziel (z. B. Rücken stärken) …",
    prompt: `Erstelle einen 20‑minütigen Trainingsplan ohne Geräte für das genannte Ziel (inkl. Dauer pro Übung und kurze Beschreibung).`
  },
  {
    label: "Meditationsskript",
    hint: "Klick → Stimmung nennen",
    explain: "Geführte Meditation für mehr Gelassenheit.",
    action: "claude-input",
    placeholder: "Stimmung / Thema …",
    prompt: `Schreibe ein 2‑minütiges geführtes Meditationsskript zum genannten Thema mit beruhigenden Bildern und sanften Anweisungen.`
  },
  {
    label: "Comic‑Idee",
    hint: "Klick → Thema nennen",
    explain: "Konzipiere einen Drei‑Panel‑Comic.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Beschreibe eine 3‑Panel-Comicgeschichte zum angegebenen Thema: gib je Panel die Handlung und den Dialog kurz an.`
  },
  {
    label: "Rap-Vers",
    hint: "Klick → Thema nennen",
    explain: "Reim dich reich.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Schreibe zwei Rap-Versen über das angegebene Thema im Stil der 1990er Jahre und reime das jeweils letzte Wort jeder Zeile.`
  },
  {
    label: "Product Tagline",
    hint: "Klick → Produkt eingeben",
    explain: "Catchy Slogan gesucht.",
    action: "claude-input",
    placeholder: "Produkt / Marke …",
    prompt: `Kreiere drei einprägsame Taglines für das genannte Produkt; jede max. 8 Wörter, deutsch und emotional.`
  },
  {
    label: "Podcast‑Skript",
    hint: "Klick → Thema nennen",
    explain: "Podcast in 5 Minuten.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Skizziere ein 5‑minütiges Podcast-Skript zum angegebenen Thema: Einleitung, drei Abschnitte, Abschluss.`
  },
  {
    label: "Werbespot",
    hint: "Klick → Produkt nennen",
    explain: "Drehbuch für 30 Sekunden.",
    action: "claude-input",
    placeholder: "Produkt / Dienst …",
    prompt: `Schreibe einen 30‑sekündigen Werbespot mit Voiceover-Text und kurzer Szenenbeschreibung für das genannte Produkt.`
  },
  {
    label: "Lernplan",
    hint: "Klick → Kompetenz nennen",
    explain: "Plan für neue Skills.",
    action: "claude-input",
    placeholder: "Skill / Thema …",
    prompt: `Erstelle einen einwöchigen Lernplan mit täglichen 30‑minütigen Übungen, um die genannte Fähigkeit zu erlernen.`
  },
  {
    label: "Magischer Trick",
    hint: "Klick → Gegenstand nennen",
    explain: "Erfinde einen Zaubertrick.",
    action: "claude-input",
    placeholder: "Gegenstand (z. B. Münze) …",
    prompt: `Beschreibe einen neuen Zaubertrick mit dem genannten Gegenstand; erkläre Aufbau, Durchführung und Überraschungseffekt.`
  },
  {
    label: "3D-Design",
    hint: "Klick → Objekt nennen",
    explain: "Konzept für den 3D-Druck.",
    action: "claude-input",
    placeholder: "Objekt / Idee …",
    prompt: `Entwirf ein 3D-druckbares Objekt zum genannten Zweck. Beschreibe Form, Maße und Funktion prägnant.`
  },
  {
    label: "Notizen zusammenfassen",
    hint: "Klick → Stichpunkte eingeben",
    explain: "Bulletpoints und To‑Dos generieren.",
    action: "claude-input",
    placeholder: "Gespräch / Meetingnotizen …",
    prompt: `Fasse die eingegebenen Notizen in klaren Bulletpoints zusammen und liste konkrete nächste Schritte separat auf.`
  },
  {
    label: "Shakespeare-Version",
    hint: "Klick → Text eingeben",
    explain: "Moderner Text im Stil Shakespeares.",
    action: "claude-input",
    placeholder: "Kurzer Text …",
    prompt: `Schreibe den eingegebenen modernen Text im Stil eines Shakespeare-Monologs um, mit altertümlicher Wortwahl.`
  },
  {
    label: "Romandialog",
    hint: "Klick → Thema nennen",
    explain: "Gespräch historischer Personen.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Lass zwei historische Figuren (nach Wahl) ein kurzes Gespräch über das genannte Thema führen. Halte den Ton authentisch.`
  },
  {
    label: "Science‑Fiction Idee",
    hint: "Klick → Zweck nennen",
    explain: "Futuristisches Gadget erfinden.",
    action: "claude-input",
    placeholder: "Zweck / Bedarf …",
    prompt: `Entwirf ein futuristisches Gerät, das dem angegebenen Zweck dient. Beschreibe Aussehen, Technologie und Anwendung.`
  },
  {
    label: "Dreizeiler‑Witz",
    hint: "Klick → Thema nennen",
    explain: "Ein Witz in drei Zeilen.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Erzähle einen humorvollen Witz in drei Zeilen über das angegebene Thema. Das Ende sollte überraschend sein.`
  },
  {
    label: "Parfum‑Beschreibung",
    hint: "Klick → Name nennen",
    explain: "Luxuriöser Dufttext.",
    action: "claude-input",
    placeholder: "Name / Duftnote …",
    prompt: `Verfasse eine sinnliche Beschreibung für das genannte Parfum, inklusive Kopf-, Herz- und Basisnote, in poetischer Sprache.`
  },
  {
    label: "Futuristisches Menü",
    hint: "Klick → Anlass nennen",
    explain: "Speisen aus der Zukunft.",
    action: "claude-input",
    placeholder: "Anlass / Thema …",
    prompt: `Stelle ein futuristisches 3-Gänge-Menü zusammen, inspiriert vom genannten Anlass. Beschreibe jedes Gericht kreativ.`
  },
  {
    label: "Song‑Mashup",
    hint: "Klick → Genres nennen",
    explain: "Zwei Stile, ein Hit.",
    action: "claude-input",
    placeholder: "Genre 1, Genre 2 …",
    prompt: `Beschreibe ein Lied, das zwei genannte Genres kombiniert, und gib eine Idee für Refrain und Instrumentierung an.`
  },
  {
    label: "Kartenspiel‑Regel",
    hint: "Klick → Thema nennen",
    explain: "Einfaches Kartenspiel erfinden.",
    action: "claude-input",
    placeholder: "Thema …",
    prompt: `Entwirf die Regeln für ein einfaches Kartenspiel, das auf dem genannten Thema basiert. Erkläre Ablauf, Ziel und Besonderheiten.`
  },
  {
    label: "Garten‑Roboter",
    hint: "Klick → Aufgabe nennen",
    explain: "Roboter für den Alltag.",
    action: "claude-input",
    placeholder: "Aufgabe (z. B. Rasenmähen) …",
    prompt: `Beschreibe einen Haushaltsroboter, der die genannte Aufgabe übernimmt. Gehe auf Funktionen, Design und Nutzen ein.`
  }
];