// File: public/js/nav-popups.js
import { t } from './i18n.js';
import { Settings } from './settings-store.js';

function panel(title, html){
  const root = document.getElementById('popup-root');
  const wrap = document.createElement('div'); wrap.className = 'popup';
  const inner = document.createElement('div'); inner.className = 'popup-inner';
  const head = document.createElement('div'); head.className = 'popup-header';
  const h3 = document.createElement('h3'); h3.textContent = title;
  const close = document.createElement('button'); close.className = 'btn btn-secondary'; close.textContent = '×'; close.addEventListener('click', () => wrap.remove());
  head.appendChild(h3); head.appendChild(close);
  const body = document.createElement('div'); body.className = 'popup-body';
  const container = document.createElement('div'); container.innerHTML = html;
  body.appendChild(container);
  inner.appendChild(head); inner.appendChild(body);
  wrap.appendChild(inner); root.appendChild(wrap);
  return { wrap, body };
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('.nav-btn');
  if (!btn) return;
  const action = btn.getAttribute('data-action');

  if (action === 'about'){
    panel(t('nav.about'), t('aboutHtml'));
  }
  else if (action === 'prompts'){
    panel(t('nav.prompts'), '<p>Wähle eine Bubble – sie enthält bereits präzise Prompts.</p>');
  }
  else if (action === 'projects'){
    panel(t('nav.projects'), '<p>Kommende Experimente: Visual Lab, Research Agent, Live‑Ticker …</p>');
  }
  else if (action === 'settings'){
    const p = panel('Einstellungen / Settings', `
      <div style="display:grid; gap:12px;">
        <label><strong>Modell</strong><br><select id="modelSel" style="width:100%; padding:8px;"></select></label>
        <label><strong>System‑Prompt</strong><br><textarea id="sysTa" placeholder="Optional…" style="width:100%; min-height:90px;"></textarea></label>
        <div><button id="saveBtn" class="btn btn-primary">Speichern</button></div>
      </div>
    `);
    // Load model list
    try {
      const r = await fetch('/api/models');
      const models = await r.json();
      const sel = p.body.querySelector('#modelSel');
      (Array.isArray(models) ? models : (models.models || [])).forEach(m => {
        const opt = document.createElement('option'); opt.value = m.id || m.name || m; opt.textContent = m.label || m.name || m.id || m;
        sel.appendChild(opt);
      });
      sel.value = Settings.model || '';
    } catch {}
    p.body.querySelector('#sysTa').value = Settings.system || '';
    p.body.querySelector('#saveBtn').addEventListener('click', () => {
      const sel = p.body.querySelector('#modelSel');
      const sys = p.body.querySelector('#sysTa');
      Settings.model = sel.value || '';
      Settings.system = sys.value || '';
      p.wrap.remove();
    });
  }
  else if (action === 'sound'){
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
  }
});
