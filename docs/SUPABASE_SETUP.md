# Supabase setup for GEC Exchange

## 1. Storage bucket (required for listing photos)

1. Open your Supabase project → **Storage**
2. Click **New bucket**
3. Settings:
   - **Name:** `listing-images` (must match exactly)
   - **Public bucket:** **ON** (marketplace images are public URLs)
4. Create the bucket

### Upload policy (recommended)

Under **Storage → listing-images → Policies**, add:

**Allow authenticated uploads**

```sql
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');
```

**Allow public read**

```sql
CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');
```

**Allow users to update/delete their own folder** (optional)

```sql
CREATE POLICY "Users manage own listing images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 2. Google OAuth

1. **Authentication → Providers → Google** → enable
2. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 3. Database

```bash
npm run db:push
# optional:
npm run db:seed
```
