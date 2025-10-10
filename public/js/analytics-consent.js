import { t } from './i18n.js';
const SRC = document.querySelector('meta[name="umami-src"]')?.content || '';
const ID = document.querySelector('meta[name="umami-website-id"]')?.content || '';
if (SRC && ID) {
  const key = 'consent_analytics'; const val = localStorage.getItem(key);
  if (val === 'granted') inject(); else if (val !== 'denied') banner();
}
function inject(){ const s = document.createElement('script'); s.defer = true; s.src = document.querySelector('meta[name="umami-src"]').content; s.setAttribute('data-website-id', document.querySelector('meta[name="umami-website-id"]').content); document.head.appendChild(s); }
function banner(){ const box = document.createElement('div'); box.className = 'banner-consent'; box.innerHTML = `<span>${t('consent_text')}</span>`; const yes = document.createElement('button'); yes.className = 'btn btn-primary'; yes.textContent = t('accept'); const no = document.createElement('button'); no.className = 'btn btn-secondary'; no.textContent = t('decline'); yes.onclick = () => { localStorage.setItem('consent_analytics','granted'); box.remove(); inject(); }; no.onclick = () => { localStorage.setItem('consent_analytics','denied'); box.remove(); }; box.append(yes, no); document.body.appendChild(box); }
