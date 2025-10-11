
import { t } from './i18n.js';

function metaBase(){ const m=document.querySelector('meta[name="hohl-chat-base"]'); const v=(m?.content||'').trim(); return v ? (v.endsWith('/')? v.slice(0,-1):v) : ''; }
function absApi(path){ const base = metaBase(); return base ? (path.startsWith('/')? (base+path): (base+'/'+path)) : path; }
async function fetchJson(url){ const r = await fetch(url, { headers: { 'accept':'application/json' } }); if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); }

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
  inner.append(head, body, (()=>{const f=document.createElement('div'); f.className='popup-actions'; const b=document.createElement('button'); b.className='btn btn-secondary'; b.textContent=t('close'); b.onclick=()=>wrap.remove(); f.append(b); return f;})());
  wrap.append(inner);
  root.append(wrap);
  return { wrap, body, container };
}

function timeAgo(d){ const diff=(Date.now()-new Date(d||Date.now()).getTime())/1000; const h=Math.floor(diff/3600), m=Math.floor((diff%3600)/60); if (h>0) return h+'h'; if (m>0) return m+'m'; return Math.floor(diff)+'s'; }
function newsItem(it){ const title=it.title||'Untitled', url=it.url||'#', snippet=it.snippet||it.summary||it.content||'', age=it.published_time||it.published||''; return `<article class="card"><h4><a class="link" href="${url}" target="_blank" rel="noopener">${title}</a></h4><p>${snippet}</p><div class="small">${age?('vor '+timeAgo(age)):''} ${it.severity?('• '+it.severity):''}</div></article>`; }
function copy(text, target){ navigator.clipboard?.writeText(text).then(()=>{ if (target){ target.textContent=t('copied'); target.classList.add('copy-ok'); setTimeout(()=>{ target.textContent=t('copy'); target.classList.remove('copy-ok'); }, 1600); } }); }
function weeklyPick(seed, arr, count){ const out=[]; let idx=seed%arr.length; for(let i=0;i<count;i++){ out.push(arr[idx%arr.length]); idx+=7; } return out; }

