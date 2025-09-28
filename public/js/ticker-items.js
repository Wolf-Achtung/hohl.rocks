/* public/js/ticker-items.js — titles + hints + input-bubbles */
(function(){
  window.__TICKER_ITEMS = [
    { label:"Research-Agent",        prompt:"Live-Recherche starten (Plan → Triage → Synthese).", action:"research",   hint:"Klick → Live-Recherche mit Quellen" },
    { label:"Cage-Match",            prompt:"Zwei Modelle vergleichen (Prompt frei wählbar).",    action:"cage-match", hint:"Klick → Prompt & Modelle wählen" },
    { label:"GIST→FACT→CITE",        prompt:"GIST 1 Satz → FACT Bullets → CITE URLs.",             action:"",          hint:"Klick → Struktur zum Kopieren" },
    { label:"Kontrast-Paar",         prompt:"Lösung A konservativ vs. B radikal + 3 Kriterien.",   action:"",          hint:"Klick → zwei Wege + Kriterien" },
    { label:"One-Minute-Plan",       prompt:"Ziel: [x]. 5 Schritte à ≤12 Wörter – heute machbar.", action:"",          hint:"Klick → 5 konkrete Schritte" },
    { label:"Prompt-Linter",         prompt:"Diagnose: Ziel/Format/Constraints/Negativliste.",     action:"",          hint:"Klick → Prompt verbessern" },
    { label:"Mini-RAG",              prompt:"5 Wissensblöcke + je 2 Zitate → Q&A je Block.",       action:"",          hint:"Klick → RAG-Baukasten" },

    /* ==== INPUT-BUBBLES ==== */
    {
      label:"Texteditor (Korrektur)",
      action:"claude-input",
      hint:"Klick → Text einfügen & prüfen",
      placeholder:"Fügen Sie hier Ihren Text ein …",
      prompt:
`Du bist ein interaktiver Grammatik- und Stil-Editor. Prüfe und verbessere den Text.

Anforderungen:
- Grammatik- und Rechtschreibfehler beheben
- Satzbau und Lesefluss verbessern (prägnant, deutsch)
- Stilvorschläge mit kurzen Begründungen
- Wichtige Änderungen mit ✅ kennzeichnen
- Unveränderte Stellen nicht unnötig wiederholen

Hier ist der Text:
{{text}}

Gib das Ergebnis als übersichtliche Markdown-Antwort aus (Abschnitte: „Verbesserter Text“, „Erläuterungen“).`
    },
    {
      label:"E-Mail-Assistent",
      action:"claude-input",
      hint:"Klick → Stichpunkte + Ton",
      placeholder:"Stichpunkte oder grobe Rohfassung …",
      prompt:
`Formuliere aus folgenden Stichpunkten eine professionelle E-Mail auf Deutsch.
Ton: freundlich, klar, kurz.
Stichpunkte:
{{text}}

Gib Antwort mit:
- Betreff (eine Zeile)
- passende Grußformel
- E-Mail-Text (3–6 Sätze, konkret, ohne Floskeln).`
    },

    /* ==== VISUAL/IMAGE ==== */
    { label:"🖼️ Face-Aging",   prompt:"Eigenes Foto laden → +20 Jahre.",            action:"face-age",   hint:"Klick → Foto wählen" },
    { label:"🖼️ Varianten 4×", prompt:"Cinematic/analog/clean/vibrant aus deinem Bild.", action:"variations", hint:"Klick → 4 Looks generieren" },
    { label:"🎞️ Storyboard",   prompt:"6 Shots (Kamera+Licht) zu [Thema].",        action:"storyboard", hint:"Klick → Shotliste" }
  ];
})();
