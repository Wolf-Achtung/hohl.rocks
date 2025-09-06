/*! fetch-chat.js – JSON-only mit sessionStorage Cache */
(function(){
  'use strict';
  function fetchAnswer(prompt){
    try{ window.dispatchEvent(new CustomEvent('chat:send')); }catch(e){}
    const base = String(window.HOHLROCKS_CHAT_BASE || '').replace(/\/+$/, '');
    const url  = base + '/chat';
    const body = { message: prompt || '', systemPrompt: String(window.WOLF_SYSTEM_PROMPT||''), model: (window.DEFAULT_GPT_MODEL||'gpt-4o-mini') };
    const cacheKey = 'ans:' + (prompt||'').trim().slice(0,200);
    try{
      const hit = sessionStorage.getItem(cacheKey);
      if(hit){ try{ window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: hit } })); window.dispatchEvent(new CustomEvent('chat:done')); }catch(e){} return; }
    }catch(e){}
    fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body), mode:'cors' })
      .then(r=>r.json()).then(json=>{
        let text='';
        if(json){ text = json.answer||json.text||json.message||json.content||JSON.stringify(json); }
        try{
          sessionStorage.setItem(cacheKey, text);
        }catch(e){}
        try{
          window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: text } }));
          window.dispatchEvent(new CustomEvent('chat:done'));
        }catch(e){}
      }).catch(err=>{
        const msg='Fehler: '+(err&&err.message?err.message:String(err));
        try{ window.dispatchEvent(new CustomEvent('chat:delta', { detail:{ delta: msg } })); window.dispatchEvent(new CustomEvent('chat:done')); }catch(e){}
      });
  }
  window.fetchAnswer = fetchAnswer;
})();