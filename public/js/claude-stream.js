<!-- public/js/claude-stream.js -->
<script>
(() => {
  const META = document.querySelector('meta[name="hohl-chat-base"]');
  const BASE = (META && META.content) ? META.content.replace(/\/+$/, '') : window.location.origin;

  // Versuchsreihenfolge der Endpunkte (SSE zuerst)
  const CANDIDATES = [
    (p) => `${BASE}/api/claude-sse?${p}`,
    (p) => `${BASE}/claude-sse?${p}`,
    (p) => `${BASE}/api/claude?${p}`,
    (p) => `${BASE}/claude?${p}`
  ];

  function enc(params) { return new URLSearchParams(params).toString(); }
  function uid(n=8){ return Math.random().toString(36).slice(2,2+n); }

  async function trySSE(url, onToken, signal) {
    const resp = await fetch(url, { headers: { Accept: 'text/event-stream' }, signal });
    if (!resp.ok) {
      const t = await resp.text().catch(()=> '');
      const is404 = resp.status === 404;
      return { ok:false, hard:!is404, text:t, status:resp.status };
    }
    if (!/text\/event-stream/i.test(resp.headers.get('content-type') || '')) {
      return { ok:false, hard:false, text:'Not SSE' };
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream:true });
      const parts = buf.split(/\n\n/);
      buf = parts.pop();
      for (const chunk of parts) {
        const line = chunk.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') return { ok:true, done:true };
        try {
          const j = JSON.parse(data);
          const token = j.delta || j.text || j.content || j.token || '';
          if (token) onToken(token);
        } catch {
          onToken(data);
        }
      }
    }
    return { ok:true, done:true };
  }

  async function tryJSON(url, onToken, signal) {
    const resp = await fetch(url, { headers: { Accept:'application/json' }, signal });
    if (!resp.ok) {
      const is404 = resp.status === 404;
      return { ok:false, hard:!is404, text:await resp.text().catch(()=>''), status:resp.status };
    }
    const data = await resp.json().catch(()=> ({}));
    const text = data.text || data.answer || data.content || '';
    if (text) onToken(text);
    return { ok:true, done:true };
  }

  async function runClaude({ prompt, system='', thread='', temperature=0.5 }, onToken, { preferJSON=false, signal }={}) {
    const qs = enc({ prompt, system, thread: thread || uid(10), temperature });
    const order = preferJSON ? [2,3,0,1] : [0,1,2,3]; // JSON bevorzugen? (selten sinnvoll)
    for (const i of order) {
      const url = CANDIDATES[i](qs);
      try {
        const tryFn = (i<=1) ? trySSE : tryJSON;
        const res = await tryFn(url, onToken, signal);
        if (res.ok) return { ok:true, tried:url };
        if (res.hard) return { ok:false, tried:url, error:res.text || ('HTTP '+res.status) };
      } catch (e) {
        // nächste Variante probieren
      }
    }
    return { ok:false, error:'Alle Endpunkte nicht erreichbar.' };
  }

  // Thread-IDs je Key im Browser merken (Mini-Apps)
  function getThreadId(key) {
    const k = 'thread:' + key;
    let id = sessionStorage.getItem(k);
    if (!id) { id = uid(12); sessionStorage.setItem(k, id); }
    return id;
  }

  window.Claude = {
    stream: runClaude,
    thread: getThreadId,
    base: BASE
  };
})();
</script>
