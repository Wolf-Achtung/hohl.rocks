// File: public/js/nav-popups.js
import { openAnswerPopup, openCustomPopup } from './answer-popup.js';
import { fetchNews, fetchTopPrompts } from './news-client.js';

document.addEventListener('click', async (ev) => {
  const a = ev.target.closest('[data-action]');
  if (!a) return;
  const act = a.getAttribute('data-action');

  if (act === 'news') {
    ev.preventDefault();
    try {
      const data = await fetchNews();
      const items = data?.items || [];
      const box = openCustomPopup({ title: 'News', explain: `Stand: ${data?.stand || '—'}` });
      const ul = document.createElement('ul');
      ul.style.margin = '0'; ul.style.paddingLeft = '18px';
      for (const it of items) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = it.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = it.title || it.url;
        const src = document.createElement('span'); src.textContent = it.source ? ` — ${it.source}` : '';
        li.append(link, src); ul.appendChild(li);
      }
      box.body.appendChild(ul);
      box.ok.textContent = 'Schließen';
      box.cpy.textContent = 'Kopieren';
      box.cpy.addEventListener('click', () => {
        const text = items.map(i => `• ${i.title} — ${i.url}`).join('\n');
        navigator.clipboard?.writeText(text).catch(()=>{});
      });
    } catch (e) {
      openAnswerPopup({ title:'News', content: 'Keine Live‑News abrufbar.' });
    }
  }
});
