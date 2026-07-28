-- Add Cloudinary identifier columns needed for reliable image lifecycle operations.
-- Existing image URL columns (thumbnail_image, gallery_images) are preserved.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS thumbnail_public_id TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS gallery_image_public_ids TEXT[] DEFAULT '{}';
