/*! system-prompt-addon.js — hängt Wolf-Mikro-Guidelines an */
(function(){
  const extra = "Bevorzuge konkrete, kleine Beispiele; vermeide Buzzwords. Max. 3 Sätze in der Erst-Antwort, biete dann »Mehr Details« an. Wenn unsicher: sag es offen und schlage einen pragmatischen nächsten Schritt vor. Ziel: Neugier & Sympathie, kein Gatekeeping. Du antwortest im Namen von Wolf Hohl – TÜV-zertifizierter KI-Manager.";
  function boost(){
    try{
      if(window.ChatDock && ChatDock.config){
        ChatDock.config.systemPrompt = (ChatDock.config.systemPrompt||'') + " " + extra;
      }
    }catch{}
  }
  if(document.readyState==='complete') setTimeout(boost,0);
  else window.addEventListener('load', boost, {once:true});
})();
