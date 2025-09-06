/*
 * ticker-items.js — praxisorientierte AI‑Tickerinhalte
 *
 * Diese Datei definiert das globale Array `window.__TICKER_ITEMS`, das
 * vom Ticker-Modul verwendet wird. Jeder Eintrag besteht aus einem
 * `label` (wird im Laufband angezeigt), einem `prompt` (wird an die
 * KI gesendet) und einer `category`, damit der Ticker gefiltert
 * werden kann. Kategorien: news, tips, prompts, projects.
 *
 * Die Inhalte fokussieren sich auf direkt anwendbare Use Cases,
 * nutzernahe Anleitungen und kreative Experimente rund um KI.
 */
window.__TICKER_ITEMS = [
  // Aktuelle und direkt anwendbare KI-News
  { label: "KI-News: Video-Skripts", prompt: "Stell dir vor, ChatGPT schreibt komplette Video-Skripte. Beschreibe in zwei Sätzen, wie man ChatGPT nutzt, um ein kurzes Produktvideo zu planen, und gib ein konkretes Beispiel.", category: "news" },
  { label: "KI-News: Lokale Modelle", prompt: "Berichte in zwei Sätzen über die neuesten Fortschritte bei lokalen KI-Modellen (z. B. Llama 3) und wie Nutzer sie privat einsetzen können.", category: "news" },
  { label: "KI-News: Bildbearbeitung", prompt: "Erkläre in drei Sätzen, wie aktuelle KI-Bildtools Fotos verbessern können, und nenne zwei Beispiele, die du sofort ausprobieren kannst.", category: "news" },
  { label: "KI-News: Sprachlernen", prompt: "Wie helfen KI-Apps beim Sprachenlernen? Gib zwei praktische Tipps und nenne eine App, die du testen kannst.", category: "news" },

  // Konkrete Tipps und Anwendungsfälle
  { label: "Tipp: E-Mail-Marketing", prompt: "Zeige, wie man ChatGPT nutzt, um personalisierte E-Mail-Betreffzeilen zu erstellen. Formuliere drei Beispiele.", category: "tips" },
  { label: "Tipp: Ideengenerator", prompt: "Wie kann ChatGPT im Brainstorming helfen? Zeige zwei Methoden und gib ein kreatives Beispiel.", category: "tips" },
  { label: "Tipp: Code-Helfer", prompt: "Nenne drei Bereiche, in denen ChatGPT beim Programmieren unterstützt (z. B. Fehlererklärung) und gib kurze Beispiele.", category: "tips" },
  { label: "Tipp: Präsentationen", prompt: "Wie nutzt man ChatGPT, um schnell eine überzeugende Präsentation zu planen? Gib drei Schritte als Anleitung.", category: "tips" },
  { label: "Tipp: Zeitmanagement", prompt: "Erkläre, wie ChatGPT dir helfen kann, deine To-Do-Liste zu priorisieren. Nenne zwei konkrete Hinweise.", category: "tips" },
  { label: "Prompt-Ratgeber", prompt: "Was macht einen starken Prompt aus? Nenne drei Regeln und gib ein Beispiel für einen prägnanten Prompt.", category: "tips" },
  { label: "Tipp: KI-Sicherheit", prompt: "Nenne drei praktische Maßnahmen zum Schutz sensibler Daten bei der Nutzung von ChatGPT.", category: "tips" },

  // Kreative und inspirierende Prompts, die sofort ausprobiert werden können
  { label: "Kreativprompt: Haiku", prompt: "Bitte ChatGPT, ein Haiku über die Zukunft der KI zu schreiben. Nur ein Gedicht, auf Deutsch.", category: "prompts" },
  { label: "Kreativprompt: Story", prompt: "Lass ChatGPT eine Mini-Geschichte (drei Sätze) erzählen, in der KI deinen Alltag erleichtert.", category: "prompts" },
  { label: "Karriere-Coach", prompt: "Welche drei KI-Fähigkeiten sollte ein Manager 2025 lernen? Bitte als Liste mit kurzen Begründungen.", category: "prompts" },
  { label: "LinkedIn-Post", prompt: "Fordere ChatGPT auf, einen LinkedIn-Post zu verfassen, der dein neuestes Projekt in drei Sätzen vorstellt.", category: "prompts" },
  { label: "Mentale Gesundheit", prompt: "Lass ChatGPT drei Tipps für digitale Achtsamkeit nennen, damit der Umgang mit KI gesund bleibt.", category: "prompts" },
  { label: "Rezeptgenerator", prompt: "Nutze ChatGPT als Kochassistent: Bitte um ein einfaches Rezept aus Tomaten, Knoblauch und Pasta (maximal drei Sätze).", category: "prompts" },

  // Projekt- und Community-Themen rund um hohl.rocks
  { label: "Projekt-Update: hohl.rocks", prompt: "Gib einen kurzen Stand zu neuen Features bei hohl.rocks und wie sie den Nutzern helfen (maximal drei Sätze).", category: "projects" },
  { label: "Community-Aufruf", prompt: "Bitte um Feedback von Nutzern: Welche Themen sollen auf hohl.rocks behandelt werden? Formuliere zwei Fragen.", category: "projects" },
  { label: "Workshop-Tipp", prompt: "Kündige einen kostenlosen Mini-Workshop zu KI-Grundlagen an und nenne ein Key-Learning.", category: "projects" }
];