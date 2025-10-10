// File: public/js/answer-popup.js
// Popup UI + streaming glue. Accessible, concise error display.

import { streamClaude } from './claude-stream.js';

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(props)) {
    if (k === 'className') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== undefined && v !== null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function openAnswerPopup({ title = 'Antwort', content = '' } = {}) {
  const overlay = h('div', { className: 'popup', role: 'dialog', 'aria-modal': 'true' });
  const inner = h('div', { className: 'popup-inner' });
  const head = h('div', { className: 'popup-title' }, title);
  const body = h('div', { className: 'popup-body' });
  const pre  = h('pre', { style: 'white-space: pre-wrap; margin:0; font: 500 14px/1.5 var(--ui-font);' }, content);
  body.appendChild(pre);

  const actions = h('div', { className: 'popup-actions' });
  const btnCopy = h('button', { className: 'btn', onClick: () => navigator.clipboard?.writeText(pre.textContent) }, 'Kopieren');
  const btnOk = h('button', { className: 'btn btn-primary', onClick: close }, 'Schließen');
  actions.append(btnCopy, btnOk);

  inner.append(head, body, actions);
  overlay.appendChild(inner);
  document.body.appendChild(overlay);

  function close(){ overlay.remove(); }
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  setTimeout(()=> btnOk.focus(), 0);
  return { overlay, body, pre, ok: btnOk };
}

export function openCustomPopup({ title, explain, placeholder = '', help = '' } = {}) {
  const overlay = h('div', { className: 'popup', role: 'dialog', 'aria-modal':'true' });
  const inner = h('div', { className: 'popup-inner' });
  const head = h('div', { className: 'popup-title' }, title || 'Input');
  const expl = h('div', { className: 'popup-explain' }, explain || '');
  const helpBox = help ? h('div', { className: 'popup-help' }, help) : null;

  const body = h('div', { className: 'popup-body' });
  const ta = h('textarea', { rows: 4, style: 'width:100%; border-radius:10px; padding:10px; font: 500 14px var(--ui-font);', placeholder });
  const out = h('pre', { style: 'margin-top:10px; white-space: pre-wrap; min-height: 80px; font: 500 14px/1.5 var(--ui-font);' });

  body.append(ta);
  if (helpBox) body.append(helpBox);
  body.append(out);

  const actions = h('div', { className: 'popup-actions' });
  const btnSend = h('button', { className: 'btn btn-primary' }, 'Senden');
  const btnCopy = h('button', { className: 'btn' }, 'Kopieren');
  const btnCancel = h('button', { className: 'btn' }, 'Abbrechen');
  actions.append(btnSend, btnCopy, btnCancel);

  inner.append(head, expl, body, actions);
  overlay.appendChild(inner);
  document.body.appendChild(overlay);

  function close(){ overlay.remove(); }
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  setTimeout(()=> ta.focus(), 0);

  btnCopy.addEventListener('click', () => navigator.clipboard?.writeText(out.textContent || ta.value || ''), { once:false });
  btnCancel.addEventListener('click', close);

  const doSend = ({ prompt, system = '', model = '', thread = '' } = {}) => {
    out.textContent = '';
    const append = (t) => { out.textContent += t; };
    const fail = (msg) => { out.textContent = `[Fehler] ${msg}`; };

    streamClaude(
      { prompt: prompt ?? ta.value, system, model, thread },
      { onToken: append, onDone: () => {}, onError: fail }
    );
  };

  btnSend.addEventListener('click', () => doSend({}), { once:false });

  return { overlay, body, out, input: ta, ok: btnSend, cpy: btnCopy, cancel: btnCancel, send: doSend };
}
