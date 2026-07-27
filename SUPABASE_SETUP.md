# Supabase Storage Setup Guide

## Create Storage Bucket for Product Images

1. Go to **Supabase Dashboard** → Your Project
2. Click **Storage** in the left sidebar
3. Click **Create a new bucket**
4. **Bucket name:** `product-images`
5. **Public bucket:** Toggle it ON (allows public access to images)
6. Click **Create bucket**

## Configure Storage Policies (Optional but Recommended)

Go to **Storage** → **product-images** → **Policies** tab

### For Public Read Access:
- Create a policy:
  - **Policy name:** Public read access
  - **Allowed operations:** SELECT
  - **Target roles:** anon, authenticated
  - **Condition:** (leave empty or use `true`)

### For Admin Write Access:
- Create a policy:
  - **Policy name:** Admin write access  
  - **Allowed operations:** INSERT, UPDATE, DELETE
  - **Target roles:** authenticated
  - **Condition:** `auth.uid()::text IN (SELECT uid FROM admins)`

## Testing

After setting up the bucket:

1. Go to your admin dashboard at `/admin`
2. Try adding a new product with an image
3. The image should upload to Supabase Storage

## Environment Variables

Your `.env.local` already has the required Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Migration Complete! ✅

Your app has been successfully migrated from Firebase to Supabase:
- ✅ Database: Firestore → PostgreSQL (products table)
- ✅ Authentication: Firebase Auth → Supabase Auth (ready for future integration)
- ✅ Storage: Firebase Storage → Supabase Storage
- ✅ Admin: Firebase Auth Guard → Supabase Auth Check (admins table)

## Next Steps

1. **Add Admin User**: Insert a record into the `admins` table:
   ```sql
   INSERT INTO admins (uid, email) VALUES ('your-user-id', 'your@email.com');
   ```

2. **Migrate Existing Data** (if you have Firebase data):
   - Export your Firebase Firestore products
   - Transform field names (camelCase → snake_case)
   - Import into Supabase PostgreSQL

3. **Deploy**: The app is ready to deploy to Netlify or Vercel!

## Troubleshooting

- **Storage bucket error**: Make sure the bucket is named exactly `product-images`
- **Upload fails**: Check that the bucket is set to public
- **Images not showing**: Verify the bucket has a public policy allowing SELECT
- **Admin can't access**: Ensure the admin user exists in the `admins` table

## Useful SQL Commands

Check products count:
```sql
SELECT COUNT(*) FROM products;
```

Check admins:
```sql
SELECT * FROM admins;
```

Add an admin (replace with real values):
```sql
INSERT INTO admins (uid, email) VALUES ('user-uuid', 'admin@example.com');
```

View all storage files:
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'product-images';
```