const P = [
  { title:'Meeting-Notizen → Aktionsliste', situation:'Nach dem Meeting: Protokoll zu ToDos destillieren.', benefit:'Fokussiert Verantwortlichkeiten & Deadlines.', how:'Paste Notizen; nenne Projekt, Deadlineformat.', best:'Wenn Gespräche ausufern oder Verantwortungen unklar sind.', prompt:'Du bist ein Projektcoach. Extrahiere aus folgendem Meeting-Protokoll eine Aktionsliste: klare Aufgaben • Verantwortliche • Fälligkeitsdatum (YYYY‑MM‑DD) • Abhängigkeiten. Wenn Informationen fehlen, formuliere schlanke Klärungsfragen. Protokoll: {{INPUT}}' },
  { title:'E-Mail: freundlich & knapp beantworten', situation:'Schnelle, höfliche Antwort auf längere Mails.', benefit:'Sparzeit, konsistent im Ton.', how:'Gib Mail + Ziel (z. B. zusagen/vertagen).', best:'Wenn du knapp antworten willst ohne harsch zu klingen.', prompt:'Formuliere eine kurze, freundliche Antwort in meiner Stimme. Struktur: 1) Dank/Bezug 2) klare Antwort 3) optionaler Vorschlag 4) Gruß. Input: {{INPUT}}' },
  { title:'Pressetext 120 Wörter', situation:'Knackige PM zu Produkt/Feature.', benefit:'PR‑fähig, präziser Hook.', how:'Gib Produkt, Zielgruppe, 3 Key‑Facts.', best:'Wenn Launch knapp ist und du Erstfassung brauchst.', prompt:'Schreibe eine prägnante Pressemitteilung (≤120 Wörter) mit starkem Hook und 3 Kernbotschaften. Produkt: {{INPUT}}' },
  { title:'Konkurrenz‑Scan Mini', situation:'Schneller Wettbewerbsüberblick.', benefit:'Sehen, was andere machen.', how:'3–5 Mitbewerber + Fokus.', best:'Wenn du Pitch/Review vorbereitest.', prompt:'Gib eine kompakte Konkurrenzübersicht: Anbieter • Positionierung • 1 USP • Preisrange • Beobachtung. Basis: {{INPUT}}' },
  { title:'Naming‑Ideen (10x)', situation:'Produkt/Feature braucht Namen.', benefit:'Breite Ideenbasis.', how:'Kontext & Stil (seriös/verspielt).', best:'Frühe Phase oder für Brainstorm‑Warmup.', prompt:'Erzeuge 10 prägnante Namensideen inkl. kurzer Begründung (≤8 Wörter) für: {{INPUT}}' },
  { title:'Tagline‑Varianten (7x)', situation:'Slogan‑Exploration.', benefit:'A/B‑Tests.', how:'Marke + Tonalität.', best:'Wenn du Tone of Voice schärfen willst.', prompt:'Erzeuge 7 Tagline‑Varianten (≤8 Wörter) in der Tonalität: {{INPUT}}. Liefere 1 Zeile Begründung je Variante.' },
  { title:'Blog‑Outline SEO', situation:'Struktur für Artikel.', benefit:'Fokus & SEO.', how:'Keyword & Zielgruppe.', best:'Vor dem Schreiben.', prompt:'Erstelle eine prägnante Blog‑Gliederung (H2/H3) inkl. Suchintention und 5 FAQ. Keyword/Ziel: {{INPUT}}' },
  { title:'SWOT in 8 Bullets', situation:'Schnelle Strategie‑Skizze.', benefit:'Lagebild.', how:'Produkt/Projekt.', best:'Kickoff/Vorab‑Einschätzung.', prompt:'Erstelle eine knappe SWOT (2 pro Quadrant) für: {{INPUT}} — je Punkt ≤12 Wörter.' },
  { title:'RFP‑Entwurf (1 Seite)', situation:'Ausschreibung starten.', benefit:'Strukturiert.', how:'Bedarf, Rahmen, Frist.', best:'Wenn du Anfragen an Partner bündeln willst.', prompt:'Schreibe ein 1‑seitiges RFP mit: Ziel • Umfang • Muss‑Kriterien • Nice‑to‑have • Zeitplan • Bewertungsmatrix. Kontext: {{INPUT}}' },
  { title:'Jira‑Triage', situation:'Tickets sortieren.', benefit:'Klarheit.', how:'Ticketliste (Titel/Body).', best:'Backlog aufräumen.', prompt:'Triagiere folgende Tickets: Kategorie • Schweregrad • Aufwand (S,M,L) • Next step. Tickets: {{INPUT}}' },
  { title:'Excel‑Formel‑Assistent', situation:'Formel bauen.', benefit:'Fehlerfrei schneller.', how:'Daten + Logik.', best:'Wenn du keine Zeit zum Googeln hast.', prompt:'Erzeuge eine Excel/Sheets‑Formel für: {{INPUT}}. Erkläre sie in 2 Sätzen.' },
  { title:'SQL‑Erklärung', situation:'Query verstehen.', benefit:'Lernen.', how:'Paste Query.', best:'Code‑Review oder Übergabe.', prompt:'Erkläre folgende SQL‑Query kurz (Zweck, Output, Risiken). Query: {{INPUT}}' },
  { title:'UX‑Microcopy', situation:'Buttons/Fehlertexte.', benefit:'Klar & freundlich.', how:'Screen & Tonalität.', best:'Wenn Conversion & UX leiden.', prompt:'Formuliere 6 Microcopy‑Vorschläge (Button, Tooltip, Fehlertext) für: {{INPUT}}' },
  { title:'VoC‑Klassifikation', situation:'Kundenfeedback sortieren.', benefit:'Schnelle Auswertung.', how:'20–50 Zeilen Feedback.', best:'Wenn du schnell Themen sehen willst.', prompt:'Klassifiziere die Feedbacks in Themen (max. 8) und gib pro Thema 1 Satz Einsicht + ein Beispiel. Daten: {{INPUT}}' },
  { title:'LinkedIn‑Post (110–140 W.)', situation:'Share mit Substanz.', benefit:'Reichweite + CTA.', how:'Thema & Ziel.', best:'Für Thought Leadership.', prompt:'Schreibe einen 110–140 Wörter LinkedIn‑Post mit Hook • 3 Nuggets • Mini‑CTA. Thema: {{INPUT}}' },
  { title:'Kurzbriefing Design', situation:'Creative‑Briefing.', benefit:'Weniger Ping‑Pong.', how:'Asset‑Typ & Ziel.', best:'Vor Sprint/Produktion.', prompt:'Erstelle ein präzises Creative‑Briefing (Ziel, Zielgruppe, Ton, Do/Don’t, Deliverables). Basis: {{INPUT}}' },
  { title:'One‑Pager Produkt', situation:'Intern verkaufen.', benefit:'Schnell verständlich.', how:'Produkt, Zielgruppe.', best:'Vor Lenkungskreis/Stakeholder‑Update.', prompt:'Schreibe einen One‑Pager mit Problem • Lösung • Nutzen • Beweis • Call‑to‑Action. Produkt: {{INPUT}}' }
];
function renderPrompts(container){
  const now = new Date();
  const week = Math.floor((now - new Date(now.getFullYear(),0,1)) / (7*24*3600*1000));
  const list = weeklyPick(week, P, 16);
  const html = '<div class="list">' + list.map(p => {
    const pr = p.prompt.replaceAll('<','&lt;');
    return `<article class="card"><h4>${p.title}</h4><p><strong>Wozu geeignet?</strong> ${p.best}</p><p><strong>Situation:</strong> ${p.situation}</p><p><strong>Nutzen:</strong> ${p.benefit}</p><p><strong>So nutzt du es:</strong> ${p.how}</p><div class="actions"><button class="btn btn-primary" data-copy="${pr}">${t('copy')}</button></div></article>`;
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
    const p = panel(t('news'), '<p class="small">Lade tagesaktuelle KI‑News & Sicherheitsmeldungen …</p>');
    try{
      const results = await Promise.allSettled([
        fetchJson(absApi('/api/news/live')), // Tavily
        fetchJson(absApi('/api/ai-weekly?time_range=day')), // Perplexity daily
        fetchJson(absApi('/api/ai-weekly?topic=security&time_range=week')) // Perplexity weekly security
      ]);
      const tav = results[0].status==='fulfilled' ? results[0].value : null;
      const day = results[1].status==='fulfilled' ? results[1].value : null;
      const sec = results[2].status==='fulfilled' ? results[2].value : null;
      const items = [];
      if (tav?.items?.length) items.push(...tav.items);
      if (day?.items?.length) items.push(...day.items);
      let html = '';
      if (items.length){
        html += '<h4>Aktuell</h4><div class="list">' + items.slice(0, 18).map(newsItem).join('') + '</div>';
      }
      if (sec?.items?.length){
        html += '<h4>Warnungen & Sicherheit (Woche)</h4><div class="list">' + sec.items.slice(0, 12).map(newsItem).join('') + '</div>';
      }
      if (!html){
        const why = results.map((r,i)=> r.status==='rejected' ? `Quelle ${i+1}: ${r.reason}` : null).filter(Boolean).join(' • ');
        p.container.innerHTML = '<p>Keine News verfügbar.</p>' + (why?`<p class="small">${why}</p>`:'');
      } else {
        p.container.innerHTML = html;
      }
    }catch(e){ p.container.innerHTML = '<p>Keine News verfügbar.</p>'; }
  }
  else if (action === 'prompts'){
    const p = panel(t('prompts'), '<p class="small">Wöchentliche Auswahl für Büro‑Workflows. Direkt kopierbar.</p>');
    renderPrompts(p.container);
  }
  else if (action === 'projects'){
    panel('Projekte', t('projects_html'));
  }
});
