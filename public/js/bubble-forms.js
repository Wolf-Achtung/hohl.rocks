// public/js/bubble-forms.js
// Input-Popup mit großem Textfeld. Sendet zu Claude (SSE) und streamt die Antwort.

(() => {
  if (!document.getElementById("bubble-forms-css")) {
    const css = document.createElement("style");
    css.id = "bubble-forms-css";
    css.textContent = `
      .bf-box{position:fixed;left:50%;top:4%;transform:translateX(-50%);width:min(1100px,94vw);
        background:rgba(12,16,22,.68);border:1px solid rgba(255,255,255,.18);border-radius:16px;color:#eaf2ff;z-index:1750}
      .bf-hd{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px 8px 16px}
      .bf-hd h3{margin:0;font-size:20px}
      .bf-hd .explain{margin:.25rem 0 0 0;font-size:13px;opacity:.9}
      .bf-tools{display:flex;gap:8px}
      .bf-btn{border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#eaf2ff;color:#0a1118;font-weight:700;padding:6px 12px;cursor:pointer}
      .bf-body{padding:12px 16px 16px 16px}
      .bf-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
      .bf-textarea{width:100%;min-height:210px;border-radius:10px;border:1px solid rgba(255,255,255,.18);padding:12px;background:#0b1219;color:#eaf2ff}
      .bf-send{border-radius:999px;background:#1ee0a5;color:#072019;border:0;padding:10px 16px;font-weight:900;cursor:pointer}
      .bf-out{margin-top:12px;background:#0b1219;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:12px;min-height:120px;white-space:pre-wrap}
      .bf-backdrop{position:fixed;inset:0;background:rgba(6,10,14,.35);backdrop-filter:blur(6px);z-index:1700}
    `;
    document.head.appendChild(css);
  }

  function close(node) {
    node?.parentElement?.removeChild(node);
    document.querySelector(".bf-backdrop")?.remove();
  }

  function openInputBubble(title, basePrompt = "", options = {}) {
    const backdrop = document.createElement("div"); backdrop.className = "bf-backdrop";
    backdrop.addEventListener("click", () => close(box));
    document.body.appendChild(backdrop);

    const box = document.createElement("div"); box.className = "bf-box";

    // Header
    const hd = document.createElement("div"); hd.className = "bf-hd";
    const left = document.createElement("div");
    const h3 = document.createElement("h3"); h3.textContent = title || "Eingabe";
    left.appendChild(h3);

    if (options?.explain) {
      const p = document.createElement("p");
      p.className = "explain";
      p.textContent = options.explain;
      left.appendChild(p);
    }

    const tools = document.createElement("div"); tools.className = "bf-tools";
    const bCopy  = document.createElement("button"); bCopy.className = "bf-btn"; bCopy.textContent = "Kopieren";
    const bClose = document.createElement("button"); bClose.className = "bf-btn"; bClose.textContent = "Schließen";
    bCopy.addEventListener("click", () => navigator.clipboard.writeText(out.innerText || out.textContent || ""));
    bClose.addEventListener("click", () => close(box));
    tools.appendChild(bCopy); tools.appendChild(bClose);

    hd.appendChild(left); hd.appendChild(tools);

    // Body
    const body = document.createElement("div"); body.className = "bf-body";

    const ta = document.createElement("textarea");
    ta.className = "bf-textarea";
    ta.placeholder = options?.placeholder || "Stichpunkte oder Rohfassung …";

    const send = document.createElement("button");
    send.className = "bf-send";
    send.textContent = "Senden";

    const row = document.createElement("div"); row.className = "bf-row";
    row.appendChild(ta); row.appendChild(send);

    const out = document.createElement("div"); out.className = "bf-out";

    body.appendChild(row);
    body.appendChild(out);

    box.appendChild(hd);
    box.appendChild(body);
    document.body.appendChild(box);

    // Aktion
    send.addEventListener("click", async () => {
      const user = (ta.value || "").trim();
      const prompt = user ? `${basePrompt}\n\nNutzereingabe:\n${user}` : basePrompt;
      out.textContent = "";
      await window.Claude.stream(prompt, {
        threadId: options?.threadId,
        system: options?.system,
        onDelta: t => { out.textContent += t; },
        onError: e => { out.textContent = `[Fehler] ${e}`; }
      });
    });
  }

  window.openInputBubble = openInputBubble;
})();
