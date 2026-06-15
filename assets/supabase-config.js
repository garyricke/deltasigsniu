// Delta Sigs NIU — Supabase config
// Fill these in from your Supabase project: Dashboard → Project Settings → API.
// The anon (public) key is SAFE to expose in client-side code — that's its purpose.
// (Never put the service_role / secret key here.)
window.DS_SUPABASE_URL = 'https://wykfwtqnxttlabbbhhmn.supabase.co';
window.DS_SUPABASE_ANON_KEY = 'sb_publishable_UTlPjwg1O-OvV27WcWC3Tg_FgTzHE0T';

// Cloudinary unsigned upload — powers the brother upload tools on contribute.html.
// Create an UNSIGNED upload preset in Cloudinary (Settings → Upload → Upload presets),
// set "Use filename" = on and "Unique filename" = off, then put its name below.
window.DS_CLOUDINARY_CLOUD = 'dsbllwpbh';
window.DS_CLOUDINARY_UPLOAD_PRESET = 'deltasigs_uploads';
