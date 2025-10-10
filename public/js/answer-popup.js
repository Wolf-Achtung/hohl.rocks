// File: public/js/answer-popup.js
import { streamClaude } from './claude-stream.js';

const root = document.getElementById('popup-root');

export function openCustomPopup(item){
  const wrap = document.createElement('div');
  wrap.className = 'popup';
  wrap.role = 'dialog';
  wrap.ariaModal = 'true';

  const inner = document.createElement('div');
  inner.className = 'popup-inner';

  const header = document.createElement('div');
  header.className = 'popup-header';

  const h3 = document.createElement('h3');
  h3.textContent = item.label || 'Prompt';
  header.appendChild(h3);

  const close = document.createElement('button');
  close.className = 'btn btn-secondary';
  close.textContent = 'Schließen';
  close.addEventListener('click', () => wrap.remove());
  header.appendChild(close);

  const body = document.createElement('div');
  body.className = 'popup-body';

  const help = document.createElement('div');
  help.className = 'help';
  help.textContent = item.help || '';
  body.appendChild(help);

  const ta = document.createElement('textarea');
  ta.placeholder = item.placeholder || 'Dein Input…';
  ta.value = item.prefill || '';
  body.appendChild(ta);

  const out = document.createElement('div');
  out.className = 'out';
  out.textContent = '';
  body.appendChild(out);

  const actions = document.createElement('div');
  actions.className = 'popup-actions';

  const ask = document.createElement('button');
  ask.className = 'btn btn-primary';
  ask.textContent = 'Fragen';
  ask.addEventListener('click', () => {
    out.textContent = '';
    const p = (item.prompt || '{{input}}').replace('{{input}}', ta.value || '');
    streamClaude({
      prompt: p,
      onToken: (t) => { out.textContent += t; out.scrollTop = out.scrollHeight; },
      onDone: () => {},
      onError: (e) => { out.textContent = 'Fehler: ' + (e?.message || e); }
    });
  });
  actions.appendChild(ask);

  inner.appendChild(header);
  inner.appendChild(body);
  inner.appendChild(actions);

  wrap.appendChild(inner);
  root.appendChild(wrap);
}
