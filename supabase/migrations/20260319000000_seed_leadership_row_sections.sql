-- Add separate leadership row entries so the top 3 cards can be edited
-- independently from the individual founder/chairman/director sections.
INSERT INTO about_sections (section_key, title, subtitle, content, image_url, display_order, is_active)
VALUES
  ('leadership-founder', 'Our Founder', 'FOUNDER', '', NULL, 10, true),
  ('leadership-chairman', 'Chairman', 'CHAIRMAN', '', NULL, 11, true),
  ('leadership-director', 'Director', 'DIRECTOR', '', NULL, 12, true)
ON CONFLICT (section_key) DO NOTHING;
