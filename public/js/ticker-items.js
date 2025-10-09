// File: public/js/ticker-items.js — alle Explain/Help/Placeholder freundlich & klar

// public/js/ticker-items.js — 40 inspirierende Micro-Apps (klarer Input/Output/Format)
// Jede Bubble hat: label, explain (kurz), placeholder, help (Cheat‑Sheet), action, prompt.
// Die Prompts sind Claude‑optimiert (strukturierte Anforderungen + Format + Stil).

export const __TICKER_ITEMS = [
  // ---- Daily spotlight (gefüllt durch /api/daily) --------------------------------------------
  {
    label: 'Heute neu',
    explain: 'Tages‑Spotlight: Eine handverlesene KI‑Notiz, automatisch aktualisiert.',
    placeholder: '—',
    help: [
      'Wird automatisch gefüllt.',
      'Du bekommst: Eine kurze, frische Entdeckung aus den KI‑News.',
      'Tipp: Klicke für Details oder kopiere die Idee weiter.'
    ].join('\n'),
    action: 'info',
    prompt: 'Tagesnotiz erscheint hier.'
  },

  // ==== 1–30: Optimierte Versionen deiner 30 Ideen ============================================
  {
    label: 'Zeitreise‑Tagebuch 2084',
    explain: 'Schick mir einen Tagebuch‑Schnipsel aus 2024 – ich schreibe ihn glaubwürdig ins Jahr 2084.',
    placeholder: 'Kurzer Tagebucheintrag aus 2024',
    help: [
      'Du gibst: 3–8 Sätze Alltag von heute.',
      'Du bekommst: Dieselbe Szene im Jahr 2084 – Technik, Rituale, neue Konflikte.',
      'Bonus: Drei Details, die überraschen (Gegenstand, Geräusch, Regel).'
    ].join('\n'),
    action: 'input',
    prompt: `# Aufgabe
Schreibe die folgende 2024 Szene als glaubwürdige 2084-Version um. …
Startidee: {{input}}`
  },

  {
    label: 'Rückwärts‑Zivilisation',
    explain: 'Beschreibe kurz eine Welt – ich entwerfe eine Gesellschaft, die bewusst rückwärts wächst.',
    placeholder: '1–2 Sätze zur Welt/Prämisse',
    help: [
      'Du gibst: Eine Grundidee (Ort, Motiv).',
      'Du bekommst: Ein Mini‑Dossier – Philosophie, Alltag, Rituale, Tabus.',
      'Bonus: Konkrete Beobachtungen statt Klischees.'
    ].join('\n'),
    action: 'input',
    prompt: `Skizziere eine Zivilisation, die sich absichtlich rückwärts entwickelt. …
Startidee: {{input}}`
  },

  {
    label: 'Bewusstes Gebäude',
    explain: 'Nenne Ort/Typ und einen Anlass – das Gebäude erzählt seine Version in Andeutungen.',
    placeholder: 'Ort/Typ + Ereignis (z. B. „Altbau, Abschied“)',
    help: [
      'Du gibst: Ort/Typ + Anlass.',
      'Du bekommst: 600–900 Zeichen Ich‑Erzählung über Licht, Geräusche, Material.',
      'Bonus: Starke Bilder statt „ich fühle“.'
    ].join('\n'),
    action: 'input',
    prompt: `Erzähle aus der Perspektive eines 200 Jahre alten Hauses … {{input}}`
  },

  {
    label: 'Sokratischer Mentor',
    explain: 'Stell eine echte Frage – Sokrates führt dich in kurzen Schritten zu Klarheit.',
    placeholder: 'Thema/Frage (z. B. „KI in Schulen?“)',
    help: [
      'Du gibst: Ein Dilemma oder eine These.',
      'Du bekommst: 8–12 ehrliche Q&A‑Schleifen – ohne Besserwisserei.',
      'Ziel: Widersprüche aufdecken, Begriffe schärfen.'
    ].join('\n'),
    action: 'input',
    prompt: `Führe einen sokratischen Dialog … Frage: {{input}}`
  },

  {
    label: 'Interdimensionaler Markt',
    explain: 'Sag, was du suchst – ich öffne einen Markt zwischen Welten mit Angeboten, Preisen und Risiken.',
    placeholder: 'Reiseinteresse / Suchliste',
    help: [
      'Du gibst: Dein Reiseziel oder eine Suchliste.',
      'Du bekommst: 5 Marktstände inkl. Waren, Logik, Risiken.',
      'Bonus: Jede Szene endet mit einer kleinen Entscheidung (A/B).'
    ].join('\n'),
    action: 'input',
    prompt: `Skizziere einen Markt zwischen Dimensionen … Liste: {{input}}`
  },

  {
    label: 'NPC nach Feierabend',
    explain: 'Gib Genre/Setting – ein Nebencharakter erzählt von seinem Privatleben nach Dienstschluss.',
    placeholder: 'Genre/Setting (z. B. „Open‑World Noir“)',
    help: [
      'Du gibst: Genre/Setting.',
      'Du bekommst: 900–1200 Zeichen Mini‑Erzählung mit zwei Nebenfiguren.',
      'Twist: Blick auf die „Götter“ (Spieler:innen).'
    ].join('\n'),
    action: 'input',
    prompt: `Schreibe aus Sicht eines NPCs, wenn keine Spieler online sind. …`
  },

  {
    label: 'Prompt‑Archäologe',
    explain: 'Sende einen rohen Prompt – ich grabe die Idee frei und mache ihn kurz, präzise und wirksam.',
    placeholder: 'Irgendein Prompt (roh)',
    help: [
      'Du gibst: Einen unfertigen Prompt.',
      'Du bekommst: Eine destillierte, getestete Profi‑Version.',
      'Bonus: Zwei Varianten – knapp & kreativ.'
    ].join('\n'),
    action: 'input',
    prompt: `Analysiere und destilliere folgenden Prompt: {{input}} …`
  },

  {
    label: 'KI‑Träume',
    explain: 'Stichwort reicht – ich beschreibe einen seltsamen, schönen Traum, den eine KI hätte.',
    placeholder: 'Datenquelle/Anlass (frei)',
    help: [
      'Du gibst: Eine Datenquelle oder einen Anlass.',
      'Du bekommst: Einen poetischen KI‑Traum mit 3 Motiven.',
      'Bonus: Ein Bild, das hängen bleibt.'
    ].join('\n'),
    action: 'input',
    prompt: `Erfinde einen KI‑Traum, der sich aus {{input}} speist …`
  },

  {
    label: 'Recursive Story',
    explain: 'Nenne Genre/Anlass – die Story reflektiert sich selbst und wird dabei besser.',
    placeholder: 'Genre/Anlass',
    help: [
      'Du gibst: Genre oder Anlass.',
      'Du bekommst: Eine kurze Geschichte in rekursiven Schritten.',
      'Bonus: Der Text erklärt beiläufig sein eigenes Bauprinzip.'
    ].join('\n'),
    action: 'input',
    prompt: `Schreibe eine kurze rekursive Geschichte … {{input}}`
  },

  {
    label: 'Xenobiologie 2157',
    explain: 'Sag Planet/Klima/Prinzip – ich entwerfe glaubwürdiges, fremdes Leben.',
    placeholder: 'Planet/Klima/Prinzip',
    help: [
      'Du gibst: Umgebung und ein Naturprinzip.',
      'Du bekommst: Ökologie, Anatomie, Verhaltensmuster.',
      'Bonus: Eine kleine Szene im Habitat.'
    ].join('\n'),
    action: 'input',
    prompt: `Entwirf eine plausible Lebensform … {{input}}`
  },

  {
    label: 'Quantentagebuch',
    explain: 'Nenne Anlass/Ort/Person – Gefühle verhalten sich wie Quanten, und das Tagebuch reagiert.',
    placeholder: 'Anlass/Ort/Person',
    help: [
      'Du gibst: Eine Situation.',
      'Du bekommst: Ein Tagebuch‑Fragment mit „Mess‑Effekten“.',
      'Bonus: Leicht verständlich, keine Formeln.'
    ].join('\n'),
    action: 'input',
    prompt: `Tagebuch‑Eintrag mit Quanten‑Metaphern … {{input}}`
  },

  {
    label: 'Rückwärts‑Apokalypse',
    explain: 'Wähle einen Bereich – ich zeige eine Zukunft, in der Rückbau Fortschritt bedeutet.',
    placeholder: 'Sektor/Beispiel (z. B. „Gesundheit“)',
    help: [
      'Du gibst: Einen Sektor oder ein Beispiel.',
      'Du bekommst: 3 Szenen des Rückbaus mit Nutzen & Kosten.',
      'Bonus: Konkrete Regeln, die sofort anregbar sind.'
    ].join('\n'),
    action: 'input',
    prompt: `Zeige, wie bewusster Rückbau … {{input}}`
  },

  {
    label: 'Farbsynästhetiker',
    explain: 'Nenne zwei Songs – ich male dir die Farben und Texturen der Musik.',
    placeholder: '2 Musikstücke (alt/modern)',
    help: [
      'Du gibst: Zwei Musikstücke.',
      'Du bekommst: Farbfelder, Muster, Temperatur – rein in Worten.',
      'Bonus: Ein kleines Vergleichs‑Fazit.'
    ].join('\n'),
    action: 'input',
    prompt: `Beschreibe die Synästhesie zweier Stücke … {{input}}`
  },

  {
    label: 'Museum verlorener Träume',
    explain: 'Gib ein Thema – ich kuratiere 3 Artefakte aus gescheiterten Ideen.',
    placeholder: 'Thema/Leitmotiv',
    help: [
      'Du gibst: Thema oder Leitmotiv.',
      'Du bekommst: 3 Objekte mit Beschriftung und Herkunft.',
      'Bonus: Eine Frage am Ende, die kitzelt.'
    ].join('\n'),
    action: 'input',
    prompt: `Kuratiere ein kleines Museum … {{input}}`
  },

  {
    label: 'Zeitlupen‑Explosion',
    explain: 'Nenne Ort/Objekt/Beobachter – ich zerlege eine Sekunde in filmische Frames.',
    placeholder: 'Ort/Objekt/Beobachter',
    help: [
      'Du gibst: Ort, Objekt und Beobachter:in.',
      'Du bekommst: Eine Sekunde in 7–9 Momenten.',
      'Bonus: Ein letzter Frame, der nachhallt.'
    ].join('\n'),
    action: 'input',
    prompt: `Beschreibe eine Explosion in Zeitlupe … {{input}}`
  },

  {
    label: 'GPS des Bewusstseins',
    explain: 'Formuliere 3 Ziele – ich baue Navigations‑Ansagen für deinen Kopf.',
    placeholder: '3 Ziele (z. B. „Nostalgie, Mut, Fokus“)',
    help: [
      'Du gibst: Drei abstrakte Ziele.',
      'Du bekommst: Für jedes Ziel eine klare Route (Schritte, Abzweige, Warnungen).',
      'Bonus: Poetisch‑präzise, wie ein Navi.'
    ].join('\n'),
    action: 'input',
    prompt: `Erzeuge Navi‑Routen für Bewusstseinsziele … {{input}}`
  },

  {
    label: 'Biografie eines Pixels',
    explain: 'Wähle Gerät/Ära – ein Pixel erzählt aus seinem langen Leben.',
    placeholder: 'Gerät/Ära (z. B. „Röhrenmonitor 1999“)',
    help: [
      'Du gibst: Gerät und Zeit.',
      'Du bekommst: Eine Vita in Kapiteln – Licht, Bilder, Menschen.',
      'Bonus: Mini‑Momentaufnahme pro Kapitel.'
    ].join('\n'),
    action: 'input',
    prompt: `Biografie eines Pixels … {{input}}`
  },

  {
    label: 'Detektiv rückwärts',
    explain: 'Skizziere einen Fall – ich rekonstruere alles rückwärts, Schritt für Schritt.',
    placeholder: 'Fall‑Skizze (1–2 Sätze)',
    help: [
      'Du gibst: Eine kurze Fallskizze.',
      'Du bekommst: 5 Schritte rückwärts mit Zeitmarken.',
      'Bonus: Eine überraschende Erkenntnis am Schluss.'
    ].join('\n'),
    action: 'input',
    prompt: `Erkläre rückwärts, wie es dazu kam … {{input}}`
  },

  {
    label: 'Das Netz spricht',
    explain: 'Stell dem Netz eine Frage – das Netz antwortet als vielstimmiges Wesen.',
    placeholder: 'Leitfrage an „das Netz“',
    help: [
      'Du gibst: Eine Leitfrage.',
      'Du bekommst: Ein Dialog Ich ↔ Netz, inkl. Quellenlogik.',
      'Bonus: Ein Mem/Graph‑Bild zum Mitnehmen (in Worten).'
    ].join('\n'),
    action: 'input',
    prompt: `Gespräch „Ich ↔ Netz“ … {{input}}`
  },

  {
    label: 'Emotions‑Alchemist',
    explain: 'Sag Ausgangs‑ und Zielgefühle – ich koche dir 3 kleine Stimmungs‑Rezepte.',
    placeholder: 'Zielgefühl(e) (z. B. „Neugier aus Langeweile“)',
    help: [
      'Du gibst: Was du fühlst und wohin es soll.',
      'Du bekommst: Drei Rezepte mit Zutaten, Schritten, Risiken.',
      'Bonus: Haltbarkeitshinweis je Rezept.'
    ].join('\n'),
    action: 'input',
    prompt: `Erfinde 3 Emotions‑Rezepte … {{input}}`
  },

  {
    label: 'Bibliothek ungelebter Leben',
    explain: 'Nenne Person + Wendepunkt – ich katalogisiere das „Was wäre wenn“.',
    placeholder: 'Person/Turning‑Point',
    help: [
      'Du gibst: Eine Person und eine verpasste Abzweigung.',
      'Du bekommst: 3 Buchrücken mit Klappentexten.',
      'Bonus: Ein leiser Satz, der bleibt.'
    ].join('\n'),
    action: 'input',
    prompt: `Bibliotheks‑Einträge … {{input}}`
  },

  {
    label: 'Realitäts‑Debugger',
    explain: 'Gib ein Thema – ich zeige dir kleine Bugs deiner alltäglichen Wirklichkeit.',
    placeholder: 'Thema/Skala (z. B. „Alltag, Küche“)',
    help: [
      'Du gibst: Thema + Größe (Mikro/Meso/Makro).',
      'Du bekommst: 5 Bugs mit Repro‑Schritten & Fix‑Ideen.',
      'Bonus: Eine Hypothese, warum wir sie übersehen.'
    ].join('\n'),
    action: 'input',
    prompt: `Finde Realitäts-Bugs … {{input}}`
  },

  {
    label: 'Empathie‑Tutorial',
    explain: 'Wähle eine Sequenz – ich erkläre schwierige Dinge mit Empathie.',
    placeholder: 'Sequenz (z. B. „Alien → Quantencomputer → Zeit“)',
    help: [
      'Du gibst: Die Lernstrecke.',
      'Du bekommst: 3 Lernbilder mit Brücke in deinen Alltag.',
      'Bonus: Ein Mini‑Merksatz.'
    ].join('\n'),
    action: 'input',
    prompt: `Baue ein Empathie‑Tutorial … {{input}}`
  },

  {
    label: 'Surrealismus‑Generator',
    explain: 'Nenne drei Alltagsobjekte – ich baue eine angenehme Verwunderung daraus.',
    placeholder: '3 Alltagsobjekte',
    help: [
      'Du gibst: Drei Dinge von heute.',
      'Du bekommst: Eine kurze Szene im Stil des sanften Surrealismus.',
      'Bonus: Eine Pointe, die nicht laut schreit.'
    ].join('\n'),
    action: 'input',
    prompt: `Surreale Mini‑Szene … {{input}}`
  },

  {
    label: 'Vintage‑Futurist 1920',
    explain: 'Sag moderne Technik – ich entwerfe sie so, wie 1920 sie sich vorgestellt hätte.',
    placeholder: 'Geräte/Phänomene (z. B. „Smartphone, KI“)',
    help: [
      'Du gibst: Moderne Geräte oder Phänomene.',
      'Du bekommst: Zukunftsbilder im Stil von 1920 – inkl. Fehlannahmen.',
      'Bonus: Ein Anzeigen‑Slogan der Zeit.'
    ].join('\n'),
    action: 'input',
    prompt: `Erkläre moderne Technik, als wäre 1920 … {{input}}`
  },

  {
    label: 'Synästhetisches Internet',
    explain: 'Nenne drei Websites/Anwendungsfälle – das Netz wird zu Duft, Temperatur und Geräusch.',
    placeholder: '3 Sites/Anwendungsfälle',
    help: [
      'Du gibst: Drei Beispiele aus dem Web.',
      'Du bekommst: Sinnes‑Portraits (Geruch, Klang, Haptik).',
      'Bonus: 1 Satz, wie es sich „anfühlt“.'
    ].join('\n'),
    action: 'input',
    prompt: `Sinnes‑Übertragung des Internets … {{input}}`
  },

  // ==== Profi‑Werkzeuge ==========================================================
  {
    label: 'Code‑Poet',
    explain: 'Nenne eine kleine Aufgabe – ich schreibe eleganten, gut kommentierten Code.',
    placeholder: 'Kleine Funktion/Aufgabe',
    help: [
      'Du gibst: Eine Mini‑Aufgabe (Beschreibung).',
      'Du bekommst: Sauberen Code + 2 Tests, verständlich erläutert.',
      'Bonus: Ein kurzer Performance‑Hinweis.'
    ].join('\n'),
    action: 'input',
    prompt: `Schreibe sauberen, gut kommentierten Code … {{input}}`
  },

  {
    label: 'Kollektiv‑Moderator',
    explain: 'Beschreibe eine Entscheidung – ich simuliere eine Runde mit Argumenten & Konsens.',
    placeholder: 'Entscheidung/Problem',
    help: [
      'Du gibst: Kontext + Ziel.',
      'Du bekommst: 4 Perspektiven, Risiken, Kompromiss.',
      'Bonus: Eine klare Empfehlung.'
    ].join('\n'),
    action: 'input',
    prompt: `Moderation eines Kollektivs … {{input}}`
  },

  {
    label: 'Paradox‑Atelier',
    explain: 'Wähle 2–3 Paradoxien – ich mache daraus eine stimmige Idee.',
    placeholder: 'Wähle 2–3 Paradoxien',
    help: [
      'Du gibst: Zwei bis drei Spannungen.',
      'Du bekommst: Ein Konzept, das beide Seiten trägt.',
      'Bonus: Ein Anwendungstest in der Praxis.'
    ].join('\n'),
    action: 'input',
    prompt: `Konstruiere eine Idee aus Paradoxien … {{input}}`
  },

  {
    label: 'Universums‑Übersetzer',
    explain: 'Begriffe rein – Märchen, Musik und ein Wesen raus.',
    placeholder: 'Begriffe/Thema (z. B. „Quantenverschränkung“)',
    help: [
      'Du gibst: Fachbegriffe oder ein Thema.',
      'Du bekommst: (1) Märchenfassung, (2) Musik‑Beschreibung, (3) Lebewesen‑Story.',
      'Bonus: Ein gemeinsames Motiv verbindet alles.'
    ].join('\n'),
    action: 'input',
    prompt: `Übersetze folgendes Thema in drei Formen … {{input}}`
  },

  {
    label: 'Prompt‑Destiller Pro',
    explain: 'Roh‑Prompt rein – präzise Profi‑Version raus.',
    placeholder: 'Roh‑Prompt einfügen',
    help: [
      'Du gibst: Einen unfertigen Prompt.',
      'Du bekommst: Eine knackige, getestete Version plus kurze Begründung.',
      'Bonus: Eine kreative Variante.'
    ].join('\n'),
    action: 'input',
    prompt: `Destilliere diesen Prompt … {{input}}`
  },

  {
    label: 'Zweispaltige Szene',
    explain: 'Beschreibe Ort & zwei Zeitpunkte – ich schreibe eine doppelte Szene zum Vergleichen.',
    placeholder: 'Szene/Ort + 2 Zeitpunkte',
    help: [
      'Du gibst: Ort & Zeitpunkt A/B.',
      'Du bekommst: Zwei Spalten – Spiegelungen & Kontraste.',
      'Bonus: Ein gemeinsamer Schlusssatz.'
    ].join('\n'),
    action: 'input',
    prompt: `Zweispaltige Szene … {{input}}`
  },

  {
    label: 'Regie‑Coach VO',
    explain: 'Gib Thema/Produkt + Ton – ich liefere einen sprechreifen Voice‑over‑Text.',
    placeholder: 'Thema/Produkt + Tonalität',
    help: [
      'Du gibst: Inhalt + gewünschte Stimmung.',
      'Du bekommst: 45–60 Sekunden VO mit Atem & Rhythmus.',
      'Bonus: Regie‑Hinweise für die Aufnahme.'
    ].join('\n'),
    action: 'input',
    prompt: `VO‑Text & Regie‑Hinweise … {{input}}`
  },

  {
    label: 'Weltbau‑Schachbrett',
    explain: 'Gib 8 Stichworte – ich baue daraus eine Welt entlang eines Kompasses.',
    placeholder: '8 Stichworte (Kompass)',
    help: [
      'Du gibst: Acht Stichworte.',
      'Du bekommst: Ein Raster aus Orten, Figuren, Regeln.',
      'Bonus: Ein Hook für die erste Szene.'
    ].join('\n'),
    action: 'input',
    prompt: `Weltbau entlang eines Kompasses … {{input}}`
  },

  {
    label: 'Daten → Poesie',
    explain: 'Beschreibe kurz die Datenlage – ich antworte mit einem Gedicht, das das Muster trägt.',
    placeholder: 'Kurz Datenlage/Trend',
    help: [
      'Du gibst: Daten/Beobachtung.',
      'Du bekommst: Eine poetische Verdichtung mit erkennbarem Muster.',
      'Bonus: Eine letzte, nüchterne Zeile als „Realitätsanker“.'
    ].join('\n'),
    action: 'input',
    prompt: `Gedicht aus Daten … {{input}}`
  },

  {
    label: 'RAG‑Doktor Light',
    explain: 'Skizziere deinen RAG‑Use‑Case – ich prüfe Nutzen, Quellen und schnelle Schritte.',
    placeholder: 'RAG‑Use‑Case grob skizzieren',
    help: [
      'Du gibst: Ziel, Daten, Nutzer:innen.',
      'Du bekommst: Diagnose (Nutzen, Risiken) + 3 schnelle Schritte.',
      'Bonus: Ein Minimal‑Prototyp als Text.'
    ].join('\n'),
    action: 'input',
    prompt: `Diagnose eines RAG‑Vorhabens … {{input}}`
  },

  {
    label: 'Delight‑Scorer',
    explain: 'Nenne Produkt/Feature – ich bewerte den Wow‑Faktor und schlage kleine Magie vor.',
    placeholder: 'Produkt/Story/Feature',
    help: [
      'Du gibst: Produkt oder Story.',
      'Du bekommst: Scorekarte mit „Delight‑Moments“ und Reibung.',
      'Bonus: 2 Experimente zum Ausprobieren.'
    ].join('\n'),
    action: 'input',
    prompt: `Scoring & Ideen für Delights … {{input}}`
  },

  {
    label: 'Solo‑RPG‑Baukasten',
    explain: 'Gib Genre/Seed – ich baue dir einen kleinen Solo‑Abend.',
    placeholder: 'Genre/Seed',
    help: [
      'Du gibst: Genre/Startidee.',
      'Du bekommst: Regeln light, Tabellen, erste Szene.',
      'Bonus: Ein Cliffhanger für Runde 2.'
    ].join('\n'),
    action: 'input',
    prompt: `Solo‑RPG in 1 Datei … {{input}}`
  },

  {
    label: 'Dream‑Room‑Designer',
    explain: 'Sag Gefühl/Zweck – ich entwerfe einen Raum mit Licht, Klang & Material.',
    placeholder: 'Gefühl/Anwendung (z. B. „tiefer Fokus, Studio“)',
    help: [
      'Du gibst: Zweck und Gefühl.',
      'Du bekommst: Licht, Klang, Material, Layout – als präzise Skizze.',
      'Bonus: Ein Budget‑Hack.'
    ].join('\n'),
    action: 'input',
    prompt: `Entwerfe einen Traum‑Raum … {{input}}`
  },

  {
    label: 'Narrativ‑Kompass',
    explain: 'Formuliere eine These – ich gebe dir vier Blickwinkel zum Ausbalancieren.',
    placeholder: 'These/Frage',
    help: [
      'Du gibst: Eine These oder Frage.',
      'Du bekommst: Vier Pole (z. B. Vision ↔ Risiko) + Balance‑Vorschlag.',
      'Bonus: Ein Entscheidungs‑Satz.'
    ].join('\n'),
    action: 'input',
    prompt: `Erzeuge einen Narrativ‑Kompass … {{input}}`
  },

  {
    label: 'One‑Shot‑Scifi',
    explain: 'Sag die Kernidee – ich liefere eine filmreife Kurz‑Sci‑Fi.',
    placeholder: 'Kernidee (1 Satz)',
    help: [
      'Du gibst: Eine einzige Idee.',
      'Du bekommst: Eine kurze, dichte Sci‑Fi‑Story.',
      'Bonus: Ein optionaler Tagline.'
    ].join('\n'),
    action: 'input',
    prompt: `Schreibe eine 900–1100 Zeichen lange One‑Shot‑Sci‑Fi mit einem markanten Bild/Objekt als Anker. Idee:
{{input}}`
  }
];
