// public/js/nav-popups.js
import { fetchNews, fetchTopPrompts } from './claude-stream.js';
import { openAnswerPopup } from './answer-popup.js';

const nav = document.getElementById('nav');

const legalText = `Rechtliches & Transparenz

Impressum
Verantwortlich für den Inhalt:
Wolf Hohl
Greifswalder Str. 224a
10405 Berlin
E-Mail: wolf@hohl.rocks

Haftungsausschluss:
Diese Website dient ausschließlich der Information. Trotz sorgfältiger Prüfung übernehme ich keine Haftung für Inhalte externer Links.

Urheberrecht:
Alle Inhalte dieser Website unterliegen dem deutschen Urheberrecht, alle Bilder wurden mit Hilfe von KI-Tools wie Midjourney erzeugt.

Hinweis zum EU AI Act:
Diese Website informiert über Pflichten, Risiken und Fördermöglichkeiten beim Einsatz von KI nach EU AI Act und DSGVO. Sie ersetzt keine Rechtsberatung.

Datenschutzerklärung
Der Schutz Ihrer persönlichen Daten ist mir ein besonderes Anliegen.

Kontakt mit mir
Wenn Sie per Formular oder E-Mail Kontakt aufnehmen, werden Ihre Angaben zur Bearbeitung sechs Monate gespeichert.

Cookies
Diese Website verwendet keine Cookies zur Nutzerverfolgung oder Analyse.

Ihre Rechte laut DSGVO
Auskunft, Berichtigung oder Löschung Ihrer Daten
Datenübertragbarkeit
Widerruf erteilter Einwilligungen
Beschwerde bei der Datenschutzbehörde`;

nav?.addEventListener('click', async (e)=>{
  const b = e.target.closest('button[data-action]');
  if (!b) return;
  const act = b.dataset.action;

  if (act === 'about') {
    openAnswerPopup({
      title: 'Über',
      explain: 'Rechtliches & Transparenz.',
      content: legalText
    });
  }

  if (act === 'news') {
    try{
      const {items=[], cachedAt} = await fetchNews();
      const body = `Stand: ${cachedAt || '–'}\n\n` + items.map((n,i)=> `• ${n.title}  [${n.source}] \n  ${n.url}`).join('\n');
      openAnswerPopup({
        title: 'KI‑News (kuratiert)',
        explain: 'Kompakt, verlässlich, mit Quelle – Cache 12 h.',
        content: body
      });
    }catch(err){
      openAnswerPopup({ title:'News', content:`[Fehler] ${err?.message||err}` });
    }
  }

  if (act === 'prompts') {
    try{
      const {items=[], cachedAt} = await fetchTopPrompts();
      const body = `Top‑5 Prompts der Woche — Stand: ${cachedAt||'–'}\n\n` + items.map((p,i)=> `${i+1}. ${p.title}\n${p.body}\n`).join('\n');
      openAnswerPopup({
        title:'Prompts',
        explain:'Wöchentlich kuratierte Top‑Prompts (praktisch und neu).',
        content: body
      });
    }catch(err){
      openAnswerPopup({ title:'Prompts', content:`[Fehler] ${err?.message||err}` });
    }
  }

  if (act === 'projects') {
    openAnswerPopup({
      title:'Projekte',
      explain:'Aktuelle Arbeiten & Demos (Auswahl).',
      content:'stay tuned!'
    });
  }

  if (act === 'sound') {
    // handled in ambient-radiohead.js via button id #sound-toggle
  }
});
