-- Seed product-category associations
-- This links existing products to their appropriate categories

-- First, let's create a helper to get category IDs by slug
DO $$
DECLARE
  curtains_id uuid;
  upholstery_id uuid;
  sheers_id uuid;
  bed_sheets_id uuid;
  comforters_id uuid;
  door_mats_id uuid;
  cushions_id uuid;
  sofa_panels_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO curtains_id FROM categories WHERE slug = 'curtains';
  SELECT id INTO upholstery_id FROM categories WHERE slug = 'upholstery';
  SELECT id INTO sheers_id FROM categories WHERE slug = 'sheers';
  SELECT id INTO bed_sheets_id FROM categories WHERE slug = 'bed-sheets';
  SELECT id INTO comforters_id FROM categories WHERE slug = 'comforters';
  SELECT id INTO door_mats_id FROM categories WHERE slug = 'door-mats';
  SELECT id INTO cushions_id FROM categories WHERE slug = 'cushions';
  SELECT id INTO sofa_panels_id FROM categories WHERE slug = 'sofa-panels';

  -- Curtains & Drapes
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, curtains_id, true FROM products WHERE name = 'Velvet Blackout Curtains'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, curtains_id, true FROM products WHERE name = 'Jacquard Designer Drapes'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, curtains_id, true FROM products WHERE name = 'Cotton Printed Curtains'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, curtains_id, true FROM products WHERE name = 'Royal Brocade Drapes'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, curtains_id, true FROM products WHERE name = 'Thermal Insulated Curtains'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Sheers
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, sheers_id, true FROM products WHERE name = 'Sheer Voile Curtains'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Upholstery
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, upholstery_id, true FROM products WHERE name = 'Premium Sofa Upholstery Set'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, upholstery_id, true FROM products WHERE name = 'Leather Recliner Cover'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Cushions
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, cushions_id, true FROM products WHERE name = 'Velvet Cushion Covers'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, cushions_id, true FROM products WHERE name = 'Designer Cushion Set'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Bed Sheets
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, bed_sheets_id, true FROM products WHERE name = 'Egyptian Cotton Bedsheet Set'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, bed_sheets_id, true FROM products WHERE name = 'Quilted Bedspread'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, bed_sheets_id, true FROM products WHERE name = 'Satin Pillow Covers'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, bed_sheets_id, true FROM products WHERE name = 'Bamboo Fiber Bedsheet'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Comforters
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, comforters_id, true FROM products WHERE name = 'Silk Comforter Set'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Door Mats
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, door_mats_id, true FROM products WHERE name = 'Coir Door Mat'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, door_mats_id, true FROM products WHERE name = 'Persian Style Area Rug'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, door_mats_id, true FROM products WHERE name = 'Anti-Slip Bath Mat'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, door_mats_id, true FROM products WHERE name = 'Hand-Tufted Carpet'
  ON CONFLICT (product_id, category_id) DO NOTHING;

  -- Sofa Panels
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, sofa_panels_id, true FROM products WHERE name = 'Sofa Panel Protector'
  ON CONFLICT (product_id, category_id) DO NOTHING;
  
  INSERT INTO product_categories (product_id, category_id, is_primary)
  SELECT id, sofa_panels_id, true FROM products WHERE name = 'Elastic Sofa Cover'
  ON CONFLICT (product_id, category_id) DO NOTHING;

END $$;
