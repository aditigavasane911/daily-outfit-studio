-- ==========================================================
-- Rewear Radar / Daily Outfit Studio — Seed Data
-- Run this to populate initial curated menswear pieces
-- ==========================================================

-- Demo User ID (or replace with your auth user UUID)
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert demo profile
  INSERT INTO profiles (id, name, email, sizes, favorite_colors, budget, style_note)
  VALUES (
    demo_user_id,
    'Devin Vance',
    'devin@rewearradar.com',
    'Tops L, Bottoms 32x32, Shoes 10.5 US',
    ARRAY['Midnight Spruce', 'Earthy Sage', 'Warm Sand', 'Flame Orange'],
    'Under ₹3,500 per piece',
    'Elevated casual, tactile textures, tonal earthy layering.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert curated garments
  INSERT INTO garments (id, user_id, name, category, color_name, color_hex, size, brand, fabric, seasons, formality, favorite)
  VALUES
    (
      'a0000000-0000-0000-0000-000000000001',
      demo_user_id,
      'Waffle Knit Quarter-Zip',
      'tops',
      'Midnight Spruce',
      '#165B6D',
      'L',
      'Studio Norse',
      'Merino Wool Blend',
      ARRAY['fall', 'winter'],
      'casual',
      true
    ),
    (
      'a0000000-0000-0000-0000-000000000002',
      demo_user_id,
      'Pleated Wide-Leg Chinos',
      'bottoms',
      'Warm Sand',
      '#F4E1C1',
      '32',
      'Atelier Form',
      'Heavy Cotton Twill',
      ARRAY['spring', 'summer', 'fall'],
      'smart',
      true
    ),
    (
      'a0000000-0000-0000-0000-000000000003',
      demo_user_id,
      'Relaxed Linen Overshirt',
      'outerwear',
      'Earthy Sage',
      '#73A879',
      'L',
      'Rewear Tailors',
      '100% Washed Linen',
      ARRAY['spring', 'summer', 'fall'],
      'casual',
      false
    ),
    (
      'a0000000-0000-0000-0000-000000000004',
      demo_user_id,
      'Minimalist Low-Top Sneakers',
      'shoes',
      'Ice Blue',
      '#D2ECF9',
      '43',
      'Vance Studio',
      'Calfskin & Rubber',
      ARRAY['spring', 'summer', 'fall', 'winter'],
      'smart',
      true
    ),
    (
      'a0000000-0000-0000-0000-000000000005',
      demo_user_id,
      'Flame Pop Graphic Tee',
      'tops',
      'Flame Orange',
      '#EF5835',
      'L',
      'Studio Echo',
      'Heavyweight Cotton',
      ARRAY['spring', 'summer'],
      'casual',
      false
    )
  ON CONFLICT (id) DO NOTHING;
END $$;
