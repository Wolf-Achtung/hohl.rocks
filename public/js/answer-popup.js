// public/js/answer-popup.js
// Ein zentrales Popup für Antworten & HTML-Inhalte. Mit Explain-Support und Tool-Buttons.

(() => {
  // Styles nur einmal einfügen
  if (!document.getElementById("answer-popup-css")) {
    const css = document.createElement("style");
    css.id = "answer-popup-css";
    css.textContent = `
      .ap-backdrop{position:fixed;inset:0;background:rgba(6,10,14,.35);backdrop-filter:blur(6px);z-index:1700}
      .ap-box{position:fixed;left:50%;top:6%;transform:translateX(-50%);width:min(960px,92vw);background:rgba(12,16,22,.68);
        border:1px solid rgba(255,255,255,.18);border-radius:14px;color:#eaf2ff;z-index:1750;box-shadow:0 18px 60px rgba(0,0,0,.35)}
      .ap-hd{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;padding:14px 16px 8px 16px}
      .ap-hd h3{margin:0;font-size:20px}
      .ap-hd .explain{margin:.25rem 0 0 0;font-size:13px;opacity:.9}
      .ap-tools{display:flex;gap:8px}
      .ap-btn{border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#eaf2ff;color:#0a1118;font-weight:700;padding:6px 12px;cursor:pointer}
      .ap-body{padding:8px 16px 16px 16px}
      .ap-pre{white-space:pre-wrap;font:500 14px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;color:#eaf2ff;min-height:120px}
      .ap-varbar{display:flex;gap:8px;padding:0 16px 8px 16px}
      .ap-range{height:6px;background:#fff3;border-radius:4px;margin:12px 16px}
    `;
    document.head.appendChild(css);
  }

  function closePopup(node) {
    node?.parentElement?.removeChild(node);
    document.querySelector(".ap-backdrop")?.remove();
  }

  function makeHeader(title, options) {
    const hd = document.createElement("div");
    hd.className = "ap-hd";

    const left = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = title || "Ergebnis";
    left.appendChild(h3);

    if (options?.explain) {
      const p = document.createElement("p");
      p.className = "explain";
      p.textContent = options.explain;
      left.appendChild(p);
    }

    const tools = document.createElement("div");
    tools.className = "ap-tools";

    const btnCopy = document.createElement("button");
    btnCopy.className = "ap-btn";
    btnCopy.textContent = "Kopieren";
    btnCopy.addEventListener("click", () => {
      const pre = document.querySelector(".ap-box .ap-pre");
      if (pre) navigator.clipboard.writeText(pre.innerText || pre.textContent || "");
    });

    const btnClose = document.createElement("button");
    btnClose.className = "ap-btn";
    btnClose.textContent = "Schließen";
    btnClose.addEventListener("click", () => {
      closePopup(document.querySelector(".ap-box"));
    });

    tools.appendChild(btnCopy);
    tools.appendChild(btnClose);

    hd.appendChild(left);
    hd.appendChild(tools);
    return hd;
  }

  function openAnswerPopup(promptOrText, sendToClaude = false, title = "Ergebnis", options = {}) {
    // Backdrop
    const backdrop = document.createElement("div"); backdrop.className = "ap-backdrop";
    backdrop.addEventListener("click", () => closePopup(box));
    document.body.appendChild(backdrop);

    const box = document.createElement("div");
    box.className = "ap-box";

    const header = makeHeader(title, options);
    const varbar = document.createElement("div");
    varbar.className = "ap-varbar";

    // Varianten (optional)
    ["Kürzer", "Beispiel", "Checkliste"].forEach(label => {
      const b = document.createElement("button");
      b.className = "ap-btn";
      b.textContent = label;
      b.addEventListener("click", async () => {
        const tackOn = label === "Kürzer" ? "Kürze präzise ohne Inhalte zu verlieren."
                     : label === "Beispiel" ? "Gib ein präzises, realitätsnahes Beispiel."
                     : "Erzeuge eine kompakte Checkliste mit 5–7 Punkten.";
        const base = typeof promptOrText === "string" ? promptOrText : "";
        pre.textContent = "";
        await streamTo(pre, `${base}\n\n${tackOn}`, options);
      });
      varbar.appendChild(b);
    });

    const body = document.createElement("div"); body.className = "ap-body";
    const pre  = document.createElement("pre"); pre.className = "ap-pre";
    pre.textContent = typeof promptOrText === "string" ? (sendToClaude ? "" : promptOrText) : "";

    body.appendChild(pre);

    // Fortschritt (minimale Range als „Ladebalken“)
    const rng = document.createElement("div"); rng.className = "ap-range";
    body.appendChild(rng);

    box.appendChild(header);
    box.appendChild(varbar);
    box.appendChild(body);
    document.body.appendChild(box);

    // ggf. Claude anwerfen
    if (sendToClaude && typeof promptOrText === "string") {
      streamTo(pre, promptOrText, options).catch(() => {});
    }
  }

  async function streamTo(pre, prompt, options) {
    pre.textContent = "";
    const threadId = options?.threadId || undefined;
    const system   = options?.system   || undefined;
    await window.Claude.stream(prompt, {
      threadId,
      system,
      onDelta: t => { pre.textContent += t; },
      onDone:  () => {},
      onError: e => { pre.textContent = `[Fehler] ${e}`; }
    });
  }

  function openHTMLPopup(title, html, options = {}) {
    const backdrop = document.createElement("div"); backdrop.className = "ap-backdrop";
    backdrop.addEventListener("click", () => closePopup(box));
    document.body.appendChild(backdrop);

    const box = document.createElement("div"); box.className = "ap-box";
    const header = makeHeader(title, options);
    const body = document.createElement("div"); body.className = "ap-body";
    body.innerHTML = html; // Hinweis: Inhalte stammen aus eigener API → unkritisch. Bei fremden Quellen: sanitisieren.

    box.appendChild(header);
    box.appendChild(body);
    document.body.appendChild(box);
  }

  window.openAnswerPopup = openAnswerPopup;
  window.openHTMLPopup   = openHTMLPopup;
})();
