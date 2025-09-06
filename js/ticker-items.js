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
  { label: "KI‑News: Tagesupdate", prompt: "Fasse die wichtigsten KI‑News des Tages in drei Sätzen zusammen.", category: "news" },
  { label: "Aktuelle Durchbrüche", prompt: "Nenne einen aktuellen Durchbruch in der KI‑Forschung und beschreibe ihn kurz.", category: "news" },
  { label: "KI & Nachhaltigkeit", prompt: "Wie kann KI zur Nachhaltigkeit beitragen? Fasse aktuelle Initiativen in zwei Sätzen zusammen.", category: "news" },
  { label: "KI & Bildung", prompt: "Gibt es neue Entwicklungen beim Einsatz von KI in der Bildung? Fasse kurz zusammen.", category: "news" },
  { label: "KI‑Ethik", prompt: "Nenne ein aktuelles Beispiel für eine ethische Debatte in der KI und beschreibe sie kurz.", category: "news" },

  { label: "Prompt‑Tipp des Tages", prompt: "Gib mir einen effektiven Prompt‑Tipp für ChatGPT, der die Antworten verbessert.", category: "tips" },
  { label: "ChatGPT Hacks", prompt: "Nenne zwei Hacks, um bessere Antworten aus ChatGPT herauszuholen.", category: "tips" },
  { label: "KI‑Learning Tipps", prompt: "Welche zwei Online‑Ressourcen eignen sich am besten, um KI zu lernen?", category: "tips" },
  { label: "Creative AI Tools", prompt: "Empfehle zwei spannende Creative‑AI‑Tools (z. B. für Musik, Kunst) mit kurzer Begründung.", category: "tips" },
  { label: "Datenschutz‑Check", prompt: "Welche zwei Dinge sollte ich beim Datenschutz beachten, wenn ich KI‑Tools nutze?", category: "tips" },

  { label: "Inspirierender Prompt", prompt: "Erstelle einen inspirierenden Prompt, um ein kreatives Kurzgedicht zu erhalten.", category: "prompts" },
  { label: "Business‑Prompt", prompt: "Formuliere einen Prompt, der mir hilft, eine KI‑gestützte Marktanalyse für ein Start‑up zu erhalten.", category: "prompts" },
  { label: "Story‑Starter", prompt: "Gib mir einen Prompt, der den Beginn einer Sci‑Fi‑Story generiert.", category: "prompts" },
  { label: "Pitch‑Prompt", prompt: "Schreibe einen Prompt, der mir hilft, ein Produkt‑Pitch‑Deck von ChatGPT erstellen zu lassen.", category: "prompts" },
  { label: "Fragen an ein KI‑Start‑up", prompt: "Formuliere einen Prompt mit fünf Fragen, die ich einem KI‑Start‑up stellen sollte.", category: "prompts" },

  { label: "Hohl.rocks Roadmap", prompt: "Was sind die nächsten Schritte in der Entwicklung von hohl.rocks?", category: "projects" },
  { label: "Neue Funktion in Arbeit", prompt: "Teile eine kleine Vorschau auf eine geplante Funktion von hohl.rocks (max. zwei Sätze).", category: "projects" },
  { label: "Partner & Kooperationen", prompt: "Was ist geplant in Bezug auf Partnerschaften oder Kooperationen für hohl.rocks? Kurzbeschreibung.", category: "projects" },
  { label: "Users Feedback", prompt: "Warum ist Feedback der Benutzer für hohl.rocks wichtig? Beschreibe in zwei Sätzen.", category: "projects" },
  { label: "KI‑Workshop", prompt: "Gibt es einen geplanten KI‑Workshop oder ein Webinar? Gib einen Ausblick.", category: "projects" }
];