/* public/js/answer-popup.js
 * Minimalistisches Answer-Popup mit Explain-Zeile unter dem Titel.
 * -> window.openAnswerPopup(content, asHTML=false, heading='Ergebnis', { explain })
 *    heading & explain optional. Copy/Close enthalten.
 */
(function () {
  'use strict';

  function styleBtn(b) {
    Object.assign(b.style, {
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,.18)',
      padding: '8px 12px',
      cursor: 'pointer',
      background: 'rgba(255,255,255,.08)',
      color: '#eaf2ff',
      fontWeight: 700
    });
  }

  function ensure() {
    let p = document.getElementById('answer-popup');
    if (p) return p;

    p = document.createElement('div');
    p.id = 'answer-popup';
    Object.assign(p.style, {
      position: 'fixed',
      left: '50%',
      top: '9%',
      transform: 'translateX(-50%)',
      width: 'min(960px, 92vw)',
      maxHeight: '78vh',
      overflow: 'hidden',
      background: 'rgba(12,16,22,.46)',
      border: '1px solid rgba(255,255,255,.14)',
      backdropFilter: 'blur(12px)',
      borderRadius: '18px',
      padding: '14px',
      zIndex: 1400,
      color: '#eaf2ff',
      display: 'none',
      boxShadow: '0 18px 60px rgba(0,0,0,.35)'
    });

    const head = document.createElement('div');
    Object.assign(head.style, {
      display: 'flex',
      gap: '8px',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '2px 4px 8px 4px'
    });

    const left = document.createElement('div');
    left.className = 'popup-head-left';
    const title = document.createElement('div');
    title.className = 'popup-title';
    Object.assign(title.style, {
      fontWeight: '800',
      letterSpacing: '.2px',
      fontSize: '18px'
    });
    left.appendChild(title);

    const tools = document.createElement('div');
    tools.style.display = 'flex';
    tools.style.gap = '8px';
    const copy = document.createElement('button'); copy.textContent = 'Kopieren'; styleBtn(copy);
    const close = document.createElement('button'); close.textContent = 'Schließen'; styleBtn(close);
    tools.appendChild(copy); tools.appendChild(close);

    head.appendChild(left);
    head.appendChild(tools);

    const body = document.createElement('div');
    body.className = 'popup-body';
    Object.assign(body.style, {
      whiteSpace: 'pre-wrap',
      maxHeight: '62vh',
      overflow: 'auto',
      lineHeight: '1.55',
      fontSize: '15.5px'
    });

    const bar = document.createElement('div');
    bar.className = 'popup-progress';
    Object.assign(bar.style, { height: '6px', background: 'rgba(255,255,255,.14)', borderRadius: '6px', marginTop: '8px' });
    const fill = document.createElement('div');
    Object.assign(fill.style, { height: '100%', width: '0%', background: '#00e1ff', borderRadius: '6px', transition: 'width .12s ease' });
    bar.appendChild(fill);

    p.appendChild(head);
    p.appendChild(body);
    p.appendChild(bar);
    document.body.appendChild(p);

    copy.onclick = () => {
      const t = body.innerText || '';
      navigator.clipboard.writeText(t).then(() => {
        copy.textContent = 'Kopiert!';
        setTimeout(() => (copy.textContent = 'Kopieren'), 1200);
      });
    };
    close.onclick = () => { p.style.display = 'none'; };

    p._els = { head, left, title, body, bar, fill };
    return p;
  }

  // Öffentliche API
  window.openAnswerPopup = function (content, asHTML = false, heading = 'Ergebnis', options = {}) {
    const p = ensure();
    const { left, title, body, fill } = p._els;

    // Titel + Explain
    title.textContent = heading || 'Ergebnis';
    const old = left.querySelector('.explain'); if (old) old.remove();
    if (options && options.explain) {
      const ex = document.createElement('p');
      ex.className = 'explain';
      Object.assign(ex.style, { margin: '6px 0 2px', fontSize: '13.5px', lineHeight: '1.35', opacity: '.92' });
      ex.textContent = options.explain;
      left.appendChild(ex);
    }

    // Inhalt
    if (asHTML) body.innerHTML = content; else body.textContent = content;

    // Progress zurücksetzen (falls Streaming)
    fill.style.width = '0%';

    p.style.display = 'block';
    return p;
  };

  // Fortschritt (optional fürs Streaming)
  window.setAnswerPopupProgress = function (ratio01) {
    const p = document.getElementById('answer-popup'); if (!p || !p._els) return;
    const { fill } = p._els;
    const clamped = Math.max(0, Math.min(1, Number(ratio01 || 0)));
    fill.style.width = (clamped * 100).toFixed(1) + '%';
  };

  // Für andere Module
  window._ensureAnswerPopup = ensure;
})();
