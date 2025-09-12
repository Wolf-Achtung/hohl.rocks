/*
 * ticker-filters.js — Kategorie-Filter für den Ticker
 *
 *  Dieses Skript initialisiert die Kategorie‑Filterleiste und setzt
 *  `window.currentTickerCategory`, wenn ein Filter ausgewählt wird. Es
 *  markiert den aktiven Filter optisch und löst einen Ticker-Rebuild
 *  aus. Die Filter-Leiste befindet sich im DOM unter #ticker-filters.
 */
/*
 * ticker-filters.js – repurposed for floating info panels
 *
 * Die ursprüngliche Filter-Logik für den Ticker entfällt. Stattdessen löst jeder
 * Button nun das Öffnen eines Info-Panels aus. Es stehen folgende
 * Kategorien zur Verfügung: 'about', 'news', 'prompt', 'projects'.
 * Für jede Kategorie wird ein passender Text angezeigt. Für
 * 'news' und 'prompt' werden zufällig ausgewählte Einträge aus einem
 * Array verwendet. Die Inhalte sollten regelmäßig aktualisiert
 * werden, um den Nutzer zu inspirieren.
 */
(function(){
  'use strict';
  // Inhalt für die Panels. Passe diese Texte regelmäßig an. Du kannst sie
  // später aus einer API laden oder manuell ersetzen.
  const ABOUT_TEXT = (
    'Wolf Hohl ist zertifizierter KI‑Manager mit über 30 Jahren Erfahrung im Marketing und über 50 Mio. € Umsatz.\n'+
    'Sein Fokus liegt auf der Verbindung von Kreativität, Kommunikation und Künstlicher Intelligenz.\n'+
    'Er lebt in Berlin, liebt Yoga und Lesen, und arbeitet an Projekten, die Menschen mit modernster KI begeistern.'
  );
  const NEWS_ENTRIES = [
    'Heute wurde ein neues EU‑KI‑Regelwerk verabschiedet – es stärkt Datenschutz und Transparenz.\nMehr dazu findest du auf der Website des EU-Parlaments.',
    'OpenAI hat ein schlankes Modell veröffentlicht, das lokal laufen kann – ideal für Start-ups und Privatanwender.',
    'Ein deutsches Team hat eine KI entwickelt, die medizinische Bilddaten in Echtzeit analysiert – ein Meilenstein für die Krebsdiagnostik.'
  ];
  const PROMPT_ENTRIES = [
    '🧠 Prompt-Tipp: „Bitte ChatGPT, erstelle einen Wochenplan für dein Lernziel und füge pro Tag eine Mikro-Pause ein.“',
    '🎨 Prompt-Idee: „Lass die KI drei überraschende Geschäftsideen ausspinnen, die auf Trenddaten basieren – jeweils mit einem kurzen Aktionsplan.“',
    '🎵 Prompt-Experiment: „Schreibe einen Songtext über KI im Stil deiner Lieblingsband – verwende Reime und eine Hookline.“',
    '📣 Prompt für Social Media: „Formuliere einen LinkedIn-Post (max. 3 Sätze), der dein neues Projekt vorstellt und eine Frage an die Community stellt.“',
    '🔍 Prompt zur Recherche: „Fasse die neuesten KI-Entwicklungen dieser Woche in drei Bulletpoints zusammen und gib einen Link-Tipp.“'
  ];
  const PROJECT_ENTRIES = [
    '🌐 Projekt „hohl.rocks“: Unsere immersiv gestaltete Personal Site, die Highway-Video, Neon‑Bubbles und interaktive KI‑Prompts vereint. Ziel: moderne KI-Erlebnisse in einem einzigen Fluss.',
    '🎛️ Projekt „Prompt‑Studio“: Ein Toolkit zum Entwickeln und Teilen kreativer Prompts. Demnächst verfügbar – hier kannst du bald deine Lieblings-Prompts testen und teilen.',
    '📚 Projekt „KI‑Workshops für KMU“: Praxisnahe Trainings für kleine und mittlere Unternehmen, um direkt nutzbare KI‑Anwendungen kennenzulernen – inklusive Mini-Hacks und Hands‑on‑Übungen.',
    '🎬 Projekt „Video‑Coach“: Wir entwickeln ein KI‑basiertes Tool, das aus rohem Filmmaterial automatisch Trailer schneidet und Texte generiert. Stay tuned!',
    '🧠 Projekt „AI‑Helpdesk“: Ein Experiment mit Agenten, die Kundensupport automatisieren und gleichzeitig empathisch antworten.'
  ];

  function showPanel(type){
    let text = '';
    if(type === 'about'){
      text = ABOUT_TEXT;
    } else if(type === 'news'){
      text = NEWS_ENTRIES[Math.floor(Math.random() * NEWS_ENTRIES.length)];
    } else if(type === 'prompts'){
      text = PROMPT_ENTRIES[Math.floor(Math.random() * PROMPT_ENTRIES.length)];
    } else if(type === 'projects'){
      text = PROJECT_ENTRIES[Math.floor(Math.random() * PROJECT_ENTRIES.length)];
    }
    if(!text) return;
    // Versuche, den Answer-Popup direkt zu nutzen, falls verfügbar
    if(typeof window.openAnswerPopup === 'function'){
      window.openAnswerPopup(text);
    } else {
      // Fallback: Dispatch Chat-Events (answer-popup greift das auf)
      try { window.dispatchEvent(new CustomEvent('chat:send')); } catch(_){}
      try { window.dispatchEvent(new CustomEvent('chat:delta', { detail: { delta: text } })); } catch(_){}
      try { window.dispatchEvent(new CustomEvent('chat:done')); } catch(_){}
    }
  }

  function init(){
    const bar = document.getElementById('ticker-filters');
    if(!bar) return;
    bar.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('button');
      if(!btn) return;
      const cat = btn.dataset.cat || '';
      // Aktiven Button hervorheben
      bar.querySelectorAll('button').forEach(b=>{
        if(b === btn) b.classList.add('active'); else b.classList.remove('active');
      });
      // Info-Panel öffnen
      showPanel(cat);
    });
  }
  if(document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();