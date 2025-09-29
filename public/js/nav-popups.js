// /public/js/nav-popups.js
(() => {
  function on(sel, ev, fn){ document.addEventListener(ev, e => { if (e.target.closest(sel)) fn(e); }); }

  const aboutHTML = `
    <div style="max-height:60vh;overflow:auto">
      <h4>Rechtliches & Transparenz</h4>
      <p><b>Impressum</b><br/>
      Verantwortlich für den Inhalt:<br/>
      Wolf Hohl, TÜV-zertifiziertes KI-Management<br/>
      Greifswalder Str. 224a<br/>10405 Berlin</p>
      <p>E‑Mail: <a href="mailto:wolf@hohl.rocks">wolf@hohl.rocks</a></p>
      <p><b>Haftungsausschluss:</b><br/>Diese Website dient ausschließlich der Information. Trotz sorgfältiger Prüfung übernehme ich keine Haftung für Inhalte externer Links.</p>
      <p><b>Urheberrecht:</b><br/>Alle Inhalte dieser Website unterliegen dem deutschen Urheberrecht; Bilder wurden mit KI‑Tools (z. B. Midjourney) erzeugt.</p>
      <p><b>Hinweis zum EU AI Act:</b><br/>Informationen zu Pflichten, Risiken und Fördermöglichkeiten beim Einsatz von KI nach EU AI Act & DSGVO. Keine Rechtsberatung.</p>
      <h4>Datenschutzerklärung</h4>
      <p><b>Kontakt:</b> Bei Kontakt per Formular/E‑Mail werden Angaben zur Bearbeitung sechs Monate gespeichert.</p>
      <p><b>Cookies:</b> Keine Tracking‑/Analyse‑Cookies.</p>
      <p><b>Ihre Rechte laut DSGVO:</b> Auskunft, Berichtigung, Löschung, Datenübertragbarkeit, Widerruf, Beschwerde.</p>
    </div>
  `;

  async function openNews() {
    try {
      const r = await fetch("/api/news"); const j = await r.json();
      const list = (j.items || []).slice(0,8).map(it => `
        <li style="margin:.35rem 0">
          <a href="${it.url}" target="_blank" rel="noopener" style="color:#9cf">${it.title}</a>
          <div style="opacity:.85">${it.snippet || ""}</div>
        </li>`).join("");
      window.openHTMLPopup("News (KI · Recht · Tools)", `<div>Stand: <b>${j.stand || "-"}</b></div><ol style="padding-left:1.1rem;margin:.6rem 0 0">${list}</ol>`, { explain: "Tagesaktuell, 12 h Cache." });
    } catch (e) {
      window.openHTMLPopup("News", `<p>[Fehler] ${String(e)}</p>`);
    }
  }

  async function openWeeklyPrompts() {
    try {
      const r = await fetch("/api/prompts/top"); const j = await r.json();
      const list = (j.items || []).map(it => `<li style="margin:.35rem 0"><b>${it.title}</b><br/><code style="white-space:pre-wrap">${it.prompt}</code></li>`).join("");
      window.openHTMLPopup("Top‑5‑Prompts der Woche", `<div>Stand: <b>${j.stand || "-"}</b></div><ol style="padding-left:1.1rem;margin:.6rem 0 0">${list}</ol>`, { explain: "Kuratiert & verdichtet – sofort nutzbar." });
    } catch (e) {
      window.openHTMLPopup("Top‑5‑Prompts", `<p>[Fehler] ${String(e)}</p>`);
    }
  }

  function openProjects() {
    window.openHTMLPopup("Projekte", `<p><b>stay tuned!</b> — Projekt‑Showcase & Demos folgen hier.</p>`, { explain: "Aktuelle Cases & Live‑Demos." });
  }

  on('#nav-buttons .about',    'click', () => window.openHTMLPopup("Über", aboutHTML, { explain: "Rechtliches & Transparenz" }));
  on('#nav-buttons .news',     'click', openNews);
  on('#nav-buttons .prompts',  'click', openWeeklyPrompts);
  on('#nav-buttons .projects', 'click', openProjects);
})();
