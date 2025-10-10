// File: public/js/i18n.js
export const I18N = {
  de: {
    'nav.about': 'Über',
    'nav.news': 'News',
    'nav.prompts': 'Prompts',
    'nav.projects': 'Projekte',
    'nav.settings': 'Einstellungen',
    aboutHtml: '<p><strong>hohl.rocks — Neon Gold UX++</strong><br>Ein spielerisches Interface für Ideen, Prompts und KI‑Experimente.</p><p>Wähle eine Bubble. Antworten kommen per Streaming vom Backend.</p>'
  },
  en: {
    'nav.about': 'About',
    'nav.news': 'News',
    'nav.prompts': 'Prompts',
    'nav.projects': 'Projects',
    'nav.settings': 'Settings',
    aboutHtml: '<p><strong>hohl.rocks — Neon Gold UX++</strong><br>A playful interface for ideas, prompts and AI experiments.</p><p>Pick a bubble. Answers stream in from the backend.</p>'
  }
};

export function getLang(){
  return localStorage.getItem('lang') || (navigator.language || 'de').slice(0,2).toLowerCase().replace(/[^a-z]/g,'') || 'de';
}
export function setLang(lang){
  localStorage.setItem('lang', lang);
  applyI18n();
}
export function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N.de[key] || key);
}
export function applyI18n(){
  const lang = getLang();
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')){
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  }
}
applyI18n();

document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('#lang-toggle');
  if (!btn) return;
  const next = getLang() === 'de' ? 'en' : 'de';
  setLang(next);
});
