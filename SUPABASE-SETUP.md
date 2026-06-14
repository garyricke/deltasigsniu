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
