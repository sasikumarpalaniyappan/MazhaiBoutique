-- Align products RLS policy with AdminGuard logic.
-- AdminGuard allows admin access when either uid OR email matches admins table.

DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Admins can manage products" ON products
  FOR ALL
  USING (
    auth.uid()::text IN (SELECT uid FROM admins)
    OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (SELECT lower(email) FROM admins)
  )
  WITH CHECK (
    auth.uid()::text IN (SELECT uid FROM admins)
    OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (SELECT lower(email) FROM admins)
  );

-- Seed admin access for a known email by mapping to auth.users id.
DO $$
DECLARE
  v_uid text;
BEGIN
  SELECT id::text
  INTO v_uid
  FROM auth.users
  WHERE lower(email) = lower('sasikumar@gmail.com')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_uid IS NOT NULL THEN
    UPDATE admins
    SET uid = v_uid
    WHERE lower(email) = lower('sasikumar@gmail.com');

    IF NOT FOUND THEN
      INSERT INTO admins (uid, email)
      VALUES (v_uid, 'sasikumar@gmail.com')
      ON CONFLICT (uid) DO UPDATE
      SET email = EXCLUDED.email;
    END IF;
  END IF;
END $$;
