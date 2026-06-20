-- Add buying_price and selling_price columns to shop_products
alter table shop_products
  add column if not exists buying_price integer not null default 0,
  add column if not exists selling_price integer not null default 0;

-- Copy existing price to selling_price for rows that have selling_price = 0
update shop_products
  set selling_price = price
  where selling_price = 0 and price > 0;

-- Update the RLS policies to allow the new columns (existing policies already cover all columns)
