// File: public/js/ticker-items.js
// Bilingual prompts; each with longer micro-guides (what to input / what you'll get).

const ITEMS = [
  {
    id: 'detective-reverse',
    de: {
      label: 'Detektiv rückwärts',
      explain: 'Skizziere einen Fall — ich rekonstruiere alles rückwärts.',
      help: 'Gib mir Ort, Opfer/Täter, 3–5 Hinweise oder Beweismittel. Ergebnis: Ermittlungsprotokoll rückwärts (Timeline mit Aktennotizen), am Ende ein plausibles Fazit + offene Fragen.',
      placeholder: 'Tatort, Beteiligte, 3–5 Hinweise',
      prompt: 'Rekonstruiere folgenden Fall rückwärts (Timeline aus Aktennotizen mit Zeitstempel, präzise & knapp, deutsch). Fall: {{input}}'
    },
    en: {
      label: 'Detective in Reverse',
      explain: 'Sketch a case — I reconstruct it backwards.',
      help: 'Provide location, victim/suspect, 3–5 clues. Output: reverse investigation timeline (case notes) ending with a plausible conclusion + open questions.',
      placeholder: 'Scene, people, 3–5 clues',
      prompt: 'Reconstruct this case backwards (timeline of investigative notes, concise, English). Case: {{input}}'
    }
  },
  {
    id: 'biography-pixel',
    de: {
      label: 'Biografie eines Pixels',
      explain: 'Nenne Genre/Ära — ein Pixel erzählt aus seinem Leben.',
      help: 'Sag Genre/Ära, z. B. „Film Noir 40er“, „Cyberpunk 2080“. Ergebnis: Ich‑Erzählung in 3 Mini‑Abschnitten (Szene, Konflikt, Auflösung) mit je 2–3 Sätzen.',
      placeholder: 'Genre oder Epoche',
      prompt: 'Schreibe eine Ich‑Erzählung »Biografie eines Pixels« im Stil {{input}} in 3 Mini‑Abschnitten (Szene, Konflikt, Auflösung). Max. 900 Zeichen.'
    },
    en: {
      label: 'Biography of a Pixel',
      explain: 'Give a genre/era — the pixel speaks.',
      help: 'Provide a genre/era (e.g., “Film Noir 1940s”, “Cyberpunk 2080”). Output: first‑person vignette in 3 mini sections (scene, conflict, resolution).',
      placeholder: 'Genre or era',
      prompt: 'Write a first‑person vignette “Biography of a Pixel” in the style of {{input}}, 3 mini sections. Max 900 chars.'
    }
  },
  {
    id: 'npc-afterhours',
    de: {
      label: 'NPC nach Feierabend',
      explain: 'Gib Genre/Setting – ein Nebencharakter erzählt.',
      help: 'Sag Spiel/Genre (z. B. „Open‑World Fantasy“, „Retro‑Shooter“). Output: intime Mini‑Story eines NPCs in 5 Absätzen (Gedanke, Erinnerung, Frust, kleiner Triumph, Epilog).',
      placeholder: 'Setting/Genre',
      prompt: 'Erzähle die Gedanken eines Nebencharakters nach Feierabend in {{input}}. 5 kurze Absätze mit innerem Monolog.'
    },
    en: {
      label: 'NPC After Hours',
      explain: 'Give genre/setting — a side character talks.',
      help: 'Provide world/genre. Output: intimate mini story (5 short paragraphs: thought, memory, frustration, tiny triumph, epilogue).',
      placeholder: 'Setting/genre',
      prompt: 'Write the thoughts of a side character after work in {{input}} — 5 short paragraphs.'
    }
  },
  {
    id: 'color-synesthesia',
    de: {
      label: 'Farbsynästhetiker',
      explain: 'Nenne zwei Songs – ich male dir die Farben.',
      help: 'Gib 2 Songs (Interpret – Titel). Output: Farbräume, Texturen, Materialien, 6 Bullets je Song + 1 Vergleich.',
      placeholder: 'Song A — Song B',
      prompt: 'Analysiere die synästhetischen Farbräume der Songs {{input}}. Ergebnis: je Song 6 kurze Bullets (Farben, Texturen, Material/Vibe) + 1 Vergleich.'
    },
    en: {
      label: 'Color Synesthete',
      explain: 'Name two songs — I paint their colors.',
      help: 'Give two songs. Output: 6 bullets per song (color space, textures, materials) + one comparison.',
      placeholder: 'Song A — Song B',
      prompt: 'Analyse the synesthetic color spaces of {{input}}. Output: 6 bullets per song + 1 comparison.'
    }
  },
  {
    id: 'today-new',
    de: {
      label: 'Heute neu',
      explain: 'Tages‑Spotlight: KI‑Fund des Tages.',
      help: 'Nichts eingeben: Ich ziehe eine News (wenn verfügbar) und fasse sie inspirierend, mit 3 Nuggets & 1 Praxisidee zusammen.',
      placeholder: '—',
      prompt: 'Formuliere eine inspirierende, präzise KI‑Notiz aus dieser Quelle: {{input}}. Gliedere: Kurzfazit • 3 Nuggets • 1 Praxisidee.'
    },
    en: {
      label: 'Today new',
      explain: 'Daily spotlight: AI find of the day.',
      help: 'No input needed: I’ll use a news item (if available) and condense it into 3 nuggets + 1 practical idea.',
      placeholder: '—',
      prompt: 'Condense this source into a crisp AI note: {{input}} → Summary • 3 nuggets • 1 practical idea.'
    }
  },
  {
    id: 'emotion-alchemist',
    de: {
      label: 'Emotions‑Alchemist',
      explain: 'Sag Ausgangs‑ und Zielgefühl …',
      help: 'Gib „von … nach …“, plus Kontext (Ort, Zeit, Person). Output: 5 klare Schritte + 2 Stolpersteine + 1 kleine Übung.',
      placeholder: 'Von … nach … (+ Kontext)',
      prompt: 'Leite eine Person in 5 konkreten Schritten von {{input}}. Ergänze: 2 Stolpersteine + 1 Mini‑Übung.'
    },
    en: {
      label: 'Emotion Alchemist',
      explain: 'From feeling A to B …',
      help: 'Give “from … to …” plus context. Output: 5 clear steps + 2 pitfalls + 1 tiny exercise.',
      placeholder: 'From … to … (+ context)',
      prompt: 'Guide a person in 5 concrete steps from {{input}}. Add 2 pitfalls + 1 mini exercise.'
    }
  },
  {
    id: 'quantum-diary',
    de: {
      label: 'Quantentagebuch',
      explain: 'Prompt‑Archäologe: Ich grabe deine Idee aus.',
      help: 'Gib Anlass/Ort/Person/Ziel. Output: 3 hochpräzise Prompt‑Varianten (mit Rollen, Randbedingungen, Erfolgskriterien).',
      placeholder: 'Anlass/Ort/Person/Ziel',
      prompt: 'Erstelle 3 präzise Prompt‑Varianten für: {{input}}. Struktur: Rolle • Ziel • Randbedingungen • Erfolgskriterien.'
    },
    en: {
      label: 'Quantum Diary',
      explain: 'Prompt archeologist: I dig your idea out.',
      help: 'Provide occasion/place/person/goal. Output: 3 precise prompt variants (roles, constraints, success criteria).',
      placeholder: 'Occasion/place/person/goal',
      prompt: 'Create 3 precise prompt variants for: {{input}}. Include role, goal, constraints, success criteria.'
    }
  },
  {
    id: 'time-travel-diary',
    de: {
      label: 'Zeitreise‑Tagebuch',
      explain: 'Schick mir einen Tag – ich schreibe ihn neu.',
      help: 'Gib Datum + Ort + 1 Ereignis. Output: Tagebuch aus alternativer Zeitlinie in 3 Szenen mit mini Twists.',
      placeholder: 'Datum + Ort + Ereignis',
      prompt: 'Schreibe ein Tagebuch aus einer alternativen Zeitlinie zu {{input}} in 3 Szenen (je 3–4 Sätze).'
    },
    en: {
      label: 'Time‑travel Diary',
      explain: 'Send a day — I rewrite it.',
      help: 'Provide date + place + one event. Output: diary from an alternate timeline, 3 scenes with tiny twists.',
      placeholder: 'Date + place + event',
      prompt: 'Write a diary entry from an alternate timeline for {{input}} in 3 scenes (3–4 sentences each).'
    }
  },
  {
    id: 'interdimensional-market',
    de: {
      label: 'Interdimensionaler Markt',
      explain: 'Sag, was du suchst – ich öffne einen Markt.',
      help: 'Gib „Ich suche …“ (Ding, Fähigkeit, Erinnerung). Output: Szene + 5 Marktstände, je mit Angebot, Preislogik, Regel.',
      placeholder: 'Was suchst du?',
      prompt: 'Gestalte einen lebhaften interdimensionalen Markt rund um: {{input}}. Ergebnis: Szene + 5 Stände (Angebot • Preislogik • Regel).'
    },
    en: {
      label: 'Interdimensional Market',
      explain: 'Tell me what you seek — I open a market.',
      help: 'Say “I’m looking for …” (thing, skill, memory). Output: scene + 5 stalls (offer, price logic, rule).',
      placeholder: 'What are you looking for?',
      prompt: 'Create a lively interdimensional market around: {{input}} — scene + 5 stalls (offer • price logic • rule).'
    }
  },
  {
    id: 'ai-dreams',
    de: {
      label: 'KI‑Träume',
      explain: 'Ich render deine Idee nachts.',
      help: 'Gib Motiv/Stimmung/Stil. Output: 4 nummerierte Bildideen (Text‑Ideen ohne Bildgenerierung) inkl. kurze Stil‑Tags.',
      placeholder: 'Motiv / Stimmung / Stil',
      prompt: 'Gib vier klar nummerierte Bildideen, Thema: {{input}}. Jede mit 1 Satz + 3 Stil‑Tags.'
    },
    en: {
      label: 'AI Dreams',
      explain: 'I render your idea at night.',
      help: 'Provide motif/mood/style. Output: 4 numbered image ideas (text only) incl. style tags.',
      placeholder: 'Motif / mood / style',
      prompt: 'Provide four numbered image ideas for {{input}}. Each: 1 sentence + 3 style tags.'
    }
  },
  {
    id: 'reality-debugger',
    de: {
      label: 'Realitäts‑Debugger',
      explain: 'Gib ein Thema – ich zeige Wahrnehmungs-Bugs.',
      help: 'Gib Thema/Kontext. Output: 6 Bugs mit: Symptom • Beispiel • Re‑Frame • 1 Gegenmaßnahme.',
      placeholder: 'Thema',
      prompt: 'Liste 6 „Realitäts‑Bugs“ zum Thema {{input}}. Jeweils: Symptom • Beispiel • Re‑Frame • Gegenmaßnahme.'
    },
    en: {
      label: 'Reality Debugger',
      explain: 'Give a topic – I show perception bugs.',
      help: 'Give topic/context. Output: 6 glitches with symptom, example, re‑frame, mitigation.',
      placeholder: 'Topic',
      prompt: 'List 6 perception “bugs” for {{input}} — each: symptom • example • re‑frame • mitigation.'
    }
  },
  {
    id: 'library-unlived',
    de: {
      label: 'Bibliothek ungeliebter Leben',
      explain: 'Nenne Person + Wendepunkt – ich schreibe die andere Seite.',
      help: 'Gib Person + Wendepunkt. Output: empathische Ich‑Vignette (3 Abschnitte: Szene • innere Ambivalenz • zarter Hoffnungsschimmer).',
      placeholder: 'Person + Wendepunkt',
      prompt: 'Schreibe eine empathische Ich‑Vignette zu {{input}} in 3 Abschnitten.'
    },
    en: {
      label: 'Library of Unlived Lives',
      explain: 'Name a person + turning point — I write the other side.',
      help: 'Provide person + turning point. Output: empathetic first‑person vignette in 3 parts.',
      placeholder: 'Person + turning point',
      prompt: 'Write an empathetic first‑person vignette at {{input}} in 3 parts.'
    }
  },
  {
    id: 'timeline-explosion',
    de: {
      label: 'Zeitlinien‑Explosion',
      explain: 'Beschreibe eine Welt – ich verzweige 5 Varianten.',
      help: 'Gib Welt/Objekt + 1 Regel. Output: 5 verästelte Zeitlinien (je 2 Sätze: Konsequenz + Signatur‑Detail).',
      placeholder: 'Welt/Objekt + Regel',
      prompt: 'Erzeuge 5 alternative Zeitlinien ausgehend von: {{input}}. Je Variante: Konsequenz + Signatur‑Detail.'
    },
    en: {
      label: 'Timeline Explosion',
      explain: 'Describe a world — I branch 5 variants.',
      help: 'Give world/object + one rule. Output: 5 branches (2 sentences each: consequence + signature detail).',
      placeholder: 'World/object + rule',
      prompt: 'Generate 5 alternate timelines from: {{input}} — each with consequence + signature detail.'
    }
  },
  {
    id: 'the-net-speaks',
    de: {
      label: 'Das Netz spricht',
      explain: 'Stell dem Netz eine Frage – ich simuliere Antworten.',
      help: 'Gib 1 klare Frage. Output: 8 Stimmen (verschiedene Rollen), je 1–2 Sätze, realistische Vielfalt.',
      placeholder: 'Frage',
      prompt: 'Simuliere 8 unterschiedliche Antworten aus dem Netz (1–2 Sätze) zu: {{input}} — mit Rollenlabel.'
    },
    en: {
      label: 'The Net Speaks',
      explain: 'Ask the net a question — I simulate answers.',
      help: 'Provide a clear question. Output: 8 voices (varied roles), 1–2 sentences each.',
      placeholder: 'Question',
      prompt: 'Simulate 8 different answers from the web (1–2 sentences each) about: {{input}} — include a role label.'
    }
  },
  {
    id: 'empathy-tutorial',
    de: {
      label: 'Empathie‑Tutorial',
      explain: 'Wähle eine Sequenz – ich erkläre schwierige Dinge.',
      help: 'Gib Begriff/Szene. Output: Erklärung für Kind, Einsteiger, Pro — je 5 Sätze + 1 Metapher + 1 Stolperstein.',
      placeholder: 'Begriff oder Szene',
      prompt: 'Erkläre {{input}} für Kind, Einsteiger, Pro — je 5 Sätze + 1 Metapher + 1 Stolperstein.'
    },
    en: {
      label: 'Empathy Tutorial',
      explain: 'Pick a sequence — I explain hard things.',
      help: 'Give term/scene. Output: for child, beginner, pro — 5 sentences each + one metaphor + one pitfall.',
      placeholder: 'Term or scene',
      prompt: 'Explain {{input}} for child, beginner, pro — 5 sentences each + one metaphor + one pitfall.'
    }
  },
  {
    id: 'socratic-mentor',
    de: {
      label: 'Sokratischer Mentor',
      explain: 'Stelle eine echte Frage – ich frage klüger zurück.',
      help: 'Gib Problemstellung & Ziel. Output: 3 Dialog‑Runden nur mit Fragen, jeweils tiefer, am Ende 3 Reflexionsaufgaben.',
      placeholder: 'Dein Problem & Ziel',
      prompt: 'Führe einen sokratischen Dialog (3 Runden) zu: {{input}} — nur Fragen, am Ende 3 Reflexionsaufgaben.'
    },
    en: {
      label: 'Socratic Mentor',
      explain: 'Ask a real question — I ask wiser ones back.',
      help: 'Provide problem & goal. Output: 3 rounds of questions only, ending with 3 reflection tasks.',
      placeholder: 'Your problem & goal',
      prompt: 'Run a Socratic dialogue (3 rounds) about: {{input}} — questions only, end with 3 reflection tasks.'
    }
  }
];

export function tickerItemsFor(locale){
  const l = (locale === 'de' || locale === 'en') ? locale : 'en';
  return ITEMS.map(it => ({ id: it.id, ...it[l] }));
}
