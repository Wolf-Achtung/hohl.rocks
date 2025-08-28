/* ticker-items.js — curated list of prompts for the "Aktuell" ticker
 * Each entry has a label and a prompt that is sent directly to ChatDock when clicked.
 */
(function(){
  window.__TICKER_ITEMS = [
    { label: "Überrasch mich 🤯", prompt: "Zeig mir etwas Unerwartetes, das KI heute schon gut kann – in 3 Sätzen, mit einem kleinen Beispiel." },

    // Wow & Play
    { label: "Aus Text wird Farbe", prompt: "Nimm folgenden Satz und mach mir eine 5‑Farben‑Palette daraus (HEX + Einsatz). Satz folgt gleich." },
    { label: "Mini‑Story (5 Wörter)", prompt: "Schreibe eine ultrakurze Geschichte aus genau 5 Wörtern zu einem Thema nach Wahl, überraschend, poetisch, deutsch." },
    { label: "Stil‑Switcher", prompt: "Erkläre mir ein Fachthema zuerst extrem einfach, dann normal, dann nerdy – je 2 Sätze." },
    { label: "Myth Busting", prompt: "Wähle einen verbreiteten KI‑Mythos und widerlege ihn freundlich in 3 Sätzen mit einem Mini‑Beispiel." },
    { label: "Bild‑Ideen (ohne Bild)", prompt: "Gib mir 4 kreative Bild‑Ideen zu meinem Thema, je 1 Satz, präzise Briefings (Hintergrund, Licht, Stimmung)." },
    { label: "Prompt des Tages", prompt: "Gib mir einen starken Prompt des Tages zum Ausprobieren (kurz, robust, keine Floskeln)." },
    { label: "Punk‑Modus", prompt: "Antworte radikal knapp, aber korrekt. Max. 3 Sätze. Hart & ehrlich." },

    // Persönlich & nahbar
    { label: "Wolf in 3 Sätzen", prompt: "Wer ist Wolf Hohl (TÜV‑zertifizierter KI‑Manager), was treibt ihn an, wie hilft er konkret? Max. 3 Sätze, präzise." },
    { label: "Wolfs Lieblings‑Use‑Case", prompt: "Beschreibe einen kleinen, aber wirkungsvollen KI‑Use‑Case aus Wolfs Alltag – so, dass ich ihn heute testen kann." },

    // Foto‑Spaß (mit Einwilligung)
    { label: "Avatar‑Briefing (Foto)", prompt: "Ich lade ein Foto hoch. Erstelle 3 präzise Avatar‑Briefings (Hintergrund/Licht/Pose/Farben) – sachlich, kein Kitsch." },
    { label: "Brand‑Farben (Foto)", prompt: "Leite aus meinem Foto 5 Markenfarben ab (HEX) und schlage Einsätze auf hohl.rocks vor (Buttons/Links/Akzente)." },

    // Lernen & Orientierung
    { label: "KI in 60 Sekunden", prompt: "Erkläre mir in 60 Sekunden, was heute an KI wirklich nützlich ist – ohne Buzzwords, mit 1 Beispiel." },
    { label: "Werkzeug‑Safari", prompt: "Nenne 3 schlanke Tools/Patterns, mit denen ich GPT zuverlässig in den Alltag bringe (Auth, Logging, Auswertung) – je 1 Satz." },
    { label: "Qualität statt Zufall", prompt: "Gib mir 3 kleine Prompt‑Tricks, die Ergebnisse messbar besser machen – mit Mini‑Beispiel." },

    // Spaß & Skurril
    { label: "Road‑Trip‑Haiku", prompt: "Schreibe ein Haiku zum Highway‑Video im Hintergrund. Kein Pathos, eher minimal." },
    { label: "Emojify my Day", prompt: "Kondensiere meinen Tag in eine knappe Emoji‑Zeile + 1 Satz Kommentar – trocken‑witzig." },

    // Jetzt & Neu (zeitlos formuliert)
    { label: "Was ist gerade spannend?", prompt: "Nenne 3 frische KI‑Trends/Ideen (zeitlos formuliert), je 1 Satz, fokus auf konkrete Wirkung statt Technik." },
    { label: "Kleinstes Experiment", prompt: "Gib mir ein 24‑Stunden‑Experiment, um KI produktiv zu testen – Hypothese, Setup, Erfolgskriterium." },

    // Einstieg
    { label: "Wo starte ich?", prompt: "Stell mir 3 Fragen (Ziel, Material, Zeit) und mach daraus einen minimalen KI‑Plan für mich persönlich." }
  ];
})();