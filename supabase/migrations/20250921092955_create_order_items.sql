-- Create order_items table
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null default 1,
  price_snapshot numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table order_items enable row level security;

-- Policies
create policy "Users can view their own order items"
on order_items for select
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

create policy "Users can insert into their own orders"
on order_items for insert
with check (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);
