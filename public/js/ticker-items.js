// public/js/ticker-items.js — curated micro-apps for bubbles
export const __TICKER_ITEMS = [
  { label: 'Heute neu', explain: 'Tägliches Spotlight aus News', placeholder: '—', action: 'info', prompt: 'Tagesnotiz erscheint hier.' },

  { label: 'Executive-Summary', explain: '5 Kernaussagen + Handlung', placeholder: 'Text hier einfügen…',
    action: 'input', prompt: 'Verdichte den folgenden Text in 5 Kernaussagen und 1 Handlungssatz.\n\n{{input}}' },

  { label: 'Stakeholder-Briefing', explain: 'Ziel–Stand–Risiken–Next', placeholder: 'Stichpunkte…',
    action: 'input', prompt: 'Erzeuge ein 1-seitiges Briefing: 1) Ziel 2) Stand 3) Risiken 4) Nächste Schritte.\n\n{{input}}' },

  { label: 'Fehler-Radar (Code)', explain: '3 Ursachen + Minimal-Fix', placeholder: 'Code-Ausschnitt…',
    action: 'input', prompt: 'Analysiere den folgenden Code. Nenne 3 wahrscheinliche Fehlerursachen, verweise auf Stellen/Pattern und liefere je ein Minimal-Fix-Snippet.\n\n{{input}}' },

  { label: 'Meeting-Sparer', explain: '30-Minuten-Agenda', placeholder: 'Ziel & Input…',
    action: 'input', prompt: 'Baue eine 30-Minuten-Agenda mit Time-Boxing, Entscheidungsfragen und Ownern. Ende mit klaren Next Steps.\n\n{{input}}' },

  { label: 'RAG-Diagnose', explain: 'Pipeline bewerten', placeholder: 'Setup beschreiben…',
    action: 'input', prompt: 'Analysiere ein RAG-Setup (Quelle, Chunking, Embedding, Retrieval, Re-Ranking, Antwort). Liefere je 1 Messvorschlag (Eval).\n\n{{input}}' },

  { label: 'Agent-SOP', explain: 'Pipeline-Checkliste', placeholder: 'Ziel und Tools…',
    action: 'input', prompt: 'Skizziere eine SOP für eine Agenten‑Pipeline (Planer, Tools, Memory, Guardrails). Klare Checkliste.\n\n{{input}}' },

  { label: 'One‑Minute‑Plan', explain: '5 Mikro‑Schritte', placeholder: 'Kontext…',
    action: 'input', prompt: 'Skizziere 5 Mikro‑Schritte (<60 s) für sofortigen Fortschritt, ohne Theorie.\n\n{{input}}' }
];
