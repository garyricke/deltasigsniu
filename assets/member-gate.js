/* Gates a page so only logged-in Delta Sigs members can view it.
   Requires supabase-config.js loaded first. Add to internal pages:
   <script src="assets/supabase-config.js"></script>
   <script type="module" src="assets/member-gate.js"></script>             */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPA_URL = window.DS_SUPABASE_URL, SUPA_KEY = window.DS_SUPABASE_ANON_KEY;

const css = `
#mg-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(150deg,#1c3b2b,#2C5C42 55%,#13201a);font-family:'Inter',sans-serif;padding:20px}
#mg-box{background:rgba(255,255,255,.06);border:1px solid rgba(201,162,75,.3);backdrop-filter:blur(16px);
  border-radius:20px;padding:46px 38px;width:100%;max-width:400px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.5)}
#mg-box img{width:170px;height:auto;margin:0 auto 22px;display:block}
#mg-box h2{color:#C9A24B;font-family:'Fraunces',serif;font-size:1.5rem;margin:0 0 8px}
#mg-box p{color:rgba(255,255,255,.7);font-size:.9rem;margin:0 0 22px;line-height:1.5}
#mg-box input{width:100%;padding:13px 16px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.2);
  color:#fff;font-size:1rem;outline:none;margin-bottom:12px;font-family:inherit}
#mg-box input:focus{border-color:#C9A24B}
#mg-box button{width:100%;padding:13px;border-radius:12px;border:none;background:#C9A24B;color:#3a2f12;font-weight:700;
  font-size:1rem;cursor:pointer;font-family:inherit}
#mg-box button:hover{filter:brightness(.96)}
#mg-err{color:#f6b6a6;font-size:.8rem;margin-top:10px;min-height:18px}
#mg-box .mg-links{margin-top:18px;font-size:.8rem;color:rgba(255,255,255,.55)}
#mg-box .mg-links a{color:#C9A24B;text-decoration:underline;cursor:pointer}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

const ov = document.createElement('div');
ov.id = 'mg-gate';
ov.innerHTML = `<div id="mg-box">
  <img src="assets/delta-sigs-logo-white.svg" alt="Delta Sigs NIU" onerror="this.style.display='none'">
  <h2>Members Only</h2>
  <p id="mg-msg">You must be a member to view this page. Log in to continue.</p>
  <div id="mg-form">
    <input id="mg-email" type="email" placeholder="Email" autocomplete="email">
    <input id="mg-pass" type="password" placeholder="Password" autocomplete="current-password">
    <button id="mg-btn" type="button">Log in</button>
    <div id="mg-err"></div>
  </div>
  <div class="mg-links"><a href="brent-allen.html">Request access</a> &nbsp;·&nbsp; <a href="index.html">Back to home</a></div>
</div>`;
document.body.appendChild(ov);
document.documentElement.style.overflow = 'hidden';
function reveal(){ ov.remove(); document.documentElement.style.overflow = ''; }

if (!SUPA_URL || !SUPA_KEY || /YOUR-/.test(SUPA_URL) || /YOUR-/.test(SUPA_KEY)) {
  document.getElementById('mg-msg').textContent = 'Member login isn’t configured yet (assets/supabase-config.js).';
  document.getElementById('mg-form').style.display = 'none';
} else {
  const sb = createClient(SUPA_URL, SUPA_KEY);
  const { data:{ session } } = await sb.auth.getSession();
  if (session) {
    reveal();
  } else {
    const emailEl = document.getElementById('mg-email'), passEl = document.getElementById('mg-pass'),
          btn = document.getElementById('mg-btn'), err = document.getElementById('mg-err');
    async function login(){
      const email = emailEl.value.trim(), password = passEl.value;
      if (!email || !password){ err.textContent = 'Enter your email and password.'; return; }
      btn.disabled = true;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      btn.disabled = false;
      if (error){ err.textContent = error.message; return; }
      reveal();
    }
    btn.addEventListener('click', login);
    passEl.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  }
}
