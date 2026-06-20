-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (username + phone for each user)
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  username text,
  phone text default '',
  email text not null,
  created_at timestamptz default now()
);

-- Shops table
create table if not exists shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Products (global catalog - managed by admin)
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emoji text default '📦',
  category text default 'General',
  price integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Shop products (each shop's stock)
create table if not exists shop_products (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price integer not null,
  stock integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(shop_id, product_id)
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  total integer not null,
  payment_method text default 'cash',
  created_at timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null,
  price integer not null
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new.email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Enable RLS
alter table profiles enable row level security;
alter table shops enable row level security;
alter table products enable row level security;
alter table shop_products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- RLS policies

-- Profiles: anyone can read (for username lookup), user can update own
create policy "Anyone can view profiles" on profiles for select
  using (true);
create policy "Users can update own profile" on profiles for update
  using (auth.uid() = user_id);

-- Shops: users can read/update their own shop
create policy "Users can view own shop" on shops for select
  using (owner_id = auth.uid());
create policy "Users can insert own shop" on shops for insert
  with check (owner_id = auth.uid());
create policy "Users can update own shop" on shops for update
  using (owner_id = auth.uid());

-- Products: everyone can read; admin can insert/update/delete (app-enforced)
create policy "Anyone can view products" on products for select
  using (true);
create policy "Admin can insert products" on products for insert
  with check (true);
create policy "Admin can update products" on products for update
  using (true);
create policy "Admin can delete products" on products for delete
  using (true);

-- Shop products: shop can manage own products
create policy "Shop can view own products" on shop_products for select
  using (shop_id in (select id from shops where owner_id = auth.uid()));
create policy "Shop can insert own products" on shop_products for insert
  with check (shop_id in (select id from shops where owner_id = auth.uid()));
create policy "Shop can update own products" on shop_products for update
  using (shop_id in (select id from shops where owner_id = auth.uid()));
create policy "Shop can delete own products" on shop_products for delete
  using (shop_id in (select id from shops where owner_id = auth.uid()));

-- Orders: shop can view own orders
create policy "Shop can view own orders" on orders for select
  using (shop_id in (select id from shops where owner_id = auth.uid()));
create policy "Shop can insert own orders" on orders for insert
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

-- Order items: shop can view own items
create policy "Shop can view own order items" on order_items for select
  using (order_id in (select id from orders where shop_id in (select id from shops where owner_id = auth.uid())));
create policy "Shop can insert own order items" on order_items for insert
  with check (order_id in (select id from orders where shop_id in (select id from shops where owner_id = auth.uid())));

-- Seed some initial products for the admin
insert into products (name, emoji, category, price, created_by) values
  ('Mchele', '🍚', 'Mboga', 3500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Unga wa Mahindi', '🌽', 'Mboga', 2500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Mafuta ya Kupikia', '🫒', 'Mboga', 6000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Mayai', '🥚', 'Mboga', 500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Sukari', '🍬', 'Mboga', 3000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Keki', '🍞', 'Mkate', 2000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Biskuti', '🍪', 'Vitafunio', 1500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Juice ya Machungwa', '🧃', 'Vinywaji', 2500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Maziwa', '🥛', 'Vinywaji', 3000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Soda', '🥤', 'Vinywaji', 2000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Sabuni ya Kufulia', '🧼', 'Usafi', 3500, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1)),
  ('Toothbrush', '🪥', 'Usafi', 2000, (select id from auth.users where email = 'kasembepatrick100@gmail.com' limit 1));
