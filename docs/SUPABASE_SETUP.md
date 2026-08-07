# Supabase setup for GEC Exchange

## 1. Environment variables

In `.env.local` set (from **Project Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # secret — used only on the server for image uploads
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` is required for listing photo uploads.
> It bypasses Storage RLS on the server after the app has already authenticated the user.
> Never expose this key in client code or commit it to git.

---

## 2. Storage bucket (required for listing photos)

1. Open Supabase → **Storage**
2. **New bucket**
3. Settings:
   - **Name:** `listing-images` (exact spelling)
   - **Public bucket:** **ON** (so marketplace can show images)
4. Create

Uploads from the app use the **service role** and do not depend on insert policies.
Public read still needs a public bucket (or a SELECT policy).

### Optional policies (if you ever upload with the anon key)

Run in **SQL Editor**:

```sql
-- Public read for marketplace
CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Authenticated upload (only needed without service role)
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 3. Free tier storage (50 MB)

Supabase free projects get ~**50 MB** file storage.

This app compresses listing photos to **WebP** (~max 1280px, quality ~78) before upload so each image is typically **50–200 KB** instead of multi‑MB camera photos.

Rough capacity after compression: **hundreds of listing photos** on free tier.

If you outgrow free storage: upgrade Supabase or move images to Cloudflare R2 / Cloudinary.

---

## 4. Google OAuth

1. **Authentication → Providers → Google** → enable  
2. **URL configuration**
   - Site URL: `http://localhost:3000`
   - Redirect: `http://localhost:3000/auth/callback`

---

## 5. Database

```bash
npm run db:push
npm run db:seed   # optional
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `row-level security policy` | Set real `SUPABASE_SERVICE_ROLE_KEY` and restart `npm run dev` |
| `Bucket not found` | Create public bucket `listing-images` |
| Images not showing | Bucket must be **public**; restart Next after changing `NEXT_PUBLIC_SUPABASE_URL` |
| Placeholder keys | Replace all values in `.env.local` with real project keys |
