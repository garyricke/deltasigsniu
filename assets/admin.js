/* Delta Sigs NIU — shared admin entry (badge → password modal → slide-in panel).
   Include on any page with: <script src="assets/admin.js"></script> before </body>.
   Client-side deterrent only (not real security). Password: yitbos · key: ds_admin */
(function(){
  if (document.getElementById('adm')) return;            // avoid double-inject
  var KEY='ds_admin', PASS='yitbos';
  var LOGO='assets/delta-sigs-logo-white.svg';

  var css = ''+
  ':root{--adm-accent:#C9A24B;--adm-accent-hover:#d8b568;--adm-ink:#f3ece0;'+
  '--adm-panel-bg:linear-gradient(165deg,#2C5C42 0%,#234734 45%,#13201a 100%);'+
  '--adm-modal-bg:rgba(19,32,26,.96);--adm-modal-ink:#3a2f12;'+
  "--adm-font-display:'Fraunces',Georgia,serif;--adm-font-body:'Inter',sans-serif;}"+
  '#adm{position:fixed;bottom:24px;right:24px;z-index:900;font-family:var(--adm-font-display)}'+
  '#adm-btn{width:32px;height:32px;border-radius:50%;border:1px solid color-mix(in srgb,var(--adm-accent) 35%,transparent);background:rgba(19,32,26,.4);color:color-mix(in srgb,var(--adm-accent) 55%,transparent);font-size:.95rem;cursor:pointer;opacity:.35;padding:0;line-height:1;display:flex;align-items:center;justify-content:center;transition:opacity .25s,color .25s,border-color .25s,background .25s}'+
  '#adm-btn:hover,#adm-btn:focus-visible,#adm[aria-expanded="true"] #adm-btn{opacity:1;color:var(--adm-accent);border-color:var(--adm-accent);background:rgba(19,32,26,.9);outline:none}'+
  '#adm-lock{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(13,20,16,.72);backdrop-filter:blur(6px);font-family:var(--adm-font-body);animation:admFade .2s ease-out}'+
  '#adm-lock[hidden]{display:none}'+
  '#adm-lock-box{position:relative;background:var(--adm-modal-bg);border:1px solid color-mix(in srgb,var(--adm-accent) 30%,transparent);border-radius:16px;padding:40px 36px;width:min(380px,90vw);text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.55)}'+
  '#adm-lock-box img{height:44px;margin:0 auto 20px;display:block}'+
  '#adm-lock-box h2{font-family:var(--adm-font-display);font-size:1.7rem;color:var(--adm-accent);letter-spacing:.04em;margin:0 0 6px}'+
  '#adm-lock-box .adm-lock-sub{font-size:.82rem;color:color-mix(in srgb,var(--adm-ink) 55%,transparent);margin:0 0 24px}'+
  '#adm-lock-input{width:100%;padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid color-mix(in srgb,var(--adm-accent) 30%,transparent);border-radius:8px;color:#fff;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .2s}'+
  '#adm-lock-input:focus{border-color:var(--adm-accent)}'+
  '#adm-lock-btn{margin-top:14px;width:100%;padding:12px;background:var(--adm-accent);color:var(--adm-modal-ink);border:0;border-radius:8px;font-family:var(--adm-font-display);font-size:1.05rem;letter-spacing:.04em;cursor:pointer;transition:background .2s}'+
  '#adm-lock-btn:hover{background:var(--adm-accent-hover)}'+
  '#adm-lock-error{font-size:.78rem;color:#ff7a7a;margin:12px 0 0;min-height:1.1em}'+
  '.adm-shake{animation:admShake .35s}'+
  '@keyframes admShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}'+
  '@keyframes admFade{from{opacity:0}to{opacity:1}}'+
  '#adm-scrim{position:fixed;inset:0;z-index:1100;background:rgba(13,20,16,.55);backdrop-filter:blur(2px);animation:admFade .25s ease-out}'+
  '#adm-scrim[hidden]{display:none}'+
  '#adm-panel{position:fixed;top:0;right:0;z-index:1110;width:min(340px,88vw);height:100%;background:var(--adm-panel-bg);border-left:1px solid color-mix(in srgb,var(--adm-accent) 30%,transparent);box-shadow:-24px 0 70px rgba(0,0,0,.5);transform:translateX(100%);transition:transform .34s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:var(--adm-font-body)}'+
  '#adm-panel.open{transform:translateX(0)}'+
  '.adm-panel-head{display:flex;align-items:flex-end;justify-content:space-between;padding:26px 24px 18px;border-bottom:1px solid color-mix(in srgb,var(--adm-accent) 18%,transparent)}'+
  '.adm-eyebrow{display:block;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:color-mix(in srgb,var(--adm-accent) 85%,transparent);margin-bottom:4px}'+
  '.adm-panel-brand h3{font-family:var(--adm-font-display);font-size:1.6rem;color:#fff;letter-spacing:.02em;margin:0;line-height:1}'+
  '#adm-panel-close{background:transparent;border:0;cursor:pointer;color:color-mix(in srgb,var(--adm-ink) 60%,transparent);width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:color .15s,background .15s}'+
  '#adm-panel-close svg{width:20px;height:20px}'+
  '#adm-panel-close:hover{color:var(--adm-accent);background:color-mix(in srgb,var(--adm-accent) 12%,transparent)}'+
  '.adm-links{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:4px}'+
  '.adm-links a{display:flex;align-items:flex-start;gap:13px;padding:13px 14px;border-radius:10px;text-decoration:none;color:var(--adm-ink);border:1px solid transparent;transition:background .15s,border-color .15s,transform .15s}'+
  '.adm-links a:hover{background:color-mix(in srgb,var(--adm-accent) 10%,transparent);border-color:color-mix(in srgb,var(--adm-accent) 28%,transparent);transform:translateX(-2px)}'+
  '.adm-ic{flex:none;width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--adm-accent) 14%,transparent);color:var(--adm-accent);border:1px solid color-mix(in srgb,var(--adm-accent) 22%,transparent)}'+
  '.adm-ic svg{width:20px;height:20px}'+
  '.adm-links a:hover .adm-ic{background:color-mix(in srgb,var(--adm-accent) 22%,transparent)}'+
  '.adm-txt{display:flex;flex-direction:column;gap:2px;padding-top:1px}'+
  '.adm-txt b{font-weight:600;font-size:.92rem;color:#fff}'+
  '.adm-txt small{font-size:.72rem;line-height:1.4;color:color-mix(in srgb,var(--adm-ink) 62%,transparent);font-weight:400}'+
  '.adm-panel-foot{padding:14px 18px 20px;border-top:1px solid rgba(255,255,255,.08)}'+
  '#adm-lock-out{display:flex;align-items:center;gap:9px;width:100%;padding:11px 14px;background:transparent;border:1px solid rgba(255,255,255,.14);border-radius:9px;color:color-mix(in srgb,var(--adm-ink) 60%,transparent);font-family:var(--adm-font-body);font-size:.8rem;cursor:pointer;transition:color .15s,border-color .15s,background .15s}'+
  '#adm-lock-out svg{width:16px;height:16px}'+
  '#adm-lock-out:hover{color:var(--adm-accent);border-color:color-mix(in srgb,var(--adm-accent) 40%,transparent);background:color-mix(in srgb,var(--adm-accent) 8%,transparent)}'+
  '@media (prefers-reduced-motion:reduce){#adm-panel{transition:none}#adm-lock,#adm-scrim{animation:none}.adm-shake{animation:none}}';

  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var iconStatus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2 5 4-14 2 7h6"/></svg>';
  var iconBrand='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="7" cy="6" r="2.5"/><path d="M5 21c0-5 3-8 7-8 2 0 3 1 3 2.5S15 18 13 18"/></svg>';

  var html=''+
  '<div id="adm"><button id="adm-btn" type="button" aria-label="Admin access" aria-haspopup="dialog" aria-expanded="false">A</button></div>'+
  '<div id="adm-lock" hidden><div id="adm-lock-box" role="dialog" aria-modal="true" aria-labelledby="adm-lock-title">'+
  '<img src="'+LOGO+'" alt="Delta Sigs NIU" onerror="this.style.display=\'none\'">'+
  '<h2 id="adm-lock-title">Admin Access</h2><p class="adm-lock-sub">Internal area · enter the password to continue.</p>'+
  '<input id="adm-lock-input" type="password" placeholder="Enter password" autocomplete="current-password">'+
  '<button id="adm-lock-btn" type="button">Enter</button><p id="adm-lock-error" role="alert"></p></div></div>'+
  '<div id="adm-scrim" hidden></div>'+
  '<aside id="adm-panel" role="dialog" aria-modal="true" aria-label="Admin links" aria-hidden="true">'+
  '<div class="adm-panel-head"><div class="adm-panel-brand"><span class="adm-eyebrow">Delta Sigs NIU</span><h3>Admin</h3></div>'+
  '<button id="adm-panel-close" type="button" aria-label="Close admin panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
  '<nav class="adm-links">'+
  '<a href="status.html"><span class="adm-ic">'+iconStatus+'</span><span class="adm-txt"><b>Status &amp; Changelog</b><small>Dated build log of everything shipped</small></span></a>'+
  '<a href="brand-guide.html"><span class="adm-ic">'+iconBrand+'</span><span class="adm-txt"><b>Brand Guide</b><small>Colors, type, logo, voice &amp; components</small></span></a>'+
  '</nav>'+
  '<div class="adm-panel-foot"><button id="adm-lock-out" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg> Lock &amp; sign out</button></div>'+
  '</aside>';

  var wrap=document.createElement('div'); wrap.innerHTML=html;
  while(wrap.firstChild) document.body.appendChild(wrap.firstChild);

  var btn=document.getElementById('adm-btn'),lock=document.getElementById('adm-lock'),
      lockInput=document.getElementById('adm-lock-input'),lockBtn=document.getElementById('adm-lock-btn'),
      lockBox=document.getElementById('adm-lock-box'),lockErr=document.getElementById('adm-lock-error'),
      panel=document.getElementById('adm-panel'),scrim=document.getElementById('adm-scrim'),
      panelClose=document.getElementById('adm-panel-close'),signOut=document.getElementById('adm-lock-out');
  function authed(){try{return sessionStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function openPanel(){scrim.hidden=false;panel.classList.add('open');panel.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';}
  function closePanel(){panel.classList.remove('open');scrim.hidden=true;panel.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');document.body.style.overflow='';}
  function openLock(){lock.hidden=false;lockErr.textContent='';lockInput.value='';setTimeout(function(){lockInput.focus();},30);}
  function closeLock(){lock.hidden=true;}
  function tryPass(){if(lockInput.value===PASS){try{sessionStorage.setItem(KEY,'1');}catch(e){}closeLock();openPanel();}else{lockErr.textContent='Incorrect password. Try again.';lockBox.classList.remove('adm-shake');void lockBox.offsetWidth;lockBox.classList.add('adm-shake');lockInput.select();}}
  btn.addEventListener('click',function(e){e.stopPropagation();if(authed())openPanel();else openLock();});
  lockBtn.addEventListener('click',tryPass);
  lockInput.addEventListener('keydown',function(e){if(e.key==='Enter')tryPass();});
  panelClose.addEventListener('click',closePanel);
  scrim.addEventListener('click',closePanel);
  signOut.addEventListener('click',function(){try{sessionStorage.removeItem(KEY);}catch(e){}closePanel();});
  lock.addEventListener('click',function(e){if(e.target===lock)closeLock();});
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!lock.hidden)closeLock();else if(panel.classList.contains('open'))closePanel();});
})();
