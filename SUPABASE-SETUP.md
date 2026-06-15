# Secure member audio with Supabase

This gates the interview audio behind real member accounts. The audio file lives in a
**private** Supabase Storage bucket and is never public. A logged-in, **approved** member
gets a short-lived **signed URL** (expires in 1 hour) to stream it. Non-members get nothing.

**Membership model:** anyone can request an account (sign up), but they can't listen until
an admin flips `approved = true`. That keeps it brothers-only while letting people self-serve.

---

## 1. Create the project
1. Go to https://supabase.com → **New project** (free tier is fine). Pick a name + DB password.
2. When it's ready: **Project Settings → API**. Copy:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (the long one labelled `anon` / `public`)
3. Paste both into **`assets/supabase-config.js`** (replace the `YOUR-...` placeholders).
   The anon key is meant to be public — safe to commit.

## 2. Enable email login
- **Authentication → Providers → Email**: make sure it's **enabled**.
- (Optional, smoother for older alumni) **Authentication → Providers → Email →** turn **off**
  "Confirm email" if you'd rather skip the confirmation step. Leaving it on is more secure.

## 3. Create the private audio bucket + upload
1. **Storage → New bucket** → name it exactly **`interviews`** → leave **Public = OFF** (private).
2. Open the bucket → **Upload file** → upload
   `assets/brent-allen-delta-sigs-interview.mp3`
   (the filename must match `data-audio-path` in `brent-allen.html`).

## 4. Run the SQL (profiles + approval + access policy)
**SQL Editor → New query**, paste and **Run**:

```sql
-- Member profiles, default NOT approved
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  approved boolean not null default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- A member can read their own profile (so the page can check approval)
create policy "read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only APPROVED members may read (i.e. get signed URLs for) files in the 'interviews' bucket
create policy "approved members read interviews"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'interviews'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved)
  );
```

## 5. Approve members
When a brother signs up, approve them:
- **Table Editor → profiles →** find their row → set **`approved` = true** → save.
- (You can also pre-create/confirm/approve people here as the list grows.)

That's it. Reload `brent-allen.html`:
- Not logged in → login / request-access screen.
- Logged in but not approved → "Pending Approval".
- Logged in + approved → audio streams via a fresh signed URL.

---

## Notes
- **Each new interview:** upload its mp3 to the `interviews` bucket and set the new page's
  `data-audio-path` to that filename. Same policy covers all of them.
- **The public teaser** is the opposite — host that one publicly (or on your podcast host); it
  is not gated.
- **Reality check:** an approved member can still save audio they're allowed to hear — no system
  prevents that. This stops *non-members* and keeps URLs from being permanently public, which is
  the right bar.
- **Local testing:** opening the file via `file://` may hit CORS limits on the Supabase calls.
  Serve locally instead, e.g. `python3 -m http.server` then visit `http://localhost:8000/brent-allen.html`.

---

# Update — June 15, 2026

## A. Extra signup fields (run this SQL once)
The signup form now collects full name, pledge class, grad year, phone, and address.
**SQL Editor → New query → Run:**

```sql
alter table public.profiles
  add column if not exists full_name   text,
  add column if not exists pledge_class text,
  add column if not exists grad_year   text,
  add column if not exists phone       text,
  add column if not exists address     text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, pledge_class, grad_year, phone, address)
  values (
    new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'pledge_class',
    new.raw_user_meta_data->>'grad_year',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  ) on conflict (id) do nothing;
  return new;
end; $$;
```

When you approve a brother (Table Editor → profiles → `approved` = true) you'll now see all
their details in the same row.

## B. Email notifications (Netlify Forms) — so you know to act
The site sends a few things to **Netlify Forms**, which can email you. In Netlify:
**Site → Forms → Form notifications → Add notification → Email notification →**
send to **gary.ricke@orbisdesign.com** for each form:
- **member-signup** — a brother created an account (go approve them in Supabase)
- **interview-request** — someone wants to schedule an interview
- **interview-upload** — a brother uploaded an interview recording
- **photo-upload** — a brother uploaded photos

(Netlify auto-detects the forms on the next deploy from the hidden form markup in `index.html`.)

## C. Brother uploads (Cloudinary unsigned preset)
`contribute.html` lets brothers upload interview recordings and photos straight to Cloudinary.
Create an **unsigned** preset:
**Cloudinary → Settings → Upload → Upload presets → Add → Signing mode: Unsigned**,
set **Use filename = on**, **Unique filename = off**, save, then copy the preset name into
`assets/supabase-config.js` (`DS_CLOUDINARY_UPLOAD_PRESET`).
- Interview files land in `deltasigsniu/submissions/interviews/`
- Photos land in `deltasigsniu/submissions/photos/` (filenames preserved, e.g.
  `brent-allen-sailboat-lake-michigan` — that's how the AI knows whose story they belong to).
- You'll get an email (form **interview-upload** / **photo-upload**) with the file link(s);
  process and add to the site when ready.
