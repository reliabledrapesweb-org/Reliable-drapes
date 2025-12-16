-- Create Best Sellers collection
INSERT INTO collections (name, slug, description, is_active, sort_order)
VALUES (
  'Best Sellers',
  'best-sellers',
  'Our most popular products loved by customers',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Add some products to Best Sellers collection (using product names to find IDs)
DO $$
DECLARE
  v_collection_id uuid;
BEGIN
  -- Get the Best Sellers collection ID
  SELECT id INTO v_collection_id FROM collections WHERE slug = 'best-sellers';

  -- Add products to the collection with featured order
  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 1 FROM products WHERE name = 'Velvet Blackout Curtains'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;

  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 2 FROM products WHERE name = 'Egyptian Cotton Bedsheet Set'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;

  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 3 FROM products WHERE name = 'Premium Sofa Upholstery Set'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;

  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 4 FROM products WHERE name = 'Jacquard Designer Drapes'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;

  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 5 FROM products WHERE name = 'Silk Comforter Set'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;

  INSERT INTO product_collections (product_id, collection_id, featured_order)
  SELECT id, v_collection_id, 6 FROM products WHERE name = 'Designer Cushion Set'
  ON CONFLICT (product_id, collection_id) DO UPDATE SET featured_order = EXCLUDED.featured_order;
END $$;
