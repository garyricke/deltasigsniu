# Branded emails + one-tap approval

This gives you:
1. **Branded sign-up emails** — clearly from "Delta Sigs NIU," not "Supabase Auth."
2. **Approve from your phone** — the signup alert has an **Approve** button. Tap it → the brother
   is approved instantly and gets a "you're in" email. No Supabase needed.

It uses **Resend** (free email service) + two serverless functions that are already in the repo
(`netlify/functions/notify-signup.js` and `approve.js`). You just need to connect the accounts.

---

## 1. Resend — dedicated account for deltasigsniu.com
We send as **`gary.ricke@deltasigsniu.com`**. Free tier = 1 verified domain per account, so use a
**separate Resend account** for this domain (the orbisdesign account's slot is used by midwestwaste.app).
1. Sign up for a new Resend account (any inbox you can open; `gary.ricke@deltasigsniu.com` works since it forwards).
2. **Domains → Add Domain → `deltasigsniu.com`** → add the DNS records Resend shows in **Cloudflare**,
   all **DNS only (grey)**. They sit on the `send.` and `resend._domainkey.` subdomains, so they do NOT
   conflict with the existing apex MX/SPF (Cloudflare Email Routing) — leave those alone. Keep your
   existing `_dmarc` record; don't add a duplicate. Wait for **Verified**.
3. **API Keys → Create** in THIS account (must be the account where deltasigsniu.com is verified) → copy `re_…`.
4. From address: **`Delta Sigs NIU <gary.ricke@deltasigsniu.com>`** (replies route to your forwarded inbox).

## 2. Add environment variables in Netlify (~5 min)
Netlify → your site → **Site configuration → Environment variables → Add a variable**. Add each:

| Key | Value |
|---|---|
| `RESEND_API_KEY` | the `re_…` key from Resend |
| `FROM_EMAIL` | `Delta Sigs NIU <gary.ricke@deltasigsniu.com>` |
| `ADMIN_EMAIL` | `gary.ricke@orbisdesign.com` |
| `SITE_URL` | `https://deltasigsniu.netlify.app` |
| `APPROVE_SECRET` | any long random string (e.g. from a password generator) |
| `SUPABASE_URL` | `https://wykfwtqnxttlabbbhhmn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **Secret key** (`sb_secret_…`) — exact steps below |

**Exact steps to get the Supabase secret key:**
1. **supabase.com/dashboard** → open the **deltasigsniu** project.
2. Bottom of the left sidebar → **Project Settings** (gear icon).
3. Under **CONFIGURATION**, click **API Keys**.
4. Stay on the **"Publishable and secret API keys"** tab (NOT "Legacy anon, service_role").
5. Scroll to the **Secret keys** section → row **default** → click the **👁 eye** to reveal, then the **copy** icon.
6. That `sb_secret_…` value is your `SUPABASE_SERVICE_ROLE_KEY`. (In the new key system the *secret key* is the privileged/server key that replaced the old service_role.)

⚠️ This key is powerful — it only ever lives here in Netlify's server env (never in the website code
or the repo). That's safe; it's exactly what server functions are for.

**Fastest way to add all of these:** fill in the two TODO values in `netlifyenvvars.env` (in the
project folder), then in Netlify → Environment variables → **"Add a variable" dropdown → "Import from
a .env file"** → upload that file. Then **Deploys → Trigger deploy** so the functions pick them up.

(The browser/publishable key `sb_publishable_…` is a different key — it's already in
`assets/supabase-config.js`; don't use it here.)

## 3. Brand the confirmation email (Supabase)
**A. The from-name** ("Supabase Auth" → "Delta Sigs NIU") — set up custom SMTP with Resend:
Supabase → **Project Settings → Authentication → SMTP Settings → Enable custom SMTP**:
- Host: `smtp.resend.com`  ·  Port: `465`  ·  Username: `resend`
- Password: your `RESEND_API_KEY`
- Sender name: `Delta Sigs NIU`  ·  Sender email: `gary.ricke@deltasigsniu.com`

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
