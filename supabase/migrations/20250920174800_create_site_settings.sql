-- Create site_settings table for admin-configurable site options
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),

  -- Shop settings
  shop_enabled boolean default true,
  coming_soon_message text default 'Coming Soon – Our new collection will be available shortly.',

  -- Hero video settings
  hero_video_enabled boolean default false,
  hero_video_url text,
  hero_video_type text check (hero_video_type in ('youtube', 'upload')),

  -- Social media URLs
  social_instagram text,
  social_facebook text,
  social_twitter text,
  social_youtube text,
  social_linkedin text,

  -- Company details
  company_email text,
  company_phone text,
  company_address text,

  -- Google reviews
  google_place_id text,
  google_reviews_enabled boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default settings row
insert into site_settings (shop_enabled) values (true);

-- Create index for faster lookups
create index if not exists idx_site_settings_singleton on site_settings (id);

-- Enable RLS
alter table site_settings enable row level security;

-- Policy: Allow public read access
create policy "Public can read site settings"
  on site_settings for select
  to public
  using (true);

-- Policy: Only admins can manage site settings
create policy "Admins can manage site settings"
  on site_settings for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
create or replace function update_site_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger site_settings_updated_at
  before update on site_settings
  for each row
  execute function update_site_settings_updated_at();
