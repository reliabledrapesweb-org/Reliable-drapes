-- Delete order items first (to avoid foreign key constraint violations)
DELETE FROM order_items;

-- Delete all orders
DELETE FROM orders;

-- Delete all existing products with NULL image_urls
DELETE FROM products;

-- Insert new products with proper image URLs and Indian Rupee pricing
INSERT INTO products (name, description, image_url, price, visible_to)
VALUES
  -- Curtains & Drapes
  ('Velvet Blackout Curtains', 'Premium velvet curtains with blackout lining, perfect for bedrooms. Available in multiple colors.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop', 3499.00, ARRAY['customer']),
  ('Sheer Voile Curtains', 'Light and airy sheer curtains for elegant window dressing. Allows natural light while maintaining privacy.', 'https://images.unsplash.com/photo-1604170727548-2b9379e7ab70?w=800&h=800&fit=crop', 1299.00, ARRAY['customer']),
  ('Jacquard Designer Drapes', 'Luxurious jacquard drapes with intricate patterns. Heavy fabric with excellent drape quality.', 'https://images.unsplash.com/photo-1585128792062-2d2f62a00e5f?w=800&h=800&fit=crop', 5999.00, ARRAY['customer']),
  ('Cotton Printed Curtains', 'Vibrant cotton curtains with modern geometric prints. Easy to maintain and durable.', 'https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=800&h=800&fit=crop', 1899.00, ARRAY['customer']),
  
  -- Upholstery
  ('Premium Sofa Upholstery Set', 'High-quality upholstery fabric for 3-seater sofa. Stain-resistant and durable material.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 8999.00, ARRAY['customer']),
  ('Leather Recliner Cover', 'Genuine leather upholstery for recliners. Soft touch with premium finish.', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=800&fit=crop', 12499.00, ARRAY['customer']),
  ('Velvet Cushion Covers', 'Set of 5 velvet cushion covers in royal colors. Soft and plush texture.', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop', 1499.00, ARRAY['customer']),
  
  -- Bed Linen
  ('Egyptian Cotton Bedsheet Set', 'Premium Egyptian cotton bedsheet set with 400 thread count. Includes 2 pillow covers.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', 4299.00, ARRAY['customer']),
  ('Silk Comforter Set', 'Luxurious silk comforter with matching pillow covers. Temperature regulating fabric.', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop', 7999.00, ARRAY['customer']),
  ('Quilted Bedspread', 'Hand-quilted bedspread with traditional Indian patterns. Reversible design.', 'https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=800&h=800&fit=crop', 3799.00, ARRAY['customer']),
  ('Satin Pillow Covers', 'Set of 4 satin pillow covers. Gentle on hair and skin, wrinkle-resistant.', 'https://images.unsplash.com/photo-1574643142409-f8d6e0e9d2d2?w=800&h=800&fit=crop', 899.00, ARRAY['customer']),
  
  -- Door Mats & Rugs
  ('Coir Door Mat', 'Natural coir fiber door mat with anti-slip backing. Eco-friendly and durable.', 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=800&fit=crop', 599.00, ARRAY['customer']),
  ('Persian Style Area Rug', 'Machine-woven area rug with Persian design. Perfect for living rooms.', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop', 6499.00, ARRAY['customer']),
  ('Anti-Slip Bath Mat', 'Microfiber bath mat with superior water absorption. Machine washable.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=800&fit=crop', 799.00, ARRAY['customer']),
  
  -- Sofa Panels & Covers
  ('Sofa Panel Protector', 'Water-resistant sofa panel protector. Protects from spills and pet damage.', 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?w=800&h=800&fit=crop', 2299.00, ARRAY['customer']),
  ('Elastic Sofa Cover', 'Stretchable elastic sofa cover for 3-seater. Easy to install and remove.', 'https://images.unsplash.com/photo-1567016546276-8d1cf7c80b3d?w=800&h=800&fit=crop', 3299.00, ARRAY['customer']),
  
  -- Premium Collections
  ('Royal Brocade Drapes', 'Handwoven brocade drapes with gold threading. Luxury collection for grand interiors.', 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=800&fit=crop', 15999.00, ARRAY['customer']),
  ('Designer Cushion Set', 'Set of 8 designer cushions with embroidered covers. Mix and match designs.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', 4999.00, ARRAY['customer']),
  ('Bamboo Fiber Bedsheet', 'Eco-friendly bamboo fiber bedsheet. Hypoallergenic and moisture-wicking.', 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=800&fit=crop', 3499.00, ARRAY['customer']),
  ('Hand-Tufted Carpet', 'Hand-tufted wool carpet with contemporary design. Premium quality craftsmanship.', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=800&fit=crop', 18999.00, ARRAY['customer']),
  ('Thermal Insulated Curtains', 'Energy-efficient thermal curtains. Keeps rooms cool in summer and warm in winter.', 'https://images.unsplash.com/photo-1594026112520-0c11f4a3dc3c?w=800&h=800&fit=crop', 4799.00, ARRAY['customer']);