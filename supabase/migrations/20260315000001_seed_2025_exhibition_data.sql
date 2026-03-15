-- Seed mock 2025 exhibition data for preview
INSERT INTO exhibition_years (year, is_active)
VALUES (2025, true)
ON CONFLICT (year) DO NOTHING;

-- Get the year ID for inserts
DO $$
DECLARE
  v_year_id uuid;
BEGIN
  SELECT id INTO v_year_id FROM exhibition_years WHERE year = 2025;

  -- Exhibition item
  INSERT INTO exhibition_items (year_id, type, title, description, image_url, display_order, is_active)
  VALUES (
    v_year_id,
    'exhibition',
    'Heimtextil India 2025',
    'Reliable Drapes showcased its latest premium curtain and upholstery fabric collections at Heimtextil India 2025, New Delhi.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    1,
    true
  );

  -- Moment item
  INSERT INTO exhibition_items (year_id, type, title, description, image_url, display_order, is_active)
  VALUES (
    v_year_id,
    'moment',
    'Store Launch — Jaipur Flagship',
    'Grand opening of our Jaipur flagship showroom, bringing premium furnishing solutions closer to Rajasthan.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    1,
    true
  );

  -- News item
  INSERT INTO exhibition_items (year_id, type, title, description, image_url, source_name, article_url, display_order, is_active)
  VALUES (
    v_year_id,
    'news',
    'Reliable Drapes Expands Retail Footprint Across India',
    'Leading furnishing brand Reliable Drapes announces plans to open 10 new showrooms across tier-2 cities in 2025.',
    'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80',
    'The Economic Times',
    'https://economictimes.indiatimes.com',
    1,
    true
  );
END $$;
