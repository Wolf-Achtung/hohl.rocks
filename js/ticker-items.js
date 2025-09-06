/*
 * ticker-items.js — AI‑lastige Tickerinhalte mit Kategorien
 *
 *  Diese Datei definiert das globale Array `window.__TICKER_ITEMS`, das
 *  vom Ticker-Modul verwendet wird. Jeder Eintrag besteht aus einem
 *  `label` (wird im Laufband angezeigt), einem `prompt` (wird an die
 *  KI gesendet) und einer `category`, damit der Ticker gefiltert
 *  werden kann. Kategorien: news, tips, prompts, projects.
 */
window.__TICKER_ITEMS = [
  // Cutting-edge KI-News und Strategiethemen
  { label: "Trend: Agentic AI", prompt: "Erläutere den Trend Agentic AI (KI-Agenten) in zwei Sätzen und warum er im Jahr 2025 entscheidend wird.", category: "news" },
  { label: "EU KI-Regulierung", prompt: "Fasse die Kernelemente der aktuellen EU-KI-Verordnung (AI Act) in drei Sätzen zusammen und erläutere die Auswirkungen auf Unternehmen.", category: "news" },
  { label: "AI Index 2025 Highlights", prompt: "Nenne die wichtigsten Erkenntnisse aus dem AI Index Report 2025 in drei Sätzen (z. B. Effizienz, Open-Source-Modelle).", category: "news" },
  { label: "Small Language Models", prompt: "Warum gewinnen Small Language Models an Bedeutung? Erkläre kurz den Nutzen und die Grenzen in zwei Sätzen.", category: "news" },
  { label: "Edge AI 2025", prompt: "Warum wird Edge AI immer wichtiger? Nenne zwei Vorteile dieser Technologie.", category: "news" },
  { label: "AI & Nachhaltigkeit 2025", prompt: "Wie kann KI zur Energiewende beitragen? Erläutere in zwei Sätzen ein aktuelles Projekt.", category: "news" },
  { label: "AI & Präzisionsmedizin", prompt: "Wie wird KI im Jahr 2025 in der Präzisionsmedizin eingesetzt? Nenne ein Beispiel mit Mehrwert.", category: "news" },
  { label: "AI-Kunst 2025", prompt: "Nenne eine aufsehenerregende KI-Kunstinstallation aus 2025 und beschreibe, was daran innovativ ist.", category: "news" },
  { label: "Next-Gen Modelle", prompt: "Was macht die nächste Generation der KI-Modelle (z. B. GPT-5, Gemini Ultra) so leistungsstark? Fasse in zwei Sätzen zusammen.", category: "news" },
  { label: "Ethik: Bias Detection", prompt: "Welche neuen Methoden zur Erkennung von Bias in KI-Systemen werden 2025 diskutiert? Kurze Zusammenfassung.", category: "news" },

  // Strategien, Skills und Tipps
  { label: "Top Skills für KI-Manager", prompt: "Welche drei Fähigkeiten braucht ein erfolgreicher KI-Manager im Jahr 2025? Gib kurze Stichpunkte.", category: "tips" },
  { label: "Prompt Engineering Upgrades", prompt: "Nenne zwei neue Techniken im Prompt Engineering, die 2025 an Bedeutung gewinnen.", category: "tips" },
  { label: "Data Governance 2025", prompt: "Welche Best Practices gelten 2025 beim Umgang mit Trainingsdaten für KI-Systeme? Kurze Antwort.", category: "tips" },
  { label: "Tool-Trend: AI Stack", prompt: "Welche Schlüsseltechnologien bilden den KI-Tech-Stack 2025 (LLMs, Retriever, Vektordatenbanken)? Nenne drei.", category: "tips" },
  { label: "Visionäre KI-Manager", prompt: "Nenne drei Fähigkeiten, die einen visionären KI-Manager auszeichnen (max. 3 Stichwörter).", category: "tips" },

  // Kreative und inspirierende Prompts
  { label: "KI & Musik", prompt: "Wie verändert KI das Komponieren und Produzieren von Musik? Gib ein aktuelles Beispiel (2 Sätze).", category: "prompts" },
  { label: "AI-Agenten im Support", prompt: "Was sind die Vorteile von KI-Agenten im Kundensupport 2025? Nenne zwei konkrete Effekte.", category: "prompts" },
  { label: "AI & Marketing Future", prompt: "Wie könnte KI das Marketing bis 2026 weiter revolutionieren? Gib zwei kreative Use Cases.", category: "prompts" },
  { label: "Inspirierendes KI-Projekt", prompt: "Nenne ein inspirierendes KI-Projekt, das 2025 Social Impact erzeugt (z. B. Umwelt oder Bildung).", category: "prompts" },
  { label: "Spannende KI-Fragen", prompt: "Formuliere fünf Fragen, die ich einem KI-Start-up im Jahr 2025 stellen sollte.", category: "prompts" },

  // Projekt- und Community-Themen rund um hohl.rocks
  { label: "hohl.rocks Ausblick", prompt: "Welche spannenden Features sind für hohl.rocks in den kommenden Monaten geplant? Gib einen kurzen Ausblick.", category: "projects" },
  { label: "Community Feedback", prompt: "Warum ist Feedback der Benutzer für hohl.rocks wichtig? Beschreibe in zwei Sätzen.", category: "projects" },
  { label: "Partnerschaften 2025", prompt: "Welche neuen Partnerschaften oder Kooperationen sind für hohl.rocks in Planung? Kurzbeschreibung.", category: "projects" },
  { label: "KI-Workshop Roadmap", prompt: "Gibt es einen geplanten KI-Workshop oder ein Webinar von Wolf? Gib einen kurzen Teaser.", category: "projects" }
];