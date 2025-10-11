
import { streamClaude } from './claude-stream.js';
import { settings } from './settings.js';
import { t } from './i18n.js';
import { sfx } from './sfx.js';

function renderMarkdown(md){
  // Zero-dependency, safe-ish markdown (headings, bold, italics, lists)
  let html = md || '';
  html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); // sanitize
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // lists
  html = html.replace(/(?:^|\n)- (.*?)(?=\n|$)/g, (m, p1)=>`<li>${p1}</li>`);
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  // paragraphs
  html = html.replace(/(?:^|\n)([^<\n][^\n]*)/g, (m,p)=> p.trim()?`<p>${p}</p>`:m);
  return html;
}

const root = document.getElementById('popup-root');

function makeToolbar(outEl){
  const wrap = document.createElement('div');
  wrap.className = 'actions-left';
  const copyBtn = document.createElement('button'); copyBtn.className='btn btn-secondary'; copyBtn.textContent=t('copy');
  copyBtn.addEventListener('click', ()=>{ const tmp=document.createElement('textarea'); tmp.value = outEl.innerText; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); tmp.remove(); copyBtn.textContent=t('copied'); setTimeout(()=>copyBtn.textContent=t('copy'),1400); });
  const speakBtn = document.createElement('button'); speakBtn.className='btn btn-secondary'; speakBtn.textContent='Vorlesen';
  speakBtn.addEventListener('click', ()=>{ const s = window.speechSynthesis; if(!s) return; const u = new SpeechSynthesisUtterance(outEl.innerText.slice(0,9000)); u.lang = (localStorage.getItem('hohl_lang')==='en')?'en-US':'de-DE'; s.cancel(); s.speak(u); });
  const artBtn = document.createElement('button'); artBtn.className='btn btn-secondary'; artBtn.textContent='Art';
  artBtn.addEventListener('click', ()=>openArt(outEl.innerText));
  wrap.append(copyBtn, speakBtn, artBtn);
  return wrap;
}

function openArt(text){
  const wrap = document.createElement('div'); wrap.className='popup';
  const inner = document.createElement('div'); inner.className='popup-inner';
  const head = document.createElement('div'); head.className='popup-header'; head.innerHTML = '<h3>Minimal Art</h3>';
  const close = document.createElement('button'); close.className='btn btn-secondary'; close.textContent=t('close'); close.addEventListener('click',()=>wrap.remove());
  head.append(close);
  const body = document.createElement('div'); body.className='popup-body';
  const tools = document.createElement('div'); tools.className='art-tools';
  const regen = document.createElement('button'); regen.className='btn btn-secondary'; regen.textContent='Neu generieren';
  const save = document.createElement('button'); save.className='btn btn-primary'; save.textContent='PNG speichern';
  tools.append(regen, save);
  const area = document.createElement('div'); area.className='art-wrap';
  const canvas = document.createElement('canvas'); canvas.className='art-canvas'; area.append(canvas);
  function draw(seed){
    const ctx = canvas.getContext('2d');
    const w = canvas.width = area.clientWidth; const h = canvas.height = 360;
    function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    ctx.fillStyle = '#0b0e13'; ctx.fillRect(0,0,w,h);
    const colors = ['#64ffda','#7ef9ff','#ffb3ff','#ffd166','#a7f432','#ff9bd3','#b388ff'];
    const layers = 24;
    for(let i=0;i<layers;i++){
      const cx = w*rnd(), cy = h*rnd(), r = (40 + rnd()*Math.min(w,h)*0.35);
      const grad = ctx.createRadialGradient(cx, cy, r*0.1, cx, cy, r);
      const c = colors[(i+Math.floor(rnd()*colors.length))%colors.length];
      grad.addColorStop(0, c+'dd'); grad.addColorStop(1, '#00000000');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    }
  }
  let seed = Array.from(text.slice(0,32)).reduce((a,c)=>a+c.charCodeAt(0), 137);
  draw(seed);
  regen.addEventListener('click', ()=>{ seed+=17; draw(seed); });
  save.addEventListener('click', ()=>canvas.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='art.png'; a.click(); }, 'image/png'));
  body.append(tools, area);
  inner.append(head, body, document.createElement('div'));
  wrap.append(inner);
  root.append(wrap);
}

export function openCustomPopup(item){
  sfx.nav();
  const wrap = document.createElement('div'); wrap.className = 'popup'; wrap.role = 'dialog'; wrap.ariaModal = 'true';
  wrap.addEventListener('click', (e)=>{ if (e.target === wrap) wrap.remove(); });
  const inner = document.createElement('div'); inner.className = 'popup-inner';
  const header = document.createElement('div'); header.className = 'popup-header';
  const h3 = document.createElement('h3'); h3.textContent = item.label; header.appendChild(h3);
  const close = document.createElement('button'); close.className = 'btn btn-secondary'; close.textContent = t('close'); close.addEventListener('click', () => wrap.remove()); header.appendChild(close);
  const body = document.createElement('div'); body.className = 'popup-body';
  const help = document.createElement('div'); help.className = 'help'; help.textContent = item.help || ''; body.appendChild(help);
  const ta = document.createElement('textarea'); ta.placeholder = item.placeholder || t('your_input'); ta.value = item.prefill || ''; body.appendChild(ta);
  const out = document.createElement('div'); out.className = 'out prose'; out.innerHTML = ''; body.appendChild(out);
  const toolbar = makeToolbar(out); body.appendChild(toolbar);
  const actions = document.createElement('div'); actions.className = 'popup-actions';
  const ask = document.createElement('button'); ask.className = 'btn btn-primary'; ask.textContent = t('ask');
  ask.addEventListener('click', () => {
    sfx.click();
    out.innerHTML = '';
    const sys = settings.systemPrompt || '';
    const model = settings.model || '';
    const prompt = (item.prompt || '{{input}}').replace('{{input}}', ta.value || '');
    streamClaude({
      prompt, system: sys, model, maxTokens: settings.maxTokens || 1024, temperature: settings.temperature ?? 0.7,
      onToken: (tkn) => { // accumulate text & render as prose
        const prev = out.getAttribute('data-raw') || '';
        const next = prev + tkn;
        out.setAttribute('data-raw', next);
        out.innerHTML = renderMarkdown(next);
        out.scrollTop = out.scrollHeight;
      },
      onDone: () => {},
      onError: (e) => { out.textContent = 'Fehler: ' + (e && e.message ? e.message : String(e)); }
    });
  });
  actions.appendChild(ask);
  inner.append(header, body, actions);
  wrap.append(inner);
  root.append(wrap);
  document.addEventListener('keydown', function onKey(ev){ if(ev.key==='Escape'){ wrap.remove(); document.removeEventListener('keydown', onKey);} });
}
