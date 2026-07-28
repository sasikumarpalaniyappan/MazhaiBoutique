-- Supabase Database Schema for Mazhai Boutique
-- Run this SQL in Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Sarees',
  price TEXT NOT NULL,
  original_price TEXT,
  sale_price TEXT,
  thumbnail_image TEXT,
  image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  available_sizes TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create admins table for authentication
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_uid ON admins(uid);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Products are public" ON products FOR SELECT USING (true);

-- Create policy for admin insert/update/delete
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

-- Create policy for admin read access to admins table
CREATE POLICY "Admins can view admins" ON admins FOR SELECT USING (true);
