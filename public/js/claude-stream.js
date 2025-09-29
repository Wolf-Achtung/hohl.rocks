// public/js/claude-stream.js
// Frontend-Client für Claude (SSE + JSON Fallback). Auto-Basis aus <meta name="hohl-chat-base">.

(() => {
  const BASE = (document.querySelector('meta[name="hohl-chat-base"]')?.content || "").replace(/\/+$/,"") || location.origin;

  async function stream(prompt, { threadId, system, onDelta, onDone, onError } = {}) {
    try {
      const r = await fetch(`${BASE}/api/claude-sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, system, thread: threadId, max_tokens: 900, temperature: 0.25 })
      });

      if (!r.ok || !r.headers.get("content-type")?.includes("text/event-stream")) {
        // JSON-Fallback
        const j = await complete(prompt, { threadId, system });
        if (onDelta) onDelta(j.text || "");
        if (onDone) onDone();
        return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("event:")) continue;
          const [ , ev ] = line.split("event: ");
          const dataLine = part.split("\n").find(l => l.startsWith("data: "));
          const payload = dataLine ? dataLine.slice(6) : "{}";

          if (ev === "delta") {
            try {
              const { text } = JSON.parse(payload);
              if (text && onDelta) onDelta(text);
            } catch {}
          } else if (ev === "error") {
            if (onError) onError(payload);
          } else if (ev === "done") {
            if (onDone) onDone();
          }
        }
      }
    } catch (e) {
      if (onError) onError(e);
    }
  }

  async function complete(prompt, { threadId, system } = {}) {
    const r = await fetch(`${BASE}/api/claude-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, thread: threadId, max_tokens: 900, temperature: 0.25 })
    });
    if (!r.ok) throw new Error(`Claude JSON ${r.status}`);
    return r.json();
  }

  window.Claude = { BASE, stream, complete };
})();
