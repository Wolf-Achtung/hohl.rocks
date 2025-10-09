// File: public/js/nav-popups.js — News-Overlay mit echten Treffern + „Stand: HH:MM“
import { openAnswerPopup, openCustomPopup } from './answer-popup.js';
import { fetchNews, fetchTopPrompts } from './claude-stream.js';

const nav = document.getElementById('nav');
const soundBtn = document.getElementById('sound-toggle');

function makeNewsList(items = []) {
  const wrap = document.createElement('div');
  wrap.className = 'news-wrap';
  const ul = document.createElement('ul');
  ul.style.margin = '0';
  ul.style.paddingLeft = '18px';

  for (const it of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title || (it.url || '').slice(0, 80);
    const src = document.createElement('span');
    src.className = 'news-source';
    src.textContent = (it.source ? ` — ${it.source}` : '');
    li.appendChild(a);
    li.appendChild(src);
    ul.appendChild(li);
  }
  wrap.appendChild(ul);
  return wrap;
}

async function showNews() {
  try {
    const data = await fetchNews();
    const time = data?.stand ? data.stand : '';
    const items = data?.items || [];
    const box = openCustomPopup({
      title: 'News',
      explain: `Stand: ${time || '—'}`,
    });
    box.body.appendChild(makeNewsList(items));
    box.ok.textContent = 'Schließen';
    box.cpy.textContent = 'Kopieren';
    box.cpy.addEventListener('click', () => {
      const text = items.map(i => `• ${i.title} — ${i.url}`).join('\n');
      navigator.clipboard?.writeText(text).catch(()=>{});
    }, { once: true });
  } catch (e) {
    openAnswerPopup({
      title: 'News',
      content: 'Keine Live‑News abrufbar. Bitte TAVILY_API_KEY setzen oder später erneut versuchen.'
    });
  }
}

nav?.addEventListener('click', async (ev) => {
  const target = ev.target.closest('[data-action]');
  if (!target) return;
  const action = target.getAttribute('data-action');

  if (action === 'news') {
    ev.preventDefault();
    showNews();
    return;
  }

  if (action === 'top-prompts') {
    ev.preventDefault();
    try {
      const data = await fetchTopPrompts();
      const list = (data?.items || []).map((t,i)=>`${i+1}. ${t}`).join('\n');
      openAnswerPopup({ title:'Top‑Prompts', content: list || '—' });
    } catch {
      openAnswerPopup({ title:'Top‑Prompts', content: 'Derzeit nicht verfügbar.' });
    }
    return;
  }

  if (action === 'sound') {
    try {
      await (window.Ambient?.ensureStart?.(true));
      await (window.Ambient?.toggle?.());
      const on = window.Ambient?.isOn?.();
      soundBtn?.setAttribute('aria-pressed', on ? 'true' : 'false');
    } catch {
      openAnswerPopup({ title: 'Klang', content: 'Audio nicht verfügbar.' });
    }
  }
});
