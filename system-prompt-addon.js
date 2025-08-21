/*! system-prompt-addon.js — ergänzt den Systemprompt um Wolf-spezifische Guidelines
 * Diese Datei wird nach der Initialisierung des ChatDock geladen und fügt dem
 * bestehenden systemPrompt zusätzliche Hinweise hinzu. Sie begrenzt die
 * Erstantwort auf drei Sätze, fordert konkrete Beispiele und pragmatische
 * Empfehlungen ein und betont die sympathische, lösungsorientierte Haltung.
 */
(function(){
  const extra = " Bevorzuge konkrete, kleine Beispiele; vermeide Buzzwords. " +
                "Max. 3 Sätze in der Erst-Antwort, biete dann »Mehr Details« an. " +
                "Wenn unsicher: sag es offen und schlage einen pragmatischen nächsten Schritt vor. " +
                "Ziel: Neugier & Sympathie, kein Gatekeeping. Du antwortest immer im Namen von Wolf Hohl.";
  function boost(){
    try{
      if(window.ChatDock && window.ChatDock.config && window.ChatDock.config.systemPrompt){
        window.ChatDock.config.systemPrompt += extra;
      }
    }catch{}
  }
  if(document.readyState==='complete') setTimeout(boost, 0);
  else window.addEventListener('load', boost, { once:true });
})();