-- ============================================================
-- FINAL FIX: Eliminate ALL recursion in profiles RLS
-- ============================================================

-- STEP 1: Drop ALL existing policies
drop policy if exists "Anyone can view profiles" on profiles;
drop policy if exists "Users can view profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can update user role" on profiles;

drop policy if exists "Users can view own shop" on shops;
drop policy if exists "Users can insert own shop" on shops;
drop policy if exists "Users can update own shop" on shops;
drop policy if exists "Admins can view all shops" on shops;

drop policy if exists "Anyone can view products" on products;
drop policy if exists "Admin can insert products" on products;
drop policy if exists "Admin can update products" on products;
drop policy if exists "Admin can delete products" on products;

drop policy if exists "Shop can view own products" on shop_products;
drop policy if exists "Shop can insert own products" on shop_products;
drop policy if exists "Shop can update own products" on shop_products;
drop policy if exists "Shop can delete own products" on shop_products;

drop policy if exists "Shop can view own orders" on orders;
drop policy if exists "Shop can insert own orders" on orders;
drop policy if exists "Admins can view all orders" on orders;

drop policy if exists "Shop can view own order items" on order_items;
drop policy if exists "Shop can insert own order items" on order_items;

-- STEP 2: Simplified is_admin() - no table queries, safe for non-profiles tables
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select (auth.jwt() ->> 'email') = 'kasembepatrick100@gmail.com';
$$;

-- STEP 3: Profiles SELECT policy - NO function calls to avoid recursion
-- All authenticated users can view profiles (only contains username/email/phone)
create policy "Anyone can view profiles" on profiles for select
  using (true);

-- Profiles UPDATE - user can only update own profile
create policy "Users can update own profile" on profiles for update
  using (auth.uid() = user_id);

-- STEP 4: Shops policies (using is_admin is safe here - no recursion)
create policy "Users can view own shop" on shops for select
  using (owner_id = auth.uid());

create policy "Admins can view all shops" on shops for select
  using (public.is_admin());

create policy "Users can insert own shop" on shops for insert
  with check (owner_id = auth.uid());

create policy "Users can update own shop" on shops for update
  using (owner_id = auth.uid());

-- STEP 5: Products policies
create policy "Anyone can view products" on products for select
  using (true);

create policy "Admin can insert products" on products for insert
  with check (public.is_admin());

create policy "Admin can update products" on products for update
  using (public.is_admin());

create policy "Admin can delete products" on products for delete
  using (public.is_admin());

-- STEP 6: Shop products policies
create policy "Shop can view own products" on shop_products for select
  using (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Shop can insert own products" on shop_products for insert
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Shop can update own products" on shop_products for update
  using (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Shop can delete own products" on shop_products for delete
  using (shop_id in (select id from shops where owner_id = auth.uid()));

-- STEP 7: Orders policies
create policy "Shop can view own orders" on orders for select
  using (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Shop can insert own orders" on orders for insert
  with check (shop_id in (select id from shops where owner_id = auth.uid()));

create policy "Admins can view all orders" on orders for select
  using (public.is_admin());

-- STEP 8: Order items policies
create policy "Shop can view own order items" on order_items for select
  using (order_id in (
    select id from orders where shop_id in (
      select id from shops where owner_id = auth.uid()
    )
  ));

create policy "Shop can insert own order items" on order_items for insert
  with check (order_id in (
    select id from orders where shop_id in (
      select id from shops where owner_id = auth.uid()
    )
  ));

-- STEP 9: Ensure admin profile exists with admin role
insert into public.profiles (user_id, username, phone, email, role)
select
  id as user_id,
  split_part(email, '@', 1) as username,
  coalesce(raw_user_meta_data ->> 'phone', '') as phone,
  email,
  'admin' as role
from auth.users
where email = 'kasembepatrick100@gmail.com'
  and id not in (select user_id from public.profiles)
on conflict (user_id) do nothing;

update profiles
set role = 'admin'
where user_id in (select id from auth.users where email = 'kasembepatrick100@gmail.com')
  and (role is null or role != 'admin');
