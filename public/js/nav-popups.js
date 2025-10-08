// public/js/nav-popups.js — Simple overlays for About/News/Prompts/Projects/Sound
import { openAnswerPopup } from './answer-popup.js';
import { fetchNews, fetchTopPrompts } from './claude-stream.js';

const nav = document.getElementById('nav');
const soundBtn = document.getElementById('sound-toggle');

nav?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'about') {
    openAnswerPopup({
      title: 'Über',
      explain: 'Wolf Hohl · TÜV-zertifizierter KI-Manager',
      content: 'hohl.rocks ist eine ruhige, spielerische KI-Experience. Bubbles öffnen Micro‑Apps, die mit Claude streamen.'
    });
  }

  if (action === 'news') {
    try {
      const j = await fetchNews();
      const text = (j.items || []).map(i => `• ${i.title} — ${i.source}\n  ${i.url}`).join('\n\n') || 'Keine News.';
      openAnswerPopup({ title: 'News', explain: `Stand: ${j.stand || '-'}`, content: text });
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
      window.Ambient?.toggle();
      const on = window.Ambient?.isOn();
      soundBtn?.setAttribute('aria-pressed', on ? 'true' : 'false');
    } catch {
      openAnswerPopup({ title: 'Klang', content: 'Audio nicht verfügbar.' });
    }
  }
});
