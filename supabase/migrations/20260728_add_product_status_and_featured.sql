-- Add minimal product metadata fields for admin management.
-- These columns support status control and featured product flags.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Keep data clean and predictable for status.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_status_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_status_check
    CHECK (status IN ('draft', 'active', 'archived'));
  END IF;
END $$;
