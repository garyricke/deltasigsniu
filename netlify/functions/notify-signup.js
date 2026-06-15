// Emails the admin a "new brother signed up" message with a one-tap Approve button.
// Called from the signup form (best-effort). Requires Netlify env vars:
//   RESEND_API_KEY, APPROVE_SECRET, ADMIN_EMAIL, FROM_EMAIL, SITE_URL
const crypto = require('crypto');

function tokenFor(email){
  return crypto.createHmac('sha256', process.env.APPROVE_SECRET)
    .update(email.toLowerCase()).digest('hex').slice(0, 32);
}
async function sendEmail(to, subject, html){
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [to], subject, html })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ': ' + (await r.text()));
}
const esc = s => String(s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
    const b = JSON.parse(event.body || '{}');
    const email = (b.email || '').trim();
    if (!email) return { statusCode: 400, body: 'missing email' };

    const site = process.env.SITE_URL || 'https://deltasigsniu.netlify.app';
    const approveUrl = site + '/.netlify/functions/approve?e=' + encodeURIComponent(email.toLowerCase()) + '&t=' + tokenFor(email);

    const row = (label, val) => val ? `<tr><td style="padding:4px 14px 4px 0;color:#8A938C;font:13px Arial">${label}</td><td style="padding:4px 0;color:#1F2A24;font:14px Arial">${esc(val)}</td></tr>` : '';
    const html = `
    <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#2C5C42;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C9A24B">Delta Sigs NIU</div>
        <div style="font-size:20px;font-weight:bold;margin-top:4px">New brother signed up</div>
      </div>
      <div style="border:1px solid #E6E9E6;border-top:0;border-radius:0 0 14px 14px;padding:22px 24px">
        <table>${row('Name', b.name)}${row('Email', email)}${row('Pledge class', b.pledge_class)}${row('Grad year', b.grad_year)}${row('Phone', b.phone)}${row('Address', b.address)}</table>
        <a href="${approveUrl}" style="display:inline-block;margin:22px 0 6px;background:#C9A24B;color:#3a2f12;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;font-size:15px">✓ Approve &amp; grant access</a>
        <p style="color:#8A938C;font-size:12px;line-height:1.5;margin-top:14px">Tapping Approve grants full access and emails the brother right away. (You can also approve in Supabase → Table Editor → profiles.)</p>
      </div>
    </div>`;

    await sendEmail(process.env.ADMIN_EMAIL, 'New brother signup: ' + (b.name || email), html);
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
