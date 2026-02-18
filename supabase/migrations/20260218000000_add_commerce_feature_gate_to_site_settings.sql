-- Add independent commerce feature gating controls
alter table site_settings
  add column if not exists commerce_features_enabled boolean not null default true,
  add column if not exists commerce_coming_soon_message text;

update site_settings
set commerce_features_enabled = coalesce(commerce_features_enabled, true);
