-- Create exhibitions table for exhibitions and events management
create table if not exists exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  start_date date,
  end_date date,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for common queries
create index if not exists idx_exhibitions_active on exhibitions (is_active);
create index if not exists idx_exhibitions_start_date on exhibitions (start_date);
create index if not exists idx_exhibitions_end_date on exhibitions (end_date);

-- Enable RLS
alter table exhibitions enable row level security;

-- Policy: Allow public read access to active exhibitions
create policy "Public can read active exhibitions"
  on exhibitions for select
  to public
  using (is_active = true);

-- Policy: Only admins can manage exhibitions
create policy "Admins can manage exhibitions"
  on exhibitions for all
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
create or replace function update_exhibitions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger exhibitions_updated_at
  before update on exhibitions
  for each row
  execute function update_exhibitions_updated_at();
