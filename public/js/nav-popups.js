// public/js/nav-popups.js
(() => {
  function on(sel, ev, fn){ document.addEventListener(ev, e => { if (e.target.closest(sel)) fn(e); }); }

  // „Über“ – dein Text in unserem Stil
  const aboutHTML = `
    <div style="max-height:60vh;overflow:auto">
      <h4>Rechtliches & Transparenz</h4>
      <p><b>Impressum</b><br/>Verantwortlich für den Inhalt:<br/>Wolf Hohl<br/>Greifswalder Str. 224a<br/>10405 Berlin</p>
      <p>E‑Mail: <a href="mailto:wolf@hohl.rocks">wolf@hohl.rocks</a></p>
      <p><b>Haftungsausschluss:</b><br/>Diese Website dient ausschließlich der Information. Trotz sorgfältiger Prüfung übernehme ich keine Haftung für Inhalte externer Links.</p>
      <p><b>Urheberrecht:</b><br/>Alle Inhalte dieser Website unterliegen dem deutschen Urheberrecht, alle Bilder wurden mit Hilfe von KI‑Tools (z. B. Midjourney) erzeugt.</p>
      <p><b>Hinweis zum EU AI Act:</b><br/>Diese Website informiert über Pflichten, Risiken und Fördermöglichkeiten beim Einsatz von KI nach EU AI Act und DSGVO. Sie ersetzt keine Rechtsberatung.</p>
      <h4>Datenschutzerklärung</h4>
      <p><b>Kontakt mit mir:</b> Wenn Sie per Formular oder E‑Mail Kontakt aufnehmen, werden Ihre Angaben zur Bearbeitung sechs Monate gespeichert.</p>
      <p><b>Cookies:</b> Diese Website verwendet keine Cookies zur Nutzerverfolgung oder Analyse.</p>
      <p><b>Ihre Rechte laut DSGVO:</b> Auskunft, Berichtigung, Löschung, Datenübertragbarkeit, Widerruf, Beschwerde bei der Datenschutzbehörde.</p>
    </div>
  `;

  async function openNews() {
    try {
      const r = await fetch("/api/news");
      const j = await r.json();
      const list = (j.items || []).slice(0,8).map(it => `
        <li style="margin:.35rem 0">
          <a href="${it.url}" target="_blank" rel="noopener" style="color:#9cf">${it.title}</a>
          <div style="opacity:.85">${it.snippet || ""}</div>
        </li>
      `).join("");
      const html = `
        <div>Stand: <b>${j.stand || "-"}</b></div>
        <ol style="padding-left:1.1rem;margin:.6rem 0 0 0">${list}</ol>
      `;
      window.openHTMLPopup("News (KI · Recht · Tools)", html, { explain: "Tagesaktuelle Kurzinfos – Quellen via Tavily, Cache 12 h." });
    } catch (e) {
      window.openHTMLPopup("News", `<p>[Fehler] ${String(e)}</p>`, { explain: "Tagesaktuelle Kurzinfos – Cache 12 h."});
    }
  }

  async function openWeeklyPrompts() {
    try {
      const r = await fetch("/api/prompts/top");
      const j = await r.json();
      const list = (j.items || []).map(it => `
        <li style="margin:.35rem 0">
          <b>${it.title}</b><br/>
          <code style="white-space:pre-wrap">${it.prompt}</code>
        </li>
      `).join("");
      const html = `
        <div>Stand: <b>${j.stand || "-"}</b> · Fünf direkt kopierbare Power‑Prompts</div>
        <ol style="padding-left:1.1rem;margin:.6rem 0 0 0">${list}</ol>
      `;
      window.openHTMLPopup("Top‑5‑Prompts der Woche", html, { explain: "Kuratiert & verdichtet – sofort einsetzbar." });
    } catch (e) {
      window.openHTMLPopup("Top‑5‑Prompts", `<p>[Fehler] ${String(e)}</p>`);
    }
  }

  function openProjects() {
    const html = `<p><b>stay tuned!</b> — Projekt‑Showcase & Demos folgen hier.</p>`;
    window.openHTMLPopup("Projekte", html, { explain: "Aktuelle Cases & Live‑Demos." });
  }

  on('#nav-buttons .about',   'click', () => window.openHTMLPopup("Über", aboutHTML, { explain: "Rechtliches & Transparenz" }) );
  on('#nav-buttons .news',    'click', openNews);
  on('#nav-buttons .prompts', 'click', openWeeklyPrompts);
  on('#nav-buttons .projects','click', openProjects);

  // Hilfe-Button (unten rechts)
  const help = document.getElementById("help");
  help?.addEventListener("click", () => {
    const html = `<p>Klicke eine farbige Bubble: Wir senden den Prompt direkt an Claude und streamen die Antwort.  
    In den Fenstern gibt’s <b>Kopieren</b> sowie <b>Kürzer/Beispiel/Checkliste</b>.  
    Über die bunten Buttons unten öffnest du <i>Über</i>, <i>News</i>, <i>Prompts</i> und <i>Projekte</i>.</p>`;
    window.openHTMLPopup("Was kann ich hier tun?", html, { explain: "Kurz erklärt in 20 Sekunden." });
  });
})();
