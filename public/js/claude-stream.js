// public/js/claude-stream.js
const BASE = (() => {
  const meta = document.querySelector('meta[name="hohl-chat-base"]');
  return meta?.content?.trim() || '';
})();

// Simple SSE/stream reader
async function streamFetch(url, body, onToken, onDone, onError) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      throw new Error(`HTTP ${res.status} ${t || ''}`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder('utf-8');
    let buf = '';
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      buf += dec.decode(value, {stream:true});
      // split SSE lines
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const chunk of parts) {
        const line = chunk.split('\n').find(l=>l.startsWith('data:'));
        if (!line) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') { onDone?.(); return; }
        try {
          const j = JSON.parse(data);
          if (j.delta) onToken?.(j.delta);
        } catch {
          // allow plain text fallbacks
          onToken?.(data);
        }
      }
    }
    onDone?.();
  } catch (e) {
    onError?.(e);
  }
}

export function sendClaudeStream({prompt, system, threadId}) {
  const url = `${BASE}/api/claude-sse`;
  return {
    start(onToken, onDone, onError){
      streamFetch(url, {prompt, system, threadId}, onToken, onDone, onError);
    }
  };
}

export async function sendClaudeJSON({prompt, system, threadId}) {
  const res = await fetch(`${BASE}/api/claude-json`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({prompt, system, threadId})
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchNews() {
  const res = await fetch(`${BASE}/api/news`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // {items:[{title,url,source}], cachedAt:"HH:MM"}
}

export async function fetchTopPrompts() {
  const res = await fetch(`${BASE}/api/top-prompts`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // {items:[{title,body}], cachedAt:"HH:MM"}
}

export async function fetchDaily() {
  const res = await fetch(`${BASE}/api/daily`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // {title, body}
}
