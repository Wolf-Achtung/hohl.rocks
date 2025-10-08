// public/js/nav-popups.js — overlays for About/News/Prompts/Projects/Sound
import { openAnswerPopup, openCustomPopup } from './answer-popup.js';
import { fetchNews, fetchTopPrompts } from './claude-stream.js';

const nav = document.getElementById('nav');
const soundBtn = document.getElementById('sound-toggle');

function makeNewsList(items = []) {
  const wrap = document.createElement('div');
  const ul = document.createElement('ul');
  ul.style.margin = '0';
  ul.style.paddingLeft = '18px';
  for (const it of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title || (it.url || '').slice(0, 60);
    a.style.color = 'inherit';
    a.style.textDecoration = 'underline';
    const small = document.createElement('span');
    try {
      const d = it.source || (new URL(it.url).hostname.replace(/^www\./, ''));
      if (d) { small.textContent = ` — ${d}`; small.style.opacity = '0.7'; small.style.fontSize = '12px'; }
    } catch {}
    li.append(a, small);
    ul.appendChild(li);
  }
  wrap.appendChild(ul);
  return wrap;
}

nav?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'about') {
    openAnswerPopup({
      title: 'Über',
      explain: 'Wolf Hohl · TÜV-zertifizierter KI-Manager',
      content: 'hohl.rocks ist eine ruhige, spielerische KI‑Experience. Bubbles öffnen Micro‑Apps, die mit Claude streamen.'
    });
  }

  if (action === 'news') {
    try {
      const j = await fetchNews();
      const node = makeNewsList(j.items || []);
      openCustomPopup({ title: 'News', explain: `Stand: ${j.stand || 'heute'}`, contentNode: node });
    } catch (e2) {
      openAnswerPopup({ title: 'News', content: `Fehler: ${e2?.message || e2}` });
    }
  }

  if (action === 'prompts') {
    try {
      const j = await fetchTopPrompts();
      const text = (j.items || []).map(i => `• ${i.title}\n  ${i.prompt}`).join('\n\n') || 'Keine Prompts.';
      openAnswerPopup({ title: 'Top‑Prompts', explain: `Stand: ${j.stand || '-'}`, content: text });
    } catch (e3) {
      openAnswerPopup({ title: 'Top‑Prompts', content: `Fehler: ${e3?.message || e3}` });
    }
  }

  if (action === 'projects') {
    openAnswerPopup({
      title: 'Projekte',
      content: '• hohl.rocks — persönliche KI‑Experience\n• Jellyfish Motion — organische Interaktion\n• Micro‑Apps — 28 Mini‑Anwendungen'
    });
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
