-- Seed product images for existing products
-- This migration adds multiple images to each product for the gallery feature

-- First, we need to get product IDs and insert images
-- We'll use a DO block to handle this dynamically

DO $$
DECLARE
  v_product_id UUID;
BEGIN
  -- Velvet Blackout Curtains
  SELECT id INTO v_product_id FROM products WHERE name = 'Velvet Blackout Curtains' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Velvet blackout curtains main view', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Close-up of velvet texture', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1585128792062-2d2f62a00e5f?w=800&h=800&fit=crop', 'Curtains in living room setting', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=800&fit=crop', 'Detail of curtain draping', false, 3);
  END IF;

  -- Sheer Voile Curtains
  SELECT id INTO v_product_id FROM products WHERE name = 'Sheer Voile Curtains' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Sheer voile curtains with natural light', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=800&h=800&fit=crop', 'Curtains flowing in breeze', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1594026112520-0c11f4a3dc3c?w=800&h=800&fit=crop', 'Window with sheer curtains', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Close-up of fabric weave', false, 3);
  END IF;

  -- Jacquard Designer Drapes
  SELECT id INTO v_product_id FROM products WHERE name = 'Jacquard Designer Drapes' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1585128792062-2d2f62a00e5f?w=800&h=800&fit=crop', 'Jacquard drapes with intricate pattern', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=800&fit=crop', 'Detail of jacquard weaving', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Drapes in elegant room', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Fabric texture close-up', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1594026112520-0c11f4a3dc3c?w=800&h=800&fit=crop', 'Full window treatment view', false, 4);
  END IF;

  -- Cotton Printed Curtains
  SELECT id INTO v_product_id FROM products WHERE name = 'Cotton Printed Curtains' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=800&h=800&fit=crop', 'Cotton curtains with geometric print', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Pattern detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Curtains in modern room', false, 2);
  END IF;

  -- Premium Sofa Upholstery Set
  SELECT id INTO v_product_id FROM products WHERE name = 'Premium Sofa Upholstery Set' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Premium sofa upholstery', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Fabric texture detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 'Upholstered sofa in living room', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?w=800&h=800&fit=crop', 'Close-up of stitching', false, 3);
  END IF;

  -- Leather Recliner Cover
  SELECT id INTO v_product_id FROM products WHERE name = 'Leather Recliner Cover' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Leather recliner cover', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Leather texture close-up', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 'Recliner in room setting', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?w=800&h=800&fit=crop', 'Detail of leather grain', false, 3);
  END IF;

  -- Velvet Cushion Covers
  SELECT id INTO v_product_id FROM products WHERE name = 'Velvet Cushion Covers' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop', 'Set of velvet cushion covers', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', 'Cushions on sofa', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Close-up of velvet texture', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop', 'Different color options', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Cushions arranged on bed', false, 4);
  END IF;

  -- Egyptian Cotton Bedsheet Set
  SELECT id INTO v_product_id FROM products WHERE name = 'Egyptian Cotton Bedsheet Set' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 'Egyptian cotton bedsheet on bed', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 'Close-up of cotton weave', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=800&fit=crop', 'Bedsheet with pillow covers', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1574643142409-f8d6e0e9d2d2?w=800&h=800&fit=crop', 'Bedroom setting', false, 3);
  END IF;

  -- Silk Comforter Set
  SELECT id INTO v_product_id FROM products WHERE name = 'Silk Comforter Set' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 'Silk comforter on bed', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 'Silk fabric sheen', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=800&fit=crop', 'Comforter with matching pillows', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=800&fit=crop', 'Luxury bedroom setup', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1574643142409-f8d6e0e9d2d2?w=800&h=800&fit=crop', 'Detail of silk texture', false, 4);
  END IF;

  -- Quilted Bedspread
  SELECT id INTO v_product_id FROM products WHERE name = 'Quilted Bedspread' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=800&fit=crop', 'Hand-quilted bedspread', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 'Quilting pattern detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 'Reversible side view', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=800&fit=crop', 'Bedspread on bed', false, 3);
  END IF;

  -- Satin Pillow Covers
  SELECT id INTO v_product_id FROM products WHERE name = 'Satin Pillow Covers' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1574643142409-f8d6e0e9d2d2?w=800&h=800&fit=crop', 'Set of satin pillow covers', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 'Satin sheen close-up', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 'Pillows on bed', false, 2);
  END IF;

  -- Coir Door Mat
  SELECT id INTO v_product_id FROM products WHERE name = 'Coir Door Mat' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=800&fit=crop', 'Natural coir door mat', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 'Mat at entrance', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop', 'Close-up of coir fiber', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=800&fit=crop', 'Anti-slip backing detail', false, 3);
  END IF;

  -- Persian Style Area Rug
  SELECT id INTO v_product_id FROM products WHERE name = 'Persian Style Area Rug' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 'Persian style area rug', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=800&fit=crop', 'Rug in living room', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=800&fit=crop', 'Pattern detail', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop', 'Border design close-up', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 'Full rug view', false, 4);
  END IF;

  -- Anti-Slip Bath Mat
  SELECT id INTO v_product_id FROM products WHERE name = 'Anti-Slip Bath Mat' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop', 'Microfiber bath mat', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=800&fit=crop', 'Mat in bathroom', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 'Anti-slip backing', false, 2);
  END IF;

  -- Sofa Panel Protector
  SELECT id INTO v_product_id FROM products WHERE name = 'Sofa Panel Protector' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?w=800&h=800&fit=crop', 'Sofa panel protector', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 'Protector on sofa', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Water-resistant fabric', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Installation view', false, 3);
  END IF;

  -- Elastic Sofa Cover
  SELECT id INTO v_product_id FROM products WHERE name = 'Elastic Sofa Cover' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 'Elastic sofa cover fitted', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Stretchable fabric detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?w=800&h=800&fit=crop', 'Cover on 3-seater sofa', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Easy installation demo', false, 3);
  END IF;

  -- Royal Brocade Drapes
  SELECT id INTO v_product_id FROM products WHERE name = 'Royal Brocade Drapes' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=800&fit=crop', 'Royal brocade drapes with gold threading', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1585128792062-2d2f62a00e5f?w=800&h=800&fit=crop', 'Gold thread detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Drapes in grand interior', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Handwoven pattern close-up', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1594026112520-0c11f4a3dc3c?w=800&h=800&fit=crop', 'Full window treatment', false, 4);
  END IF;

  -- Designer Cushion Set
  SELECT id INTO v_product_id FROM products WHERE name = 'Designer Cushion Set' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', 'Set of 8 designer cushions', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop', 'Embroidered cover detail', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Cushions arranged on sofa', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 'Mix and match designs', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 'Different pattern options', false, 4);
  END IF;

  -- Bamboo Fiber Bedsheet
  SELECT id INTO v_product_id FROM products WHERE name = 'Bamboo Fiber Bedsheet' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=800&fit=crop', 'Bamboo fiber bedsheet', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 'Eco-friendly fabric texture', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 'Bedsheet on bed', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=800&fit=crop', 'Moisture-wicking properties', false, 3);
  END IF;

  -- Hand-Tufted Carpet
  SELECT id INTO v_product_id FROM products WHERE name = 'Hand-Tufted Carpet' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=800&fit=crop', 'Hand-tufted wool carpet', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 'Contemporary design pattern', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=800&fit=crop', 'Wool texture close-up', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop', 'Carpet in living room', false, 3),
      (v_product_id, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=800&fit=crop', 'Craftsmanship detail', false, 4);
  END IF;

  -- Thermal Insulated Curtains
  SELECT id INTO v_product_id FROM products WHERE name = 'Thermal Insulated Curtains' LIMIT 1;
  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES
      (v_product_id, 'https://images.unsplash.com/photo-1594026112520-0c11f4a3dc3c?w=800&h=800&fit=crop', 'Thermal insulated curtains', true, 0),
      (v_product_id, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 'Energy-efficient fabric layers', false, 1),
      (v_product_id, 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 'Curtains blocking sunlight', false, 2),
      (v_product_id, 'https://images.unsplash.com/photo-1585128792062-2d2f62a00e5f?w=800&h=800&fit=crop', 'Insulation layer detail', false, 3);
  END IF;

END $$;
