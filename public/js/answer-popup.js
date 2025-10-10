import { streamClaude } from './claude-stream.js';
import { settings } from './settings.js';
import { t } from './i18n.js';

const root = document.getElementById('popup-root');

export function openCustomPopup(item){
  const wrap = document.createElement('div'); wrap.className = 'popup'; wrap.role = 'dialog'; wrap.ariaModal = 'true';
  const inner = document.createElement('div'); inner.className = 'popup-inner';
  const header = document.createElement('div'); header.className = 'popup-header';

  const h3 = document.createElement('h3'); h3.textContent = item.label; header.appendChild(h3);
  const close = document.createElement('button'); close.className = 'btn btn-secondary'; close.textContent = t('close'); close.addEventListener('click', () => wrap.remove()); header.appendChild(close);

  const body = document.createElement('div'); body.className = 'popup-body';
  const help = document.createElement('div'); help.className = 'help'; help.textContent = item.help || ''; body.appendChild(help);
  const ta = document.createElement('textarea'); ta.placeholder = item.placeholder || t('your_input'); ta.value = item.prefill || ''; body.appendChild(ta);
  const out = document.createElement('div'); out.className = 'out'; out.textContent = ''; body.appendChild(out);

  const actions = document.createElement('div'); actions.className = 'popup-actions';
  const ask = document.createElement('button'); ask.className = 'btn btn-primary'; ask.textContent = t('ask');
  ask.addEventListener('click', () => {
    out.textContent = '';
    const sys = settings.systemPrompt || '';
    const model = settings.model || '';
    const prompt = (item.prompt || '{{input}}').replace('{{input}}', ta.value || '');
    streamClaude({
      prompt, system: sys, model, maxTokens: settings.maxTokens || 1024, temperature: settings.temperature ?? 0.7,
      onToken: (tkn) => { out.textContent += tkn; out.scrollTop = out.scrollHeight; },
      onDone: () => {},
      onError: (e) => { out.textContent = 'Fehler: ' + (e && e.message ? e.message : String(e)); }
    });
  });
  actions.appendChild(ask);

  inner.append(header, body, actions);
  wrap.append(inner);
  root.append(wrap);
}
