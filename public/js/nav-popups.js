import { t } from './i18n.js';

async function fetchJson(url){ const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }

function panel(title, html){
  const root = document.getElementById('popup-root');
  const wrap = document.createElement('div'); wrap.className = 'popup';
  const inner = document.createElement('div'); inner.className = 'popup-inner';
  const head = document.createElement('div'); head.className = 'popup-header';
  const h3 = document.createElement('h3'); h3.textContent = title;
  const close = document.createElement('button'); close.className = 'btn btn-secondary'; close.textContent = t('close'); close.addEventListener('click', () => wrap.remove());
  head.append(h3, close);
  const body = document.createElement('div'); body.className = 'popup-body';
  const container = document.createElement('div'); container.innerHTML = html;
  body.append(container);
  inner.append(head, body); wrap.append(inner);
  root.append(wrap);
  return { wrap, body };
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('.nav-btn');
  if (!btn) return;
  const action = btn.getAttribute('data-action');

  if (action === 'about'){
    panel('Über', t('about_html'));
  }
  else if (action === 'news'){
    try{
      const live = await fetchJson('/api/news/live').catch(()=>null);
      const data = live?.items?.length ? live.items : ((await fetchJson('/api/news')).items || []);
      const html = '<ul>' + data.slice(0, 12).map(it => '<li><a href="'+ (it.url || '#') + '" target="_blank" rel="noopener">'+ (it.title || 'News') + '</a></li>').join('') + '</ul>';
      panel(t('news'), html);
    }catch{ panel(t('news'), '<p>Keine News verfügbar.</p>'); }
  }
  else if (action === 'prompts'){
    panel(t('prompts'), '<p>Wähle eine Bubble – sie enthält bereits präzise Prompts mit Micro‑Guide.</p>');
  }
  else if (action === 'projects'){
    panel('Projekte', t('projects_html'));
  }
});
