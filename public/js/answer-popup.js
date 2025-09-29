// /public/js/answer-popup.js
(() => {
  if (!document.getElementById("answer-popup-css")) {
    const s = document.createElement("style");
    s.id = "answer-popup-css";
    s.textContent = `
      .ap-backdrop{position:fixed;inset:0;background:rgba(6,10,14,.35);backdrop-filter:blur(6px);z-index:1700}
      .ap-box{position:fixed;left:50%;top:6%;transform:translateX(-50%);width:min(960px,92vw);background:rgba(12,16,22,.68);
        border:1px solid rgba(255,255,255,.18);border-radius:14px;color:#eaf2ff;z-index:1750;box-shadow:0 18px 60px rgba(0,0,0,.35)}
      .ap-hd{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;padding:14px 16px 8px}
      .ap-hd h3{margin:0;font-size:20px}
      .ap-hd .explain{margin:.25rem 0 0 0;font-size:13px;opacity:.9}
      .ap-tools{display:flex;gap:8px}
      .ap-btn{border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#eaf2ff;color:#0a1118;font-weight:700;padding:6px 12px;cursor:pointer}
      .ap-varbar{display:flex;gap:8px;padding:0 16px 8px}
      .ap-body{padding:8px 16px 16px}
      .ap-pre{white-space:pre-wrap;font:500 14px/1.4 ui-monospace, Menlo, monospace;color:#eaf2ff;min-height:120px}
    `;
    document.head.appendChild(s);
  }

  function closePopup() {
    document.querySelector(".ap-box")?.remove();
    document.querySelector(".ap-backdrop")?.remove();
  }

  function makeHeader(title, options) {
    const hd = document.createElement("div"); hd.className = "ap-hd";
    const left = document.createElement("div");
    const h3 = document.createElement("h3"); h3.textContent = title || "Ergebnis";
    left.appendChild(h3);
    if (options?.explain) {
      const p = document.createElement("p"); p.className = "explain"; p.textContent = options.explain; left.appendChild(p);
    }
    const tools = document.createElement("div"); tools.className = "ap-tools";
    const bCopy = document.createElement("button"); bCopy.className = "ap-btn"; bCopy.textContent = "Kopieren";
    bCopy.addEventListener("click", () => {
      const pre = document.querySelector(".ap-pre");
      if (pre) navigator.clipboard.writeText(pre.innerText || pre.textContent || "");
    });
    const bClose = document.createElement("button"); bClose.className = "ap-btn"; bClose.textContent = "Schließen";
    bClose.addEventListener("click", closePopup);
    tools.appendChild(bCopy); tools.appendChild(bClose);
    hd.appendChild(left); hd.appendChild(tools);
    return hd;
  }

  async function streamTo(pre, prompt, options) {
    pre.textContent = "";
    await window.Claude.stream(prompt, {
      threadId: options?.threadId,
      system: options?.system,
      onDelta: t => pre.textContent += t,
      onError: e => pre.textContent = `[Fehler] ${e}`
    });
  }

  function openAnswerPopup(promptOrText, sendToClaude = false, title = "Ergebnis", options = {}) {
    const backdrop = document.createElement("div"); backdrop.className = "ap-backdrop"; backdrop.addEventListener("click", closePopup);
    document.body.appendChild(backdrop);

    const box = document.createElement("div"); box.className = "ap-box";
    const header = makeHeader(title, options);
    const varbar = document.createElement("div"); varbar.className = "ap-varbar";
    ["Kürzer","Beispiel","Checkliste"].forEach(lbl => {
      const b = document.createElement("button"); b.className = "ap-btn"; b.textContent = lbl;
      b.addEventListener("click", () => {
        const tackOn = lbl === "Kürzer" ? "Kürze präzise ohne Inhalte zu verlieren."
                     : lbl === "Beispiel" ? "Gib ein prägnantes, realistisches Beispiel."
                     : "Erzeuge eine kompakte 5–7 Punkte Checkliste.";
        pre.textContent = "";
        const base = typeof promptOrText === "string" ? promptOrText : "";
        streamTo(pre, `${base}\n\n${tackOn}`, options);
      });
      varbar.appendChild(b);
    });

    const body = document.createElement("div"); body.className = "ap-body";
    const pre  = document.createElement("pre"); pre.className = "ap-pre";
    pre.textContent = sendToClaude ? "" : (typeof promptOrText === "string" ? promptOrText : "");
    body.appendChild(pre);

    box.appendChild(header); box.appendChild(varbar); box.appendChild(body);
    document.body.appendChild(box);

    if (sendToClaude && typeof promptOrText === "string") streamTo(pre, promptOrText, options);
  }

  function openHTMLPopup(title, html, options = {}) {
    const backdrop = document.createElement("div"); backdrop.className = "ap-backdrop"; backdrop.addEventListener("click", () => {
      document.querySelector(".ap-box")?.remove(); backdrop.remove();
    });
    document.body.appendChild(backdrop);
    const box = document.createElement("div"); box.className = "ap-box";
    const header = makeHeader(title, options);
    const body = document.createElement("div"); body.className = "ap-body"; body.innerHTML = html;
    box.appendChild(header); box.appendChild(body); document.body.appendChild(box);
  }

  window.openAnswerPopup = openAnswerPopup;
  window.openHTMLPopup   = openHTMLPopup;
})();
