<!-- WOLF VARIETY ENGINE – rotierende Antwort-Rezepte + Anti-Generik -->
<script>
(function(){
  'use strict';

  const STATE_KEY='wolf_recipe_idx';
  const WOLF_LINE='Wolf Hohl (30 Jahre Marketing/Trailer, TÜV-zertifizierter KI-Manager) empfiehlt einen konkreten nächsten Schritt.';
  let BANLIST=['KI kann','kann dazu beitragen','qualitativ','Originalität','sollte man','ist wichtig, dass','grundsätzlich','unter Umständen','es empfiehlt sich'];

  let RECIPES=[
    {name:'Fakten-first',rules:[
      'Satz 1: überraschender, konkreter Fakt oder Zahl.',
      'Satz 2: Mini-Beispiel (realistisch, 1 Nebensatz).',
      'Satz 3: nächster Schritt in Du-Form (≤ 12 Wörter).'
    ]},
    {name:'Beispiel-first',rules:[
      'Satz 1: direkt ein Mini-Beispiel (1 knapper Satz).',
      'Satz 2: warum das funktioniert (Mechanik/Prinzip).',
      'Satz 3: 10-Minuten-Aktion zum Nachmachen.'
    ]},
    {name:'Analogien',rules:[
      'Satz 1: klare Analogie (kein Buzzword), 1 Bild.',
      'Satz 2: Praxisbezug mit 1 Zahl/Parameter.',
      'Satz 3: 1 konkreter Schritt (Tool oder Prompt).'
    ]},
    {name:'Before/After',rules:[
      'Satz 1: „Vorher“ in 1 Halbsatz.',
      'Satz 2: „Nachher“ mit 1 Zahl/Tempo/Güte.',
      'Satz 3: wie du da hinkommst (1 Aktion).'
    ]},
    {name:'Mini-Checklist',rules:[
      'Genau 3 Sätze.',
      'Jeder Satz = 1 konkrete Maßnahme.',
      'Mind. 1 Satz nennt ein Tool/Feature (z. B. TTS, VAD, VLM).'
    ]},
    {name:'Berlin-Kontext',rules:[
      'Satz 1: kurzer Berlin-/DE-Alltagsbezug (kein Kitsch).',
      'Satz 2: konkretes Praxis-Beispiel.',
      'Satz 3: nächster Schritt mit Zeitangabe (heute/in 10 Min).'
    ]},
    {name:'Trailer-Metapher',rules:[
      'Satz 1: Hook wie im Trailer (eine starke Zeile).',
      'Satz 2: 1 präzise Technik (z. B. VLM, TTS, Prompt-Pattern).',
      'Satz 3: Actionable (Mini-Prompt oder Button-Aufgabe).'
    ]},
    {name:'Prompt-Pattern',rules:[
      'Satz 1: Ergebnis in 1 Zeile (Zielzustand).',
      'Satz 2: kurzes Prompt-Pattern in Anführungszeichen.',
      'Satz 3: 1 konkreter Prüfpunkt (Qualitätskriterium).'
    ]},
    {name:'10-Min-Action',rules:[
      'Satz 1: Was du in 10 Minuten erreichst (realistisch).',
      'Satz 2: genaue Schritte/Parameter (1–2).',
      'Satz 3: wie du Impact misst (1 Kennzahl).'
    ]}
  ];

  function pickRecipe(){
    let i=parseInt(sessionStorage.getItem(STATE_KEY)||'0',10);
    i=(i+1)%RECIPES.length; sessionStorage.setItem(STATE_KEY,String(i));
    return RECIPES[i];
  }

  function buildInstruction(){
    const r=pickRecipe();
    const header='Antworte auf Deutsch, Ton „winter-klar, souverän, freundlich-prägnant“. Keine Floskeln, keine Disclaimer, kein Buzzword-Gerassel.';
    const rules=r.rules.map(s=>'– '+s).join(' ');
    const bans='Vermeide explizit: '+BANLIST.join(', ')+'.';
    const wolf='Kontext: '+WOLF_LINE;
    return header+' '+rules+' '+bans+' '+wolf+' Signiere nicht, nenne keine Quellen.';
  }

  function applyVariety(userMsg){
    return String(userMsg||'')+'\n\n'+buildInstruction();
  }

  function patchChatDock(){
    if(!window.ChatDock||typeof ChatDock.send!=='function') return false;
    if(ChatDock.__wolfVarietyPatched) return true;

    const origSend=ChatDock.send.bind(ChatDock);
    ChatDock.send=(msg)=>origSend(applyVariety(msg));

    if(typeof ChatDock.sendAttachment==='function'){
      const origA=ChatDock.sendAttachment.bind(ChatDock);
      ChatDock.sendAttachment=(opts={})=>{
        const o=Object.assign({},opts); if(o.prompt) o.prompt=applyVariety(o.prompt); return origA(o);
      };
    }

    if(typeof ChatDock.initChatDock==='function' && !ChatDock.__wolfVarietyInitWrapped){
      const origInit=ChatDock.initChatDock.bind(ChatDock);
      ChatDock.initChatDock=function(){ const r=origInit.apply(ChatDock,arguments); setTimeout(patchChatDock,0); return r; };
      ChatDock.__wolfVarietyInitWrapped=true;
    }

    ChatDock.__wolfVarietyPatched=true; return true;
  }

  if(!patchChatDock()){
    document.addEventListener('DOMContentLoaded',patchChatDock);
    let tries=0; const t=setInterval(()=>{ if(patchChatDock()||++tries>10) clearInterval(t); },300);
  }

  window.WolfVariety={
    addRecipe(r){ if(r&&r.name&&Array.isArray(r.rules)) RECIPES.push(r); },
    list(){ return RECIPES.map(r=>r.name); },
    setBanlist(arr){ if(Array.isArray(arr)) BANLIST=arr.slice(); },
    debugInfo(){ return {recipes:RECIPES.map(r=>r.name),banlist:BANLIST.slice()}; }
  };
})();
</script>
