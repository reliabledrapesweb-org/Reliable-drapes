-- Create coupons table for offers and promotions management
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value decimal not null,
  min_order_value decimal default 0,
  max_uses integer,
  current_uses integer default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for common queries
create index if not exists idx_coupons_code on coupons (code);
create index if not exists idx_coupons_active on coupons (is_active);
create index if not exists idx_coupons_valid_from on coupons (valid_from);
create index if not exists idx_coupons_valid_until on coupons (valid_until);

-- Enable RLS
alter table coupons enable row level security;

-- Policy: Allow public read access to active coupons
create policy "Public can read active coupons"
  on coupons for select
  to public
  using (is_active = true);

-- Policy: Only admins can manage coupons
create policy "Admins can manage coupons"
  on coupons for all
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
create or replace function update_coupons_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger coupons_updated_at
  before update on coupons
  for each row
  execute function update_coupons_updated_at();
