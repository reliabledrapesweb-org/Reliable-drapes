-- Re-add optional dealer_price column to products
alter table products
  add column if not exists dealer_price numeric null;
