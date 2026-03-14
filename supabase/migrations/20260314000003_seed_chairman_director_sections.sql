-- Seed chairman and director about sections
INSERT INTO about_sections (section_key, title, subtitle, content, display_order, is_active)
VALUES
  ('chairman', 'Chairman', 'Chairman', 'Chairman write-up to be added.', 2, true),
  ('director', 'Director', 'Director', '', 3, true)
ON CONFLICT (section_key) DO NOTHING;
