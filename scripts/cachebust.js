// scripts/cachebust.js — Variante A (CommonJS)
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const INDEX = process.argv[2] || path.join(process.cwd(), 'index.html');
const WEBROOT = process.argv[3] || path.dirname(INDEX);
const EXT_OK = new Set(['.js','.css','.svg','.png','.jpg','.jpeg','.webp','.gif','.mp4','.webm']);
const ATTR_RE = /(src|href)=["']([^"'?#]+)(\?[^"']*)?["']/g;
function hashFile(abs){ if(!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex').slice(0,10); }
function withV(url, h){ const [base,q='']=url.split('?'); if(!h) return url; const p=new URLSearchParams(q); p.delete('v'); p.append('v',h); const qs=p.toString(); return qs?`${base}?${qs}`:`${base}?v=${h}`; }
function resolve(absUrl, idx, root){ return absUrl.startsWith('/') ? path.join(root, absUrl) : path.resolve(path.dirname(idx), absUrl); }
(function(){
  if(!fs.existsSync(INDEX)){ console.error('index.html nicht gefunden:', INDEX); process.exit(1); }
  let html = fs.readFileSync(INDEX,'utf8'); let changed=false;
  html = html.replace(ATTR_RE,(m,attr,url,q='')=>{ const ext=path.extname(url).toLowerCase(); if(!EXT_OK.has(ext)) return m;
    const abs=resolve(url,INDEX,WEBROOT); const h=hashFile(abs); if(!h){ console.warn('[cachebust] Datei fehlt:',url); return m; }
    const newUrl = withV(url+(q||''),h); if(newUrl!==url+(q||'')) changed=true; return `${attr}="${newUrl}"`; });
  if(changed){ fs.writeFileSync(INDEX,html,'utf8'); console.log('[cachebust] OK:',INDEX); } else { console.log('[cachebust] Keine Änderungen:',INDEX); }
})();