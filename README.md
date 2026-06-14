# Delta Sigs NIU

Website for the brothers of **Delta Sigs** (Delta Sigma Phi, Northern Illinois University, est. 1985).
Forty years on, we're recording the brothers' stories and bringing everyone back to the same fire.

## Pages
- `index.html` — public home page (features the founding story, interview teasers, newsletter signup)
- `brent-allen.html` — interview: *"Lightning Struck"* with founder Brent Allen (members only)
- `brand-guide.html` — brand system (colors, type, logo, voice, components)

## How it works
Static HTML/CSS/JS — no build step. Open the files directly, or serve locally:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Members & secure audio
Interview audio is **not** stored in this repo. It lives in a **private Supabase Storage**
bucket and is streamed to logged-in, approved members via short-lived signed URLs.
See [`SUPABASE-SETUP.md`](SUPABASE-SETUP.md). Config (public publishable key only) is in
`assets/supabase-config.js`.

## Newsletter
Email Octopus — drop your form action URL into the signup form in `index.html`
(placeholder: `REPLACE_WITH_EMAILOCTOPUS_FORM_ACTION`).

---
Built by Orbis Design · Yours in the Bonds of Sigma.
