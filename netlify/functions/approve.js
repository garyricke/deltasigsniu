// Admin taps the Approve link from their email -> set profiles.approved = true and
// email the brother that they have access. Requires Netlify env vars:
//   APPROVE_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, FROM_EMAIL, SITE_URL
const crypto = require('crypto');

function page(title, msg, ok){
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <div style="font-family:Arial,sans-serif;max-width:460px;margin:12vh auto;text-align:center;padding:0 20px">
    <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#489868;font-weight:bold">Delta Sigs NIU</div>
    <div style="font-size:46px;margin:14px 0">${ok ? '&#9989;' : '&#9888;&#65039;'}</div>
    <h1 style="color:#2C5C42;font-size:24px;margin:0 0 8px">${title}</h1>
    <p style="color:#43504a;font-size:15px;line-height:1.6">${msg}</p>
  </div>`;
  return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
}
async function sendEmail(to, subject, html){
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [to], subject, html })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ': ' + (await r.text()));
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const email = (q.e || '').toLowerCase().trim();
  const expected = crypto.createHmac('sha256', process.env.APPROVE_SECRET).update(email).digest('hex').slice(0, 32);
  if (!email || q.t !== expected) return page('Invalid or expired link', 'This approval link isn’t valid. Please approve from Supabase instead.', false);

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wykfwtqnxttlabbbhhmn.supabase.co';
  const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const site = process.env.SITE_URL || 'https://deltasigsniu.com';

  // Flip approved = true (service role bypasses RLS) and get the row back
  const res = await fetch(SUPABASE_URL + '/rest/v1/profiles?email=eq.' + encodeURIComponent(email), {
    method: 'PATCH',
    headers: { apikey: SR, Authorization: 'Bearer ' + SR, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ approved: true })
  });
  if (!res.ok) return page('Something went wrong', 'Could not update the account (' + res.status + '). Try approving in Supabase.', false);
  const rows = await res.json();
  if (!rows.length) return page('Account not found', 'No account matched ' + email + '. They may not have confirmed their email yet.', false);

  const prof = rows[0];
  const first = (prof.full_name || '').split(' ')[0] || 'Brother';
  const html = `
  <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif">
    <div style="background:#2C5C42;color:#fff;padding:22px 24px;border-radius:14px 14px 0 0">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C9A24B">Delta Sigs NIU</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">You’re in, ${first}.</div>
    </div>
    <div style="border:1px solid #E6E9E6;border-top:0;border-radius:0 0 14px 14px;padding:24px">
      <p style="color:#1F2A24;font-size:15px;line-height:1.65;margin:0 0 18px">Your Delta Sigs NIU account is approved — you now have full access to the interviews and audio. Welcome back to the brotherhood.</p>
      <a href="${site}/?welcome=1" style="display:inline-block;background:#489868;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;font-size:15px">Listen now</a>
      <p style="color:#8A938C;font-size:12px;margin-top:18px">Just log in with the email and password you signed up with. Yours in the Bond of the Sphinx.</p>
    </div>
  </div>`;
  try { await sendEmail(email, 'You’re in — Delta Sigs NIU access is ready', html); } catch (e) {}

  return page('Approved &#10003;', (prof.full_name || email) + ' now has full access and has been emailed. You can close this tab.', true);
};
