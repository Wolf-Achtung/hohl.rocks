(function (w, d) {
  'use strict';
  const metaBase = (d.querySelector('meta[name="hohl-chat-base"]')?.content || '').trim();
  const envBase  = (w.HOHL_CHAT_BASE || '').trim();
  const BASES = Array.from(new Set([envBase, metaBase, '', '/api'])).filter(Boolean);
  const ROUTE_SETS = [
    { sse: '/claude-sse', post: '/claude', json: '/claude-json' },
    { sse: '/chat-sse',   post: '/chat',   json: '/claude-json' }
  ];

  function openPopup(title, subtitle){
    if (w.AnswerPopup?.open) return w.AnswerPopup.open({ title, subtitle });
    const id='fallback-answer'; let el=d.getElementById(id);
    if(!el){ el=d.createElement('div'); el.id=id; el.style.cssText='position:fixed;left:50%;top:72px;transform:translateX(-50%);z-index:1500;min-width:min(820px,90vw);background:rgba(12,16,22,.72);color:#eaf2ff;border:1px solid rgba(255,255,255,.18);border-radius:16px;backdrop-filter:blur(10px);padding:14px 16px;box-shadow:0 20px 60px rgba(0,0,0,.35)'; el.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><strong id="t"></strong><button id="x" style="border-radius:999px;padding:6px 10px;border:1px solid rgba(255,255,255,.22);cursor:pointer;background:#38424a;color:#eaf2ff">Schließen</button></div><pre id="b" style="margin:0;white-space:pre-wrap;word-wrap:break-word;font:500 14px/1.5 ui-monospace,Menlo,Consolas,monospace;max-height:48vh;overflow:auto"></pre>'; d.body.appendChild(el); el.querySelector('#x').onclick=()=>el.remove(); }
    el.querySelector('#t').textContent = title || 'Antwort'; el.querySelector('#b').textContent=''; const body=el.querySelector('#b');
    return { write:t=>body.textContent+=t, set:t=>body.textContent=t, done(){}, error:m=>body.textContent='[Fehler] '+m };
  }

  async function runToPopup(title, prompt, opts={}){
    const { system, model, thread, subtitle } = opts;
    const ui = openPopup(title, subtitle);
    let bi=0, ri=0;

    function next(){ ri++; if(ri>=ROUTE_SETS.length){ ri=0; bi++; } if(bi>=BASES.length){ ui.error('API nicht erreichbar.'); return false; } start(); return true; }

    function start(){
      const base=BASES[bi]; const r=ROUTE_SETS[ri];
      const qs = new URLSearchParams({ prompt: prompt||'' }); if(system) qs.set('system', system); if(model) qs.set('model', model); if(thread) qs.set('thread', thread);
      const url = `${base}${r.sse}?${qs.toString()}`;

      let es;
      try{ es = new EventSource(url); }catch{ if(!next()) return; else return; }

      let timer = setInterval(()=>{ try{ es?.readyState===1 && ui.write(''); }catch{} }, 20000);

      es.onmessage = ev => {
        try{ const j=JSON.parse(ev.data); if(j.delta) ui.write(j.delta); if(j.done){ clearInterval(timer); es.close(); ui.done(); } }
        catch{ if(ev.data) ui.write(ev.data); }
      };
      es.addEventListener('done', ()=>{ clearInterval(timer); es.close(); ui.done(); });
      es.onerror = () => {
        clearInterval(timer); es && es.close();
        fetch(`${base}${r.post}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt, system, model, thread })})
          .then(res => { if(res.status===404) throw new Error('404'); if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
          .then(j => ui.set(j.text || j.answer || '[Leere Antwort]'))
          .catch(err => { if(String(err.message).includes('404')){ if(!next()) return; } else ui.error(err.message||'Netzwerkfehler'); });
      };
    }
    start();
  }

  async function runJSON(title, instruction, opts={}){
    const { model, thread } = opts; const ui = openPopup(title, opts.subtitle);
    for(let b=0;b<BASES.length;b++){ const base=BASES[b];
      for(let r=0;r<ROUTE_SETS.length;r++){ const url=`${base}${ROUTE_SETS[r].json}`;
        try{ const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:instruction,model,thread})});
          if(res.status===404) throw new Error('404'); if(!res.ok) throw new Error('HTTP '+res.status);
          const j=await res.json(); ui.set(JSON.stringify(j,null,2)); ui.done(); return j; }
        catch(e){ if(!String(e.message).includes('404')){ ui.error(e.message||'Netzwerkfehler'); return null; } }
      }
    }
    ui.error('API nicht erreichbar.'); return null;
  }

  w.HohlChat = { runToPopup, runJSON, setBase:(b)=>{ if(b) BASES.unshift(b); } };
  w.runClaudeToPopup = runToPopup;
})(window, document);
