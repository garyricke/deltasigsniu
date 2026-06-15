# Branded emails + one-tap approval

This gives you:
1. **Branded sign-up emails** — clearly from "Delta Sigs NIU," not "Supabase Auth."
2. **Approve from your phone** — the signup alert has an **Approve** button. Tap it → the brother
   is approved instantly and gets a "you're in" email. No Supabase needed.

It uses **Resend** (free email service) + two serverless functions that are already in the repo
(`netlify/functions/notify-signup.js` and `approve.js`). You just need to connect the accounts.

---

## 1. Resend — reuse your existing account + verified domain
You already have Resend (org: orbisdesign) with **`midwestwaste.app` verified**. Reuse it — no new
account, no upgrade needed (free tier = 1 domain, and the sending domain need not match the site).
1. **API Keys → Create API Key** → name it `deltasigs` → copy it (starts with `re_…`).
2. Your "from" address rides on the verified domain, e.g. **`Delta Sigs NIU <noreply@midwestwaste.app>`**
   (you don't need to create that mailbox — Resend just needs the domain verified). Recipients see the
   "Delta Sigs NIU" name in their inbox.
   - (If you later want the address itself on `orbisdesign.com`, add + verify that domain — that's a paid plan.)

## 2. Add environment variables in Netlify (~5 min)
Netlify → your site → **Site configuration → Environment variables → Add a variable**. Add each:

| Key | Value |
|---|---|
| `RESEND_API_KEY` | the `re_…` key from Resend |
| `FROM_EMAIL` | `Delta Sigs NIU <noreply@midwestwaste.app>` (your verified Resend domain) |
| `ADMIN_EMAIL` | `gary.ricke@orbisdesign.com` |
| `SITE_URL` | `https://deltasigsniu.netlify.app` |
| `APPROVE_SECRET` | any long random string (e.g. from a password generator) |
| `SUPABASE_URL` | `https://wykfwtqnxttlabbbhhmn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret key |

⚠️ The **service_role** key is powerful — it only ever lives here in Netlify's server env (never in
the website code or the repo). That's safe; it's exactly what server functions are for.

Then **Deploys → Trigger deploy** so the functions pick up the new variables.

## 3. Brand the confirmation email (Supabase)
**A. The from-name** ("Supabase Auth" → "Delta Sigs NIU") — set up custom SMTP with Resend:
Supabase → **Project Settings → Authentication → SMTP Settings → Enable custom SMTP**:
- Host: `smtp.resend.com`  ·  Port: `465`  ·  Username: `resend`
- Password: your `RESEND_API_KEY`
- Sender name: `Delta Sigs NIU`  ·  Sender email: `noreply@midwestwaste.app` (your verified domain)

**B. The wording** — Supabase → **Authentication → Email Templates → Confirm signup**.
Set the **Subject** to:
```
Confirm your Delta Sigs NIU account
```
And replace the message body with:
```html
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
  <div style="background:#2C5C42;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
    <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C9A24B">Delta Sigs NIU · Est. 1985</div>
    <div style="font-size:20px;font-weight:bold;margin-top:4px">Confirm your email</div>
  </div>
  <div style="border:1px solid #E6E9E6;border-top:0;border-radius:0 0 14px 14px;padding:24px">
    <p style="color:#1F2A24;font-size:15px;line-height:1.6">Welcome, brother. Tap below to confirm your email and finish creating your Delta Sigs NIU account.</p>
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#489868;color:#fff;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:999px;font-size:15px;margin:8px 0">Confirm my email</a>
    <p style="color:#8A938C;font-size:13px;line-height:1.6;margin-top:16px">After you confirm, we’ll review your account and email you again — usually within 10–60 minutes — once you have full access.</p>
  </div>
</div>
```

## How it flows once set up
1. Brother signs up → gets the **branded confirmation email** → confirms → sees the on-site
   "Thanks — you're confirmed, access in 10–60 min" message.
2. You get a **"New brother signup"** email with their details and a big **Approve** button.
3. You tap **Approve** (works on your phone) → they're marked approved → they get a branded
   **"You're in"** email with a Listen link. Done — no Supabase visit needed.

## Notes
- Until Resend is connected, you still get the basic **Netlify Forms** signup email (fallback), and
  you can approve in Supabase → Table Editor as before. Once Resend works, you can turn off the
  Netlify "member-signup" notification to avoid a duplicate.
- The Approve link is signed (HMAC) so only your emailed link works.
