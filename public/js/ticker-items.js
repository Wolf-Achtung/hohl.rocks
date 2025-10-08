// public/js/ticker-items.js — curated micro-apps for bubbles (inspired, surprising)
export const __TICKER_ITEMS = [
  { label: 'Heute neu', explain: 'Tägliches Spotlight aus News', placeholder: '—', action: 'info', prompt: 'Tagesnotiz erscheint hier.' },

  { label: 'Trailer-Generator (30s, Kino)', explain: 'Shotlist + Timing + VO + SFX',
    placeholder: 'Thema/Produkt + Zielpublikum',
    action: 'input',
    prompt: 'Erzeuge einen 30‑Sekunden‑Kino‑Trailer als Shot‑by‑Shot‑Plan (8–12 Shots). Für jeden Shot: Dauer in Sekunden, Motiv/Bildsprache, Kamerabewegung, Ton (SFX/Musik), Voice‑over‑Zeile. Am Ende eine kompakte Prompt‑Liste für generative Video-Tools.\n\n{{input}}' },

  { label: 'TikTok Hook‑Lab', explain: '10 Hooks ≤ 7 Wörter',
    placeholder: 'Produkt/These/Insight',
    action: 'input',
    prompt: 'Gib 10 starke Hooklines (≤ 7 Wörter), sortiert nach Muster (Neugier, Kontrast, Zahl, Tabu, Shortcut). Jede Hook mit 1 Begründung in 1 Satz.\n\n{{input}}' },

  { label: 'Moodboard‑Prompts', explain: '6 Bildprompts mit Stilreferenzen',
    placeholder: 'Stichworte, Zielästhetik',
    action: 'input',
    prompt: 'Erzeuge 6 präzise Bild‑Prompts im Stil professioneller Art‑Direktion. Struktur: Motiv, Licht, Optik (Objektiv/Blende), Farbwelt, Komposition, 3 Stilreferenzen (Fotograf:in/Künstler:in), Negatives.\n\n{{input}}' },

  { label: 'Voice‑of‑Brand Destiller', explain: 'Ton & Regeln',
    placeholder: 'Beispieltexte oder Beschreibung',
    action: 'input',
    prompt: 'Destilliere eine Brand Voice: 5 Regeln (Do), 5 Verbote (Don’t), 3 typische Satzmuster, 10 Power‑Wörter. Gib am Ende ein kurzes Style‑Snippet (Beispieltext, 80–120 Wörter).\n\n{{input}}' },

  { label: 'Podcast → Teaser (15s)', explain: 'Skript mit Beat‑Cuts',
    placeholder: 'Transkript-Auszug oder Thema',
    action: 'input',
    prompt: 'Schreibe ein 15‑Sekunden‑Teaser‑Skript: Hook (Cold Open), 2 Punch‑Zeilen, CTA. Markiere Beat‑Schnitte (0.0s, 2.5s, …).\n\n{{input}}' },

  { label: 'Spec‑Ad‑Konzept', explain: '1 starke Idee + 3 Variationen',
    placeholder: 'Produkt/Brand/Insight',
    action: 'input',
    prompt: 'Entwickle 1 starke Werbeidee (Logline, visuelle Leitmetapher) und 3 Variationen (Social Cut, OOH, Kino). Kein Marketing‑Kauderwelsch, klare Bilder und Aktionen.\n\n{{input}}' },

  { label: 'Live‑Demo‑Storyboard', explain: 'UX‑Schritte → Shots',
    placeholder: 'Funktion/Feature kurz beschreiben…',
    action: 'input',
    prompt: 'Wandle eine Produktdemo in ein filmisches Storyboard: 6–10 Shots, je 1 UI‑Aktion, Kamera & Macro‑Detail, Text‑Overlay. Gebe zusätzlich eine Liste generativer Video‑Prompts.\n\n{{input}}' },

  { label: 'EU‑AI‑Act Übersetzer', explain: 'Risiko/Anforderungen auf 1 Seite',
    placeholder: 'Use‑Case beschreiben…',
    action: 'input',
    prompt: 'Ordne den Use‑Case in den EU‑AI‑Act ein (verboten, hoch, begrenzt, minimal). Liste Pflichten/Lücken & 5 To‑dos, klar und ohne Juristenjargon.\n\n{{input}}' },

  { label: 'Cold‑Open‑Magnet', explain: 'Erster Satz, der zieht',
    placeholder: 'Text/These/Story',
    action: 'input',
    prompt: 'Schreibe 12 alternative erste Sätze (Cold Open) in verschiedenen Stilen (Sachlich, Poetisch, Drastisch, Humor, Kontrast). Erkläre kurz, warum sie wirken.\n\n{{input}}' },

  { label: 'Research‑Sprint (30 min)', explain: 'Plan + 8 Quellen',
    placeholder: 'Fragestellung',
    action: 'input',
    prompt: 'Erstelle einen 30‑Minuten‑Recherche‑Plan (Schritte, Zeit, Kriterium). Liefere 8 hochwertige Quellen (Titel + 1 Satz Nutzen).\n\n{{input}}' },

  { label: 'E‑Mail Schärfer Pro', explain: 'präzise, höflich, wirksam',
    placeholder: 'Entwurf einfügen…',
    action: 'input',
    prompt: 'Schärfe die Mail: Betreff ≤ 6 Wörter, 3 Kernpunkte, 1 klare Bitte mit Deadline, 2 Alternativtermine. Ton: professionell, freundlich, deutsch.\n\n{{input}}' },

  { label: 'Storyboard aus einem Bild', explain: 'Single Frame → 5 Shots',
    placeholder: 'Motiv/Stimmung beschreiben…',
    action: 'input',
    prompt: 'Erfinde aus einem beschriebenen Frame eine 5‑Shot‑Sequenz (Einstellung, Bewegung, Dramaturgie). Formatiere als Shot‑Liste.\n\n{{input}}' },

  { label: 'UX‑Microcopy‑Kit', explain: 'Buttons, Tooltips, Fehler',
    placeholder: 'Kontext/Flow…',
    action: 'input',
    prompt: 'Schreibe prägnante Microcopy für 1 Flow: 10 Buttons (≤ 2 Wörter), 6 Tooltips, 5 Fehlermeldungen mit „nächstem Schritt“.\n\n{{input}}' },

  { label: 'One‑Minute‑Plan (Turbo)', explain: '5 Mikro‑Schritte',
    placeholder: 'Ziel/Blockade…',
    action: 'input',
    prompt: 'Skizziere 5 Mikro‑Schritte (<60 s) für sofortigen Fortschritt. Keine Theorie, nur konkrete Aktionen.\n\n{{input}}' }
];
