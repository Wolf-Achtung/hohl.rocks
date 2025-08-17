(function(){
  const SSE=window.CHAT_ENDPOINT_SSE||(window.CHAT_ENDPOINT?String(window.CHAT_ENDPOINT).replace(/\/chat(\b|$)/,'/chat-sse'):'');
  function el(t,c,h){const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n}
  function mount(){
    if(document.querySelector('.chat-dock')) return;
    const dock=el('form','chat-dock','');dock.innerHTML='<input type="text" placeholder="Frage stellen… (EU AI Act, KI‑Sicherheit, Projekte)" aria-label="Frage stellen"><button type="submit">Senden</button>';document.body.appendChild(dock);
    const panel=el('div','chat-panel','');panel.style.display='none';const out=el('div','chat-output','');panel.appendChild(out);const close=el('button','chat-close','×');close.type='button';close.onclick=()=>panel.style.display='none';panel.appendChild(close);document.body.appendChild(panel);
    const input=dock.querySelector('input');const btn=dock.querySelector('button');
    async function ask(q){ if(!q) return; panel.style.display='block'; out.textContent=''; if(!SSE){ out.textContent='Kein Streaming-Endpoint konfiguriert.'; return; } btn.disabled=true;
      try{ const res=await fetch(SSE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})}); if(!res.ok||!res.body){ out.textContent='Fehler beim Stream-Start.'; return;}
        const reader=res.body.getReader();const dec=new TextDecoder();let buf=''; while(true){const {value,done}=await reader.read(); if(done) break; buf+=dec.decode(value,{stream:true}); let idx; while((idx=buf.indexOf('\\n\\n'))!==-1){const chunk=buf.slice(0,idx).trim(); buf=buf.slice(idx+2); if(!chunk) continue; for(const line of chunk.split('\\n')){ if(!/^data:/.test(line)) continue; try{ const obj=JSON.parse(line.replace(/^data:\\s*/,'')); if(obj.delta) out.textContent+=obj.delta; }catch{}} } }
      }catch(e){ out.textContent+='\\n[Stream abgebrochen]'; } finally{ btn.disabled=false; } }
    dock.addEventListener('submit',e=>{e.preventDefault(); const q=input.value.trim(); if(q) ask(q); input.value='';});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();