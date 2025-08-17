
(() => {
  const SHELL = '.content-shell'; const LINK='a[data-soft]';
  async function load(url, push=true){
    const res = await fetch(url, {credentials:'same-origin'}); if(!res.ok) return location.href=url;
    const html = await res.text(); const doc = new DOMParser().parseFromString(html,'text/html');
    const next = doc.querySelector(SHELL); if(!next) return location.href=url;
    const shell = document.querySelector(SHELL); if(!shell) return location.href=url;
    shell.classList.add('fade-out'); setTimeout(()=>{ shell.innerHTML = next.innerHTML; shell.classList.remove('fade-out'); shell.classList.add('fade-in'); setTimeout(()=>shell.classList.remove('fade-in'),220); },180);
    if(push) history.pushState({url},'',url);
  }
  addEventListener('click', (e)=>{ const a=e.target.closest(LINK); if(!a || a.target==='_blank') return; e.preventDefault(); load(a.getAttribute('href')); });
  addEventListener('popstate', ()=> load(location.pathname, false));
})();
