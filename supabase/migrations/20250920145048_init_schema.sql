-- Profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'customer' check (role in ('customer','dealer','admin')),
  company_name text,
  dealer_status text default 'pending' check (dealer_status in ('pending','approved','rejected')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Products table
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price numeric(10,2) not null,
  dealer_price numeric(10,2),
  visible_to text[] default array['customer','dealer'],
  created_at timestamp with time zone default now()
);

alter table products enable row level security;

create policy "Anyone can view products"
  on products for select
  using (true);

-- Orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status text default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  total numeric(10,2),
  created_at timestamp with time zone default now()
);

alter table orders enable row level security;

create policy "Users can see their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() = user_id);

