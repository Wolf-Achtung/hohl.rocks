// public/js/ticker-items.js — 40 inspirierende Micro-Apps (klarer Input/Output/Format)
// Jede Bubble hat: label, explain (kurz), placeholder, help (Cheat‑Sheet), action, prompt.
// Die Prompts sind Claude‑optimiert (strukturierte Anforderungen + Format + Stil).

export const __TICKER_ITEMS = [
  // ---- Daily spotlight (gefüllt durch /api/daily) --------------------------------------------
  {
    label: 'Heute neu',
    explain: 'Tages‑Spotlight aus News',
    placeholder: '—',
    help: 'Automatisch befüllt. Zeigt eine frische, kuratierte Notiz des Tages.',
    action: 'info',
    prompt: 'Tagesnotiz erscheint hier.'
  },

  // ==== 1–30: Optimierte Versionen deiner 30 Ideen ============================================

  {
    label: 'Zeitreise‑Tagebuch 2084',
    explain: '2024 → 2084 umschreiben',
    placeholder: 'Kurzer Tagebucheintrag aus 2024',
    help: [
      'Eingabe: 3–8 Sätze (Tagebucheintrag 2024).',
      'Ausgabe: gleiche Szene, aber 2084 (Technik, Gesellschaft, neue Rituale).',
      'Format: 3 Absätze (Beobachtung • Detail • Nachklang).',
      'Stil: persönlich, glaubwürdig; keine Sci‑Fi‑Klischees.',
      'Beispiel: „Pendeln nach Kreuzberg, Agentenmeeting, Stromausfall im Haus.“'
    ].join('\\n'),
    action: 'input',
    prompt: `# Aufgabe
Schreibe den eingegebenen Tagebuchauszug so, als stamme er aus dem Jahr 2084.
# Anforderungen
- Bewahre Emotionen/Absicht des Originals.
- Aktualisiere Referenzen (Mobilität, Arbeit, Medien, Klima, KI‑Alltag, Governance).
- Baue 2 konkrete Alltagsdetails 2084 ein (Geräte, Interfaces, soziale Normen).
- Subtile Welt: keine Exposition Dumps, sondern beiläufige Hinweise.
# Format
Drei Absätze: (1) Beobachtung, (2) Konkretes Detail, (3) Nachklang/Reflexion.
# Material
Original:
{{input}}`
  },

  {
    label: 'Rückwärts‑Zivilisation',
    explain: 'Fortschritt → bewusst rückwärts',
    placeholder: '1–2 Sätze zur Welt/Prämisse',
    help: [
      'Eingabe: Grundidee (Ort, Motiv).',
      'Ausgabe: Mini‑Dossier (Philosophie, Alltag, Rituale, Technik‑Tabus).',
      'Format: 5 Abschnitte mit Bulletpoints.',
      'Beispiel: „Stadt‑Staat, der jedes Jahr Technikniveau senkt.“'
    ].join('\\n'),
    action: 'input',
    prompt: `Skizziere eine Zivilisation, die sich absichtlich rückwärts entwickelt.
Gliedere in: (1) Ursprung/Beweggrund, (2) Ethik/Philosophie, (3) Alltagsleben, (4) Institutionen und Rituale, (5) Spannungen/Konflikte.
Vermeide Klischees, liefere konkrete, beobachtbare Szenen.
Startidee: {{input}}`
  },

  {
    label: 'Bewusstes Gebäude',
    explain: 'Haus erzählt in Andeutungen',
    placeholder: 'Ort/Typ + Ereignis (z. B. „Altbau, Abschied“)',
    help: [
      'Eingabe: Ort/Typ + Anlass.',
      'Ausgabe: 600–900 Zeichen Ich‑Erzählung des Gebäudes.',
      'Form: Bilder über Geräusche/Licht/Material statt „ich fühle“.',
      'Beispiel: „Bibliothek, Nacht der Evakuierung.“'
    ].join('\\n'),
    action: 'input',
    prompt: `Erzähle aus der Perspektive eines 200 Jahre alten Gebäudes.
- Das Gebäude kommuniziert nur durch kleine architektonische Veränderungen.
- Nutze Sinnesdetails (Licht, Temperatur, Vibrationen, Gerüche).
- Keine Menschenpsychologie, sondern Material‑Logik.
Kontext: {{input}}`
  },

  {
    label: 'Sokratischer Mentor',
    explain: 'Philosoph im Jahr 2025',
    placeholder: 'Thema/Frage (z. B. „KI in Schulen?“)',
    help: [
      'Eingabe: ein Dilemma/These.',
      'Ausgabe: 8–12 Q&A‑Zyklen (Sokrates → Ich → Sokrates …).',
      'Stil: altgriechisch nüchtern, neugierig, respektvoll.',
      'Ziel: Widersprüche aufdecken, Definitionen schärfen.'
    ].join('\\n'),
    action: 'input',
    prompt: `Führe ein kurzes sokratisches Gespräch über das Thema:
{{input}}
Vorgehen: Frage → kurze Antwort (Platzhalter: „[Meine Antwort]“) → Gegenfrage (steigende Tiefe). Liefere 8–12 Zyklen, schließe mit einer präzisen, neutralen Zusammenfassung der gewonnenen Definitionen und offenen Fragen.`
  },

  {
    label: 'Interdimensionaler Markt',
    explain: 'Tour über unmögliche Waren',
    placeholder: 'Reiseinteresse / Suchliste',
    help: [
      'Eingabe: Reisewunsch (z. B. „Energie‑Artefakte, Essbares, Karten“).',
      'Ausgabe: interaktive Tour mit 5 Ständen (+ Entscheidungsoptionen).',
      'Format: Stand → Beschreibung → Angebot → „Option A/B“.'
    ].join('\\n'),
    action: 'input',
    prompt: `Baue eine geführte Tour über einen interdimensionalen Marktplatz.
Zeige fünf Stände verschiedener Universen, je: Szene, Händler, 3 Waren, Preislogik, Risiko.
Schließe jeden Stand mit einer Entscheidungsfrage (Option A/B), die plausibel auf das Nächste wirkt.
Wunschliste: {{input}}`
  },

  {
    label: 'NPC nach Feierabend',
    explain: 'Spiel‑Figur mit Privatleben',
    placeholder: 'Genre/Setting (z. B. „Open‑World Noir“)',
    help: [
      'Eingabe: Genre/Setting.',
      'Ausgabe: 900–1200 Zeichen Mini‑Erzählung mit 2 Nebenfiguren.',
      'Twist: Sicht auf „Götter“ (Spieler) einflechten.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe aus Sicht eines NPCs, wenn keine Spieler online sind.
Zeige Routinen, Wünsche und Friktionen; meide Self‑Referential Gags. Baue eine subtile Anspielung auf die Design‑Logik der Spielwelt ein.
Setting: {{input}}`
  },

  {
    label: 'Prompt‑Archäologe',
    explain: 'Schichten & Annahmen',
    placeholder: 'Irgendein Prompt (roh)',
    help: [
      'Eingabe: dein Prompt (roh).',
      'Ausgabe: Analyse der „Schichten“ (Ziel, Annahmen, blinde Stellen).',
      'Plus: verbesserte Version (präzise, messbar, sicher).'
    ].join('\\n'),
    action: 'input',
    prompt: `Analysiere den Prompt wie ein Artefakt: Ziel, Annahmen, blinde Stellen, implizite Rollen, Nebenwirkungen.
Danach: Schreibe eine „Gold‑Standard“‑Version mit
- Rollenklärung,
- konkreten Outputs/Qualitätskriterien,
- Formatvorgabe,
- Guardrails (Grenzen, Ethik).
Prompt (roh):
{{input}}`
  },

  {
    label: 'KI‑Träume',
    explain: 'Surreale Daten‑Träume',
    placeholder: 'Datenquelle/Anlass (frei)',
    help: [
      'Eingabe: Seed (z. B. „Sonnenwetterdaten, 1990–2025“).',
      'Ausgabe: 3–5 kurze Traumsequenzen (poetisch + technisch).',
      'Stil: „beautiful nerdy“ – Metaphern + Mechanik.'
    ].join('\\n'),
    action: 'input',
    prompt: `Simuliere Träume einer KI: surreale Sequenzen, gespeist aus fragmentierten Daten und Algorithmen. Mische poetische Bilder und technische Begriffe (Rausch, Gradienten, Puffer, Überläufe). Seed:
{{input}}`
  },

  {
    label: 'Recursive Story',
    explain: 'Geschichte in Spiegeln',
    placeholder: 'Genre/Anlass',
    help: [
      'Eingabe: Genre/Anlass.',
      'Ausgabe: 3 Ebenen (Autor ↔ KI ↔ Autor …), klare Übergänge.',
      'Ende: überraschende, doch stimmige Auflösung.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe eine mehrschichtige Geschichte: Autor nutzt KI, die über Autor schreibt, der KI nutzt. Drei Ebenen, jeweils eigener Stil; klare Marker; kein Selbstläufer‑Loop, sondern sinnvolle Progression. Thema:
{{input}}`
  },

  {
    label: 'Xenobiologie 2157',
    explain: '3 Lebensformen, radikal neu',
    placeholder: 'Planet/Klima/Prinzip',
    help: [
      'Eingabe: Rahmen (z. B. „Ammoniak‑Ozean, dunkle Sonne“).',
      'Ausgabe: 3 Spezies (Biologie, Verhalten, Ökologie, Kulturansatz).',
      'Stil: wissenschaftlich‑präzise, dennoch anschaulich.'
    ].join('\\n'),
    action: 'input',
    prompt: `Du bist Xenobiologe (2157). Beschreibe drei Lebensformen: Morphologie, Energiegewinn, Fortpflanzung, Sinne, Verhalten, Ökosystemrolle, potenzielle Kommunikation. Rahmen:
{{input}}`
  },

  {
    label: 'Quantentagebuch',
    explain: 'Ein Tag in Überlagerung',
    placeholder: 'Anlass/Ort/Person',
    help: [
      'Eingabe: Seed.',
      'Ausgabe: mehrere parallele Pfade (Abschnitt je Spur), kurze Verzweigungen.',
      'Ende: eleganter Fächer statt „alles war ein Traum“.'
    ].join('\\n'),
    action: 'input',
    prompt: `Führe ein Tagebuch eines Partikels in Überlagerung. Schreibe simultane Varianten desselben Tages (Pfade A/B/C …), mit knappen Abzweigungen und Interferenzen. Seed:
{{input}}`
  },

  {
    label: 'Rückwärts‑Apokalypse',
    explain: 'Perfektion wird Gefahr',
    placeholder: 'Sektor/Beispiel (z. B. „Gesundheit“)',
    help: [
      'Eingabe: Bereich.',
      'Ausgabe: kurze Weltbeschreibung + Konflikt + 3 Überlebensstrategien.'
    ].join('\\n'),
    action: 'input',
    prompt: `Beschreibe eine „Rückwärts‑Apokalypse“: Gesellschaft wird immer perfekter – und genau das bedroht Freiheit/Entwicklung. Liefere (1) Weltbild, (2) Konfliktfelder, (3) 3 Strategien, um Menschlichkeit zu bewahren.
Bereich: {{input}}`
  },

  {
    label: 'Farbsynästhetiker',
    explain: 'Musik → Landschaften',
    placeholder: '2 Musikstücke (alt/modern)',
    help: [
      'Eingabe: Zwei Musikstücke (Titel/Version).',
      'Ausgabe: je Stück eine synästhetische Landschaft (Licht, Textur, Temperatur, Bewegungen).'
    ].join('\\n'),
    action: 'input',
    prompt: `Beschreibe zwei Musikstücke als visuelle Landschaften (Licht, Textur, Temperatur, Bewegungen). Nutze präzise Sinneswörter, kein allgemeines „schön“. Stücke:
{{input}}`
  },

  {
    label: 'Museum verlorener Träume',
    explain: '3 Räume, 3 Exponate',
    placeholder: 'Thema/Leitmotiv',
    help: [
      'Eingabe: Leitmotiv (z. B. „Unvollendete Briefe“).',
      'Ausgabe: 3 Ausstellungsräume (Exponat, Herkunft, Effekt auf Besucher).'
    ].join('\\n'),
    action: 'input',
    prompt: `Kuratiere drei Räume im „Museum der verlorenen Träume“. Pro Raum: Titel, Exponat, Provenienz, Inszenierung, Reaktion der Besuchenden. Leitmotiv:
{{input}}`
  },

  {
    label: 'Zeitlupen‑Explosion',
    explain: '3 Sekunden als Epos',
    placeholder: 'Ort/Objekt/Beobachter',
    help: [
      'Eingabe: Rahmen (z. B. „Werkstatt, Sauerstoffflasche, Nachtschicht“).',
      'Ausgabe: 3 Sekunden, in Mikro‑Phasen zergliedert (0.0–3.0 s).',
      'Perspektiven: Partikel, Geräusch, Gedanke.'
    ].join('\\n'),
    action: 'input',
    prompt: `Beschreibe eine Explosion in extremer Zeitlupe. Unterteile in Zeitscheiben (0.0–3.0 s). Führe Mikro‑Perspektiven (Partikel, Geräusch, Gedanke) parallel. Rahmen:
{{input}}`
  },

  {
    label: 'GPS des Bewusstseins',
    explain: 'Wegbeschreibung zu Abstrakta',
    placeholder: '3 Ziele (z. B. „Nostalgie, Mut, Fokus“)',
    help: [
      'Eingabe: 3 Abstrakta.',
      'Ausgabe: je Ziel eine „Route“ (Anweisungen, Landmarken, Warnungen).',
      'Stil: poetisch‑präzise, als Navigationsansage.'
    ].join('\\n'),
    action: 'input',
    prompt: `Du bist ein Navigationssystem für Bewusstsein. Erstelle zu jedem Ziel eine Route (Start, Wegpunkte, Ankunft), inkl. Landmarken und Warnungen. Ziele:
{{input}}`
  },

  {
    label: 'Biografie eines Pixels',
    explain: 'Vom Werk bis zu Augen',
    placeholder: 'Gerät/Ära (z. B. „Röhrenmonitor 1999“)',
    help: [
      'Eingabe: Gerät/Ära.',
      'Ausgabe: Vita in Kapiteln, Fokus auf Licht, Bilder, Menschen.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe die Lebensgeschichte eines Pixels: Geburt (Fertigung), erste Einsätze, ikonische Momente, Burn‑in‑Ängste, Re‑Use. Kapitelweise, technisch‑poetisch.
Kontext: {{input}}`
  },

  {
    label: 'Detektiv rückwärts',
    explain: 'Konsequenz → Tat → Motiv',
    placeholder: 'Fall‑Skizze (1–2 Sätze)',
    help: [
      'Eingabe: Fall‑Skizze.',
      'Ausgabe: Rekonstruktion rückwärts in 5 Schritten, klare Zeitmarker.'
    ].join('\\n'),
    action: 'input',
    prompt: `Löse einen Fall rückwärts: beginne mit der Konsequenz, arbeite zur Tat und den Motiven zurück. 5 Schritte, klare Zeitmarker. Fall:
{{input}}`
  },

  {
    label: 'Das Netz spricht',
    explain: 'Kollektives Internet‑Ich',
    placeholder: 'Leitfrage an „das Netz“',
    help: [
      'Eingabe: Leitfrage.',
      'Ausgabe: Gespräch „Ich ↔ Netz“, Netz antwortet in Mem‑/Graph‑Logik.'
    ].join('\\n'),
    action: 'input',
    prompt: `Simuliere ein Gespräch zwischen mir und dem kollektiven Bewusstsein des Internets. Das Netz denkt in Verbindungen, Graphen, Memetik. Frage:
{{input}}`
  },

  {
    label: 'Emotions‑Alchemist',
    explain: 'Rezepte für Gefühle',
    placeholder: 'Zielgefühl(e) (z. B. „Neugier aus Langeweile“)',
    help: [
      'Eingabe: Ausgangs‑ und Zielgefühle.',
      'Ausgabe: 3 „Rezepte“ (Zutaten, Schritte, Risiken, Haltbarkeit).'
    ].join('\\n'),
    action: 'input',
    prompt: `Du bist Alchemist für Emotionen. Formuliere drei Rezepte, um Gefühle zu wandeln (Zutaten, Schritte, Risiken, Haltbarkeit). Ziel:
{{input}}`
  },

  {
    label: 'Bibliothek ungelebter Leben',
    explain: '3 Bücher, 3 Pfade',
    placeholder: 'Person/Turning‑Point',
    help: [
      'Eingabe: Person + Wendepunkt.',
      'Ausgabe: 3 „Bücher“ mit Klappentext + 1 Szene.'
    ].join('\\n'),
    action: 'input',
    prompt: `Kuratiere drei Bücher einer Bibliothek ungelebter Leben. Zu jedem: Titel, Klappentext (80–120 Wörter), eine Szene (konkret). Person+Wendepunkt:
{{input}}`
  },

  {
    label: 'Realitäts‑Debugger',
    explain: '3 Physics‑Bugs',
    placeholder: 'Thema/Skala (z. B. „Alltag, Küche“)',
    help: [
      'Eingabe: Thema/Skala.',
      'Ausgabe: 3 Bugs + Debug‑Hypothese + Fix‑Versuch; falsifizierbar.'
    ].join('\\n'),
    action: 'input',
    prompt: `Du findest drei physikalische „Bugs“ in der Realität dieser Skala und schlägst Debug‑Hypothesen samt Fix‑Versuchen vor. Skala/Thema:
{{input}}`
  },

  {
    label: 'Empathie‑Tutorial',
    explain: 'Fremde Lebensformen fühlen',
    placeholder: 'Sequenz (z. B. „Alien → Quantencomputer → Zeit“)',
    help: [
      'Eingabe: Sequenz von 3 „Wesen“.',
      'Ausgabe: 3 Übungen (Beschreibung → Aufgabe → Reflexion).'
    ].join('\\n'),
    action: 'input',
    prompt: `Entwickle ein Tutorial mit drei Stufen:
1) Alien, 2) Quantencomputer, 3) ein Abstraktum (z. B. Zeit).
Für jede Stufe: kurzer Zugang (Beschreibung), Übung (Anleitung), Reflexion (Fragen). Sequenz:
{{input}}`
  },

  {
    label: 'Surrealismus‑Generator',
    explain: 'Alltag → Dalí‑like Funktion',
    placeholder: '3 Alltagsobjekte',
    help: [
      'Eingabe: 3 Objekte.',
      'Ausgabe: je Objekt ein surreales Kunstwerk inkl. „Funktion“.'
    ].join('\\n'),
    action: 'input',
    prompt: `Verwandle die Objekte in surreale Kunstwerke (Form, Material, Schattenlogik) und gib ihnen eine Funktion in einer Traum‑Ökonomie. Objekte:
{{input}}`
  },

  {
    label: 'Vintage‑Futurist 1920',
    explain: 'Moderne Technik retro erklärt',
    placeholder: 'Geräte/Phänomene (z. B. „Smartphone, KI“)',
    help: [
      'Eingabe: Liste moderner Technik.',
      'Ausgabe: 1920er Beschreibung (Wortwahl, Metaphern, Weltbild).'
    ].join('\\n'),
    action: 'input',
    prompt: `Beschreibe die moderne Technik, als würde sie 1920 erfunden. Stimme, Wortwahl, Metaphern entsprechend anpassen. Liste:
{{input}}`
  },

  {
    label: 'Synästhetisches Internet',
    explain: 'Webseiten für alle Sinne',
    placeholder: '3 Sites/Anwendungsfälle',
    help: [
      'Eingabe: 3 Seiten/Anlässe.',
      'Ausgabe: multisensorische Spezifikation (Geschmack, Textur, Duft, Haptik, Klang).'
    ].join('\\n'),
    action: 'input',
    prompt: `Entwirf drei multisensorische Websites. Pro Site: Ziel, Sinnesprofil (Geschmack, Textur, Duft, Haptik, Klang), Interaktionen, Accessibility‑Hinweise. Fälle:
{{input}}`
  },

  {
    label: 'Code‑Poet',
    explain: 'Funktion als Poesie',
    placeholder: 'Kleine Funktion/Aufgabe',
    help: [
      'Eingabe: gewünschte Funktion.',
      'Ausgabe: lauffähiger Code, der zugleich als Poesie funktioniert (Kommentare/Rhythmus).'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe eine kleine Funktion in einer passenden Sprache, die technisch korrekt ist und gleichzeitig poetisch wirkt (Rhythmus, Metaphern in Kommentaren/Bezeichnern). Aufgabe:
{{input}}`
  },

  {
    label: 'Kollektiv‑Moderator',
    explain: 'Innere Stimmen debattieren',
    placeholder: 'Entscheidung/Problem',
    help: [
      'Eingabe: Entscheidung.',
      'Ausgabe: Dialog zwischen Ratio, Unterbewusstsein, Intuition, Gewissen, Emotionen → „Gemeinsamer Beschluss“.'
    ].join('\\n'),
    action: 'input',
    prompt: `Moderiere ein Gespräch zwischen fünf inneren Instanzen (Ratio, Unterbewusstsein, Intuition, Gewissen, Emotionen) zur Entscheidung:
{{input}}
Gib Rollenregeln, Diskussionsrunde, Danach eine klare, verantwortete Entscheidung + Next Steps.`
  },

  {
    label: 'Paradox‑Atelier',
    explain: 'Paradoxien produktiv machen',
    placeholder: 'Wähle 2–3 Paradoxien',
    help: [
      'Eingabe: Paradoxien (Zeitreise, Lügner, Theseus …).',
      'Ausgabe: je Paradoxon 2 kreative Werkzeuge/Modelle.'
    ].join('\\n'),
    action: 'input',
    prompt: `Nimm die Paradoxien und forme daraus kreative Werkzeuge (Modell, Methode, Übung). Nenne Einsatzfälle.
Paradoxien: {{input}}`
  },

  {
    label: 'Universums‑Übersetzer',
    explain: 'Fach → Märchen/ Musik / Wesen',
    placeholder: 'Begriffe/Thema (z. B. „Quantenverschränkung“)',
    help: [
      'Eingabe: Fachthema/Begriffe.',
      'Ausgabe: (1) Märchenfassung, (2) Musik‑Beschreibung, (3) Lebewesen‑Story.'
    ].join('\\n'),
    action: 'input',
    prompt: `Übersetze das Thema in drei Formen: (1) Märchen, (2) Musikbeschreibung (Tempo, Tonarten, Instrumente), (3) Kurzgeschichte über ein Wesen. Thema:
{{input}}`
  },

  // ==== 31–40: 10 brandneue, „atemberaubende“ Ideen ============================================

  {
    label: 'Prompt‑Destiller Pro',
    explain: 'Aus roh → messbar & sicher',
    placeholder: 'Roh‑Prompt einfügen',
    help: [
      'Eingabe: unpräziser Prompt.',
      'Ausgabe: „Gold‑Standard“‑Prompt mit Rollen, Qualitätskriterien, Format, Guardrails, Negativliste.',
      'Bonus: 3 Varianten (kurz, präzise, explorativ).'
    ].join('\\n'),
    action: 'input',
    prompt: `Analysiere und destilliere den Prompt in eine messbare, getestete Version. Liefere zusätzlich drei Varianten (kurz, präzise, explorativ).
Roh‑Prompt:
{{input}}`
  },

  {
    label: 'Zweispaltige Szene',
    explain: 'Zwei Zeiten parallel',
    placeholder: 'Szene/Ort + 2 Zeitpunkte',
    help: [
      'Eingabe: Ort und zwei Zeitpunkte.',
      'Ausgabe: zweispaltiger Text (links Zeit A, rechts Zeit B), synchronisierte Beats.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe eine Szene als zweispaltigen Text: Links „Zeit A“, rechts „Zeit B“. Synchronisiere die Beats (Zeilenweise Anker). Thema:
{{input}}`
  },

  {
    label: 'Regie‑Coach VO',
    explain: 'Voice‑Over mit Timecodes',
    placeholder: 'Thema/Produkt + Tonalität',
    help: [
      'Eingabe: Produkt/These + Tonalität.',
      'Ausgabe: VO‑Text mit Timecodes (0:00–0:30) + Betonung/Atmung.',
      'Bonus: 2 Alternativ‑Takes.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe ein Voice‑over (0:00–0:30) mit Timecodes, Atempausen, Betonungen. Tonalität/Produkt:
{{input}}
Gib zwei kurze Alternativen (A/B).`
  },

  {
    label: 'Weltbau‑Schachbrett',
    explain: '8×8 Constraints → Welt',
    placeholder: '8 Stichworte (Kompass)',
    help: [
      'Eingabe: 8 Stichworte (z. B. Klima, Glaube, Handel, Recht …).',
      'Ausgabe: 8×8 Felder als knappe Weltregeln + 3 Szenenbeispiele.'
    ].join('\\n'),
    action: 'input',
    prompt: `Erzeuge ein 8×8 Weltbau‑Schachbrett (Zeilen=Domänen, Spalten=Aspekte) mit knappen Regeln. Danach drei Szenen, die die Regeln sichtbar machen.
Stichworte: {{input}}`
  },

  {
    label: 'Daten → Poesie',
    explain: 'Zahlen singen lassen',
    placeholder: 'Kurz Datenlage/Trend',
    help: [
      'Eingabe: Daten/Trend als Text.',
      'Ausgabe: 16–24 Zeilen Gedicht, eingebettete Zahlenbilder, präzise Metaphern.'
    ].join('\\n'),
    action: 'input',
    prompt: `Wandle die beschriebene Datenlage in präzise Poesie (16–24 Zeilen, Bilder statt Behauptungen). Kontext:
{{input}}`
  },

  {
    label: 'RAG‑Doktor Light',
    explain: 'Use‑Case → Eval‑Plan',
    placeholder: 'RAG‑Use‑Case grob skizzieren',
    help: [
      'Eingabe: RAG‑Use‑Case.',
      'Ausgabe: Mini‑Diagnose (Quelle, Chunking, Retrieval, Re‑Ranking, Antwort), Messplan (pass/fail).'
    ].join('\\n'),
    action: 'input',
    prompt: `Skizziere einen schnell testbaren RAG‑Eval‑Plan mit Kennzahlen und pass/fail‑Kriterien. Use‑Case:
{{input}}`
  },

  {
    label: 'Delight‑Scorer',
    explain: 'Überraschung messbar machen',
    placeholder: 'Produkt/Story/Feature',
    help: [
      'Eingabe: Gegenstand.',
      'Ausgabe: 5 Metriken für „Delight“, 10 Ideen zur Steigerung (low effort → high impact).'
    ].join('\\n'),
    action: 'input',
    prompt: `Definiere fünf praxistaugliche Metriken für „Delight/Surprise“, bewerte den Gegenstand, liefere 10 konkrete Hebel (geordnet nach Aufwand/Impact).
Gegenstand: {{input}}`
  },

  {
    label: 'Solo‑RPG‑Baukasten',
    explain: '1‑Seiten‑Regel + Startszene',
    placeholder: 'Genre/Seed',
    help: [
      'Eingabe: Genre/Seed.',
      'Ausgabe: 1‑Seiten‑System (Moves, Risiko, Fortschritt) + Startszene + Zufallstabellen.'
    ].join('\\n'),
    action: 'input',
    prompt: `Erstelle einen Solo‑RPG‑Baukasten auf 1 Seite (Moves, Risiko, Fortschritt/Clocks), dazu Startszene und zwei Zufallstabellen. Genre/Seed:
{{input}}`
  },

  {
    label: 'Dream‑Room‑Designer',
    explain: 'Raum als Gefühl',
    placeholder: 'Gefühl/Anwendung (z. B. „tiefer Fokus, Studio“)',
    help: [
      'Eingabe: Gefühl + Nutzung.',
      'Ausgabe: Raumkonzept (Licht, Akustik, Material, Duft, Temperatur, Interaktions‑Rituale).'
    ].join('\\n'),
    action: 'input',
    prompt: `Entwirf einen Raum, der ein Gefühl erzeugt. Nenne Licht, Akustik, Material, Duft, Temperatur, Interaktionsrituale und ein 3‑Prompt‑Set für Render‑Tools.
Briefing: {{input}}`
  },

  {
    label: 'Narrativ‑Kompass',
    explain: 'These → 4 Blickwinkel',
    placeholder: 'These/Frage',
    help: [
      'Eingabe: These/Frage.',
      'Ausgabe: 4 Mini‑Texte (Held, Skeptiker, Kind, Maschine) + Synthese.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe je 120–160 Wörter aus vier Blickwinkeln (Held, Skeptiker, Kind, Maschine) und danach eine Synthese mit neuem, drittem Weg.
These: {{input}}`
  },

  {
    label: 'One‑Shot‑Scifi',
    explain: '1000 Zeichen, ein Schlag',
    placeholder: 'Kernidee (1 Satz)',
    help: [
      'Eingabe: 1 Satz.',
      'Ausgabe: 900–1100 Zeichen One‑Shot mit starkem Bild.'
    ].join('\\n'),
    action: 'input',
    prompt: `Schreibe eine 900–1100 Zeichen lange One‑Shot‑Sci‑Fi mit einem markanten Bild/Objekt als Anker. Idee:
{{input}}`
  }
];
