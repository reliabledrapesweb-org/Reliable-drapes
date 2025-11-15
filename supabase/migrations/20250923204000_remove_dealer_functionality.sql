-- Remove dealer functionality migration

-- Drop dealer-specific functions first
drop function if exists is_dealer(uuid);

-- Update profiles table - remove dealer-specific columns
alter table profiles 
  drop column if exists dealer_status,
  drop column if exists company_name;

-- Update role constraint to only allow 'customer' and 'admin'
alter table profiles 
  drop constraint if exists profiles_role_check;

alter table profiles 
  add constraint profiles_role_check 
  check (role in ('customer', 'admin'));

-- Update products table - remove dealer-specific columns and visibility
alter table products 
  drop column if exists dealer_price;

-- Update visible_to column to only contain customer values
-- First, update existing records
update products 
set visible_to = array['customer'] 
where visible_to @> array['dealer']::text[] or visible_to @> array['customer', 'dealer']::text[];

-- Add a constraint to ensure visible_to only contains valid values
alter table products 
  drop constraint if exists products_visible_to_check;

alter table products 
  add constraint products_visible_to_check 
  check (visible_to <@ array['customer']::text[]);

-- Update default value for profiles role
alter table profiles 
  alter column role set default 'customer';

-- Clean up any existing dealer profiles by converting them to customers
update profiles 
set role = 'customer' 
where role = 'dealer';