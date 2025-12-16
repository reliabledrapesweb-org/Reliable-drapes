-- Seed initial categories for the shop
INSERT INTO categories (name, slug, description, image_url, is_featured, published, sort_order)
VALUES 
  ('Curtains', 'curtains', 'Premium quality curtains for every room', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=600&fit=crop', true, true, 1),
  ('Upholstery', 'upholstery', 'Luxurious upholstery fabrics', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', true, true, 2),
  ('Sheers', 'sheers', 'Elegant sheer curtains and drapes', 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=600&fit=crop', true, true, 3),
  ('Bed Sheets', 'bed-sheets', 'Comfortable and stylish bed sheets', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=600&fit=crop', true, true, 4),
  ('Comforters', 'comforters', 'Cozy comforters and quilts', 'https://images.unsplash.com/photo-1651936020103-65154077c003?w=600&h=600&fit=crop', true, true, 5),
  ('Door Mats', 'door-mats', 'Durable and decorative door mats', 'https://images.unsplash.com/photo-1718587608491-f40ae3b13273?w=600&h=600&fit=crop', true, true, 6),
  ('Cushions', 'cushions', 'Decorative cushions and pillows', 'https://images.unsplash.com/photo-1759517857499-7f27b61aad5d?w=600&h=600&fit=crop', true, true, 7),
  ('Sofa Panels', 'sofa-panels', 'Stylish sofa panels and covers', 'https://images.unsplash.com/photo-1669989657165-d9f8e6cb6366?w=600&h=600&fit=crop', true, true, 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  published = EXCLUDED.published,
  sort_order = EXCLUDED.sort_order;
