// public/js/ticker-items.js — pure JS (keine <script>-Hülle)
// Bereitgestellt als globale Liste für die Bubbles/Prompts.
window.__TICKER_ITEMS = [
  {
    label: "Texteditor (Korrektur)",
    hint: "Klick → Text einfügen",
    explain: "Grammatik-, Stil- und Rechtschreib-Check mit kurzen Begründungen.",
    action: "claude-input",
    placeholder: "Füge deinen Text hier ein …",
    prompt: `Du bist ein präziser, freundlicher Lektor. Korrigiere Grammatik, Rechtschreibung, Zeichensetzung und Stil.
- Erkläre nur wichtige Änderungen knapp (⚑-Bullets).
- Optional: bessere Formulierung, aber in meinem Ton.
- Gib am Ende eine 3-Punkte-Checkliste (klarer, kürzer, konkreter).`
  },
  {
    label: "GIST → FACT → CITE",
    hint: "Klick → Text einfügen",
    explain: "Komprimiert, belegt, zitierfähig.",
    action: "claude-input",
    placeholder: "Quelltext / Recherche-Text einfügen …",
    prompt: `Fasse den Text mit GIST (1 Satz), FACTS (3–5 belegte Fakten) und CITE (Quellen/Belege).`
  },
  {
    label: "GIST+FACT+CITE (Code)",
    hint: "Klick → Code-Kurzreview",
    explain: "1-Satz-Gist, 3 Befunde, 3 Fix-Snippets (idiomatisch).",
    action: "claude-input",
    placeholder: "Code-Ausschnitt einfügen …",
    prompt: `Gib 1-Satz-Gist, 3 Befunde (mit Fundstelle), 3 idiomatische Fix-Snippets.
Nicht umformatieren, nur fokussierte Änderungen.`
  }
  // …ergänze hier deine restlichen Items wie gehabt…
];
