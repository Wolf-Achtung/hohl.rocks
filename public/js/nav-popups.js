
import { t } from './i18n.js';

function metaBase(){ const m=document.querySelector('meta[name="hohl-chat-base"]'); const v=(m?.content||'').trim(); return v ? (v.endsWith('/')? v.slice(0,-1):v) : ''; }
function absApi(path){ const base = metaBase(); return base ? (path.startsWith('/')? (base+path): (base+'/'+path)) : path; }

async function fetchJson(url){
  const r = await fetch(url, { headers: { 'accept':'application/json' } });
  if (!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

function panel(title, html){
  const root = document.getElementById('popup-root');
  const wrap = document.createElement('div'); wrap.className = 'popup';
  const inner = document.createElement('div'); inner.className = 'popup-inner';
  const head = document.createElement('div'); head.className = 'popup-header';
  const h3 = document.createElement('h3'); h3.textContent = title;
  const close = document.createElement('button'); close.className = 'btn btn-secondary'; close.textContent = t('close'); close.addEventListener('click', () => wrap.remove());
  head.append(h3, close);
  const body = document.createElement('div'); body.className = 'popup-body';
  const container = document.createElement('div'); container.innerHTML = html;
  body.append(container);
  inner.append(head, body); wrap.append(inner);
  root.append(wrap);
  return { wrap, body, container };
}

function timeAgo(d){
  const diff = (Date.now() - new Date(d||Date.now()).getTime())/1000;
  const h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60);
  if (h>0) return h+'h';
  if (m>0) return m+'m';
  return Math.floor(diff)+'s';
}

function newsItem(it){
  const title = it.title || 'Untitled';
  const url = it.url || '#';
  const snippet = it.snippet || it.content || '';
  const age = it.published_time || it.published || '';
  return `<article class="card"><h4><a class="link" href="${url}" target="_blank" rel="noopener">${title}</a></h4><p>${snippet}</p><div class="small">${age?('vor '+timeAgo(age)):''}</div></article>`;
}

function copy(text, target){
  navigator.clipboard?.writeText(text).then(()=>{ if (target){ target.textContent = t('copied'); target.classList.add('copy-ok'); setTimeout(()=>{ target.textContent=t('copy'); target.classList.remove('copy-ok'); }, 1600); } });
}

function weeklyPick(seed, arr, count){
  // deterministic pick by week seed
  const out = []; let idx = seed % arr.length;
  for (let i=0;i<count;i++){ out.push(arr[idx % arr.length]); idx += 7; }
  return out;
}

// --- Weekly office-friendly prompts ---
const P = [
  { title:'Meeting-Notizen → Aktionsliste', situation:'Nach dem Meeting: Protokoll zu ToDos destillieren.', benefit:'Fokussiert Verantwortlichkeiten & Deadlines.', how:'Paste Notizen; nenne Projekt, Deadlineformat.', prompt:'Du bist ein Projektcoach. Extrahiere aus folgendem Meeting-Protokoll eine Aktionsliste: klare Aufgaben • Verantwortliche • Fälligkeitsdatum (YYYY‑MM‑DD) • Abhängigkeiten. Wenn Informationen fehlen, formuliere schlanke Klärungsfragen. Protokoll: {{INPUT}}' },
  { title:'E-Mail: freundlich & knapp beantworten', situation:'Schnelle, höfliche Antwort auf längere Mails.', benefit:'Sparzeit, konsistent im Ton.', how:'Gib Mail + Ziel (z. B. zusagen/vertagen).', prompt:'Formuliere eine kurze, freundliche Antwort in meiner Stimme. Struktur: 1) Dank/Bezug 2) klare Antwort 3) optionaler Vorschlag 4) Gruß. Input: {{INPUT}}' },
  { title:'Pressetext 120 Wörter', situation:'Knackige PM zu Produkt/Feature.', benefit:'PR-fähig, präziser Hook.', how:'Gib Produkt, Zielgruppe, 3 Key‑Facts.', prompt:'Schreibe eine prägnante Pressemitteilung (≤120 Wörter) mit starkem Hook und 3 Kernbotschaften. Produkt: {{INPUT}}' },
  { title:'Konkurrenz‑Scan Mini', situation:'Schneller Wettbewerbsüberblick.', benefit:'Sehen, was andere machen.', how:'Liste 3–5 Mitbewerber + Fokus.', prompt:'Gib eine kompakte Konkurrenzübersicht: Anbieter • Positionierung • 1 USP • Preisrange • Beobachtung. Basis: {{INPUT}}' },
  { title:'Naming‑Ideen (10x)', situation:'Produkt/Feature braucht Namen.', benefit:'Breite Ideenbasis.', how:'Gib Kontext & Stil (seriös/verspielt).', prompt:'Erzeuge 10 prägnante Namensideen inkl. kurzer Begründung (≤8 Wörter) für: {{INPUT}}' },
  { title:'Tagline‑Varianten (7x)', situation:'Slogan-Exploration.', benefit:'Spielraum für A/B‑Tests.', how:'Gib Marke + Tonalität.', prompt:'Erzeuge 7 Tagline‑Varianten (≤8 Wörter) in der Tonalität: {{INPUT}}. Liefere 1 Zeile Begründung je Variante.' },
  { title:'Blog‑Outline SEO', situation:'Struktur für Artikel.', benefit:'Besserer Fokus.', how:'Gib Keyword & Zielgruppe.', prompt:'Erstelle eine prägnante Blog‑Gliederung (H2/H3) inkl. Suchintention und 5 FAQ. Keyword/Ziel: {{INPUT}}' },
  { title:'SWOT in 8 Bullets', situation:'Schnelle Strategie‑Skizze.', benefit:'Lagebild für Entscheidung.', how:'Gib Produkt/Projekt.', prompt:'Erstelle eine knappe SWOT (2 pro Quadrant) für: {{INPUT}} — je Punkt ≤12 Wörter.' },
  { title:'RFP‑Entwurf (1 Seite)', situation:'Ausschreibung starten.', benefit:'Strukturierter Brief.', how:'Gib Bedarf, Rahmen, Frist.', prompt:'Schreibe ein 1‑seitiges RFP mit: Ziel • Umfang • Muss‑Kriterien • Nice‑to‑have • Zeitplan • Bewertungsmatrix. Kontext: {{INPUT}}' },
  { title:'Jira‑Triage', situation:'Tickets sortieren.', benefit:'Klarheit statt Ticket‑Chaos.', how:'Gib Ticketliste (Titel/Body).', prompt:'Triagiere folgende Tickets: Kategorie • Schweregrad • Aufwand (S,M,L) • Next step. Tickets: {{INPUT}}' },
  { title:'Excel‑Formel‑Assistent', situation:'Formel bauen.', benefit:'Fehlerfrei schneller.', how:'Beschreibe Daten + gewünschte Logik.', prompt:'Erzeuge eine Excel‑/Google‑Sheets‑Formel für: {{INPUT}}. Erkläre sie in 2 Sätzen.' },
  { title:'SQL‑Erklärung', situation:'Query verstehen.', benefit:'Lernen & reviewen.', how:'Paste Query.', prompt:'Erkläre folgende SQL‑Query kurz (Zweck, Output, Risiken). Query: {{INPUT}}' },
  { title:'UX‑Microcopy', situation:'Buttons/Fehlertexte.', benefit:'Klar & freundlich.', how:'Gib Screen & Tonalität.', prompt:'Formuliere 6 Microcopy‑Vorschläge (Button, Tooltip, Fehlertext) für: {{INPUT}}' },
  { title:'Übersetzen im Stil', situation:'DE↔EN, Ton halten.', benefit:'Markenstimme bleibt.', how:'Gib Text + Stilhinweis.', prompt:'Übersetze den Text in die Zielsprache im Stil: {{INPUT_STYLE}}. Bewahre Bedeutung & Rhythmus. Text: {{INPUT_TEXT}}' },
  { title:'VoC‑Klassifikation', situation:'Kundenfeedback sortieren.', benefit:'Schnelle Auswertung.', how:'Gib 20–50 Zeilen Feedback.', prompt:'Klassifiziere die Feedbacks in Themen (max. 8) und gib pro Thema 1 Satz Einsicht + ein Beispiel. Daten: {{INPUT}}' },
  { title:'LinkedIn‑Post (110–140 W.)', situation:'Share mit Substanz.', benefit:'Reichweite + klarer CTA.', how:'Gib Thema & Ziel.', prompt:'Schreibe einen 110–140 Wörter LinkedIn‑Post mit Hook • 3 Nuggets • Mini‑CTA. Thema: {{INPUT}}' },
  { title:'Kurzbriefing Design', situation:'Schnelles Creative‑Briefing.', benefit:'Weniger Ping‑Pong.', how:'Gib Asset‑Typ & Ziel.', prompt:'Erstelle ein präzises Creative‑Briefing (Ziel, Zielgruppe, Ton, Do/Don’t, Deliverables). Basis: {{INPUT}}' },
  { title:'One‑Pager Produkt', situation:'Intern verkaufen.', benefit:'Schnell verständlich.', how:'Gib Produkt, Zielgruppe.', prompt:'Schreibe einen One‑Pager mit Problem • Lösung • Nutzen • Beweis • Call‑to‑Action. Produkt: {{INPUT}}' }
];

function renderPrompts(container){
  const now = new Date();
  const week = Math.floor((now - new Date(now.getFullYear(),0,1)) / (7*24*3600*1000));
  const list = weeklyPick(week, P, 14);
  const html = '<div class="list">' + list.map(p => {
    const pr = p.prompt.replaceAll('<','&lt;');
    return `<article class="card"><h4>${p.title}</h4><p><strong>Situation:</strong> ${p.situation}</p><p><strong>Nutzen:</strong> ${p.benefit}</p><p><strong>So nutzt du es:</strong> ${p.how}</p><div class="actions"><button class="btn btn-primary" data-copy="${pr}">${t('copy')}</button></div></article>`;
  }).join('') + '</div>';
  container.innerHTML = html;
  container.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => copy(btn.getAttribute('data-copy'), btn)));
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('.nav-btn');
  if (!btn) return;
  const action = btn.getAttribute('data-action');

  if (action === 'about'){
    panel('Über', t('about_html'));
  }
  else if (action === 'news'){
    const p = panel(t('news'), '<p class="small">Lade tagesaktuelle KI‑News …</p>');
    try{
      const live = await fetchJson(absApi('/api/news/live')).catch(()=>null);
      const data = live?.items?.length ? live.items : ((await fetchJson(absApi('/api/news'))).items || []);
      p.container.innerHTML = '<div class="list">' + data.slice(0, 16).map(newsItem).join('') + '</div>';
    }catch{ p.container.innerHTML = '<p>Keine News verfügbar.</p>'; }
  }
  else if (action === 'prompts'){
    const p = panel(t('prompts'), '<p class="small">Wöchentliche Auswahl für Büro‑Workflows. Direkt kopierbar.</p>');
    renderPrompts(p.container);
  }
  else if (action === 'projects'){
    panel('Projekte', t('projects_html'));
  }
});
