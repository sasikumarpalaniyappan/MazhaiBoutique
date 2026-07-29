-- Create a table for editable homepage hero image settings.
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  hero_image_alts TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  hero_image_url TEXT NOT NULL DEFAULT '',
  hero_image_alt TEXT NOT NULL DEFAULT 'Hero image',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hero_settings
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to hero settings"
  ON hero_settings
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow admin write access to hero settings"
  ON hero_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow admin update access to hero settings"
  ON hero_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
