// /public/js/claude-stream.js
(() => {
  const BASE =
    (document.querySelector('meta[name="hohl-chat-base"]')?.content || "")
      .replace(/\/+$/, "") || location.origin;

  async function stream(
    prompt,
    { threadId, system, onDelta, onDone, onError } = {}
  ) {
    try {
      const r = await fetch(`${BASE}/api/claude-sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          system,
          max_tokens: 900,
          temperature: 0.25,
          thread: threadId,
        }),
      });

      if (
        !r.ok ||
        !r.headers.get("content-type")?.includes("text/event-stream")
      ) {
        const j = await complete(prompt, { threadId, system });
        onDelta && onDelta(j.text || "");
        onDone && onDone();
        return;
      }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const part of parts) {
          const evLine = part.split("\n").find((l) =>
            l.startsWith("event: ")
          );
          const dataLine = part.split("\n").find((l) =>
            l.startsWith("data: ")
          );
          if (!evLine || !dataLine) continue;
          const ev = evLine.slice(7).trim();
          const payload = dataLine.slice(6);
          if (ev === "delta") {
            try {
              const { text } = JSON.parse(payload);
              text && onDelta && onDelta(text);
            } catch {}
          } else if (ev === "error") {
            onError && onError(payload);
          } else if (ev === "done") {
            onDone && onDone();
          }
        }
      }
    } catch (e) {
      onError && onError(e);
    }
  }

  async function complete(prompt, { threadId, system } = {}) {
    const r = await fetch(`${BASE}/api/claude-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        system,
        max_tokens: 900,
        temperature: 0.25,
        thread: threadId,
      }),
    });
    // Wenn der Server nicht antwortet oder eine 404/5xx liefert, werfe eine
    // verständliche Fehlermeldung statt eines kryptischen Fehlertexts. Die
    // ursprüngliche Implementierung hat den reinen HTTP‑Status propagiert
    // (z. B. "Error: Claude JSON 404"), was in der UI ohne Kontext erscheint.
    if (!r.ok) {
      const msg = `Der Chat‑Dienst ist momentan nicht erreichbar (HTTP ${r.status}).\nBitte prüfe die Backend‑Konfiguration oder versuche es später erneut.`;
      throw new Error(msg);
    }
    return r.json();
  }

  window.Claude = { BASE, stream, complete };
})();
