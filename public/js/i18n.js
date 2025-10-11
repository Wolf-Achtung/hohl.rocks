
const STORE_KEY = 'hohl_lang';
let _lang = (localStorage.getItem(STORE_KEY) || (navigator.language || 'de').slice(0,2)).toLowerCase();
if (_lang !== 'de' && _lang !== 'en') _lang = 'de';
export function lang(){ return _lang; }
export function setLang(l){ _lang = (l === 'de' || l === 'en') ? l : 'en'; localStorage.setItem(STORE_KEY, _lang); document.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang: _lang } })); }

const STR = {
  de: { ask:'Fragen', close:'Schließen', your_input:'Dein Input…', about_html:'<p><strong>hohl.rocks — Neon Gold UX++</strong><br>Ein spielerisches Interface für Prompts, Ideen und KI‑Experimente.</p><p>Wähle eine Bubble, lies die Micro‑Anleitung und probiere aus.</p><p><em>Tipp:</em> Über ⚙︎ kannst du Modell, System‑Prompt und Temperatur einstellen.</p>', news:'News', prompts:'Prompts', projects_html:'<p>Experimente: Visual Lab, Research Agent, Live‑Ticker …</p>', consent_text:'Dürfen wir anonyme Nutzungsdaten (Umami) erheben, um die Experience zu verbessern?', accept:'Akzeptieren', decline:'Ablehnen', settings:'Einstellungen', save:'Speichern', system_prompt:'System-Prompt', model:'Modell', temperature:'Temperatur', maxtokens:'Max Tokens', api_base:'API-Basis (leer = gleiche Origin)', language:'Sprache', copied:'Kopiert!', copy:'Kopieren' },
  en: { ask:'Ask', close:'Close', your_input:'Your input…', about_html:'<p><strong>hohl.rocks — Neon Gold UX++</strong><br>A playful interface for prompts, ideas and AI experiments.</p><p>Pick a bubble, read the micro‑guide and try it.</p>', news:'News', prompts:'Prompts', projects_html:'<p>Experiments: Visual Lab, Research Agent, Live ticker…</p>', consent_text:'May we collect anonymous usage data (Umami) to improve the experience?', accept:'Accept', decline:'Decline', settings:'Settings', save:'Save', system_prompt:'System prompt', model:'Model', temperature:'Temperature', maxtokens:'Max tokens', api_base:'API base (empty = same origin)', language:'Language', copied:'Copied!', copy:'Copy' }
};
export function t(key){ return (STR[_lang] && STR[_lang][key]) || key; }
