-- Categories system for hierarchical product organization
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references categories(id) on delete cascade,
  sort_order int default 0,
  is_featured boolean default false,
  meta_title text,
  meta_description text,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Product categories junction table (many-to-many)
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamp with time zone default now(),
  unique(product_id, category_id)
);

-- Collections for seasonal/thematic groupings
create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  banner_url text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Product collections junction table
create table product_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  collection_id uuid references collections(id) on delete cascade,
  featured_order int,
  created_at timestamp with time zone default now(),
  unique(product_id, collection_id)
);

-- Product variants (colors, sizes, materials)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  sku text unique,
  name text not null, -- e.g., "Blue - Large", "Cotton - 2m x 3m"
  variant_type text not null, -- 'color', 'size', 'material', 'pattern'
  variant_value text not null, -- 'blue', '2m x 3m', 'cotton', 'floral'
  price_adjustment numeric(10,2) default 0,
  stock_quantity int default 0,
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- Product images for gallery
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  image_url text not null,
  alt_text text,
  is_primary boolean default false,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- Product specifications/attributes
create table product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  spec_name text not null, -- 'Material', 'Dimensions', 'Care Instructions'
  spec_value text not null,
  spec_category text, -- 'technical', 'care', 'design'
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table categories enable row level security;
alter table product_categories enable row level security;
alter table collections enable row level security;
alter table product_collections enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table product_specifications enable row level security;

-- RLS Policies for public read access
create policy "Anyone can view published categories"
  on categories for select
  using (published = true);

create policy "Anyone can view product categories"
  on product_categories for select
  using (true);

create policy "Anyone can view active collections"
  on collections for select
  using (is_active = true);

create policy "Anyone can view product collections"
  on product_collections for select
  using (true);

create policy "Anyone can view available product variants"
  on product_variants for select
  using (is_available = true);

create policy "Anyone can view product images"
  on product_images for select
  using (true);

create policy "Anyone can view product specifications"
  on product_specifications for select
  using (true);

-- Admin policies (will be implemented with admin role check)
create policy "Admins can manage categories"
  on categories for all
  using (is_admin(auth.uid()));

create policy "Admins can manage product categories"
  on product_categories for all
  using (is_admin(auth.uid()));

create policy "Admins can manage collections"
  on collections for all
  using (is_admin(auth.uid()));

create policy "Admins can manage product collections"
  on product_collections for all
  using (is_admin(auth.uid()));

create policy "Admins can manage product variants"
  on product_variants for all
  using (is_admin(auth.uid()));

create policy "Admins can manage product images"
  on product_images for all
  using (is_admin(auth.uid()));

create policy "Admins can manage product specifications"
  on product_specifications for all
  using (is_admin(auth.uid()));

-- Indexes for performance
create index idx_categories_parent_id on categories(parent_id);
create index idx_categories_slug on categories(slug);
create index idx_categories_published on categories(published);
create index idx_product_categories_product_id on product_categories(product_id);
create index idx_product_categories_category_id on product_categories(category_id);
create index idx_collections_active on collections(is_active);
create index idx_product_variants_product_id on product_variants(product_id);
create index idx_product_images_product_id on product_images(product_id);
create index idx_product_specifications_product_id on product_specifications(product_id);