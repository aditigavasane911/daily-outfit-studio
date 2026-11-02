-- ==========================================================
-- Rewear Radar / Daily Outfit Studio — PostgreSQL Database Schema
-- Compatible with standard PostgreSQL (local, Neon, Supabase, Railway, AWS RDS, etc.)
-- ==========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  sizes TEXT DEFAULT '',
  favorite_colors TEXT[] DEFAULT ARRAY['Midnight Spruce', 'Earthy Sage', 'Warm Sand', 'Flame Orange']::TEXT[],
  budget TEXT DEFAULT 'Under ₹3,000 per piece',
  style_note TEXT DEFAULT 'Quiet, earthy, easy to move in.',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Garments Table
CREATE TABLE IF NOT EXISTS garments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'outerwear', 'shoes', 'accessories')),
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT DEFAULT '',
  brand TEXT,
  fabric TEXT,
  seasons TEXT[] DEFAULT '{}',
  formality TEXT DEFAULT 'casual' CHECK (formality IN ('casual', 'smart', 'formal')),
  image_url TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON garments(user_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category);
CREATE INDEX IF NOT EXISTS idx_garments_favorite ON garments(favorite);
CREATE INDEX IF NOT EXISTS idx_garments_created_at ON garments(created_at DESC);

-- 3. Saved Outfits Table
CREATE TABLE IF NOT EXISTS saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score NUMERIC DEFAULT 0,
  reasons TEXT[] DEFAULT '{}',
  matched_palette_id INTEGER,
  piece_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_created_at ON saved_outfits(created_at DESC);
