-- Migration: Add admin role system (fixed - no circular RLS)

-- 1. Add role column to profiles
alter table profiles add column if not exists role text not null default 'user';

-- 2. Create admin check function (security definer bypasses RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  );
$$;

-- 3. Create profiles for existing auth users who don't have one
insert into public.profiles (user_id, username, phone, email, role)
select
  id as user_id,
  split_part(email, '@', 1) as username,
  coalesce(raw_user_meta_data ->> 'phone', '') as phone,
  email,
  case when email = 'kasembepatrick100@gmail.com' then 'admin' else 'user' end as role
from auth.users
where id not in (select user_id from public.profiles)
on conflict (user_id) do nothing;

-- 4. Update existing profiles with correct role for admin
update profiles set role = 'admin'
where email = 'kasembepatrick100@gmail.com' and role != 'admin';

-- 5. Drop old wide-open policies and add role-based ones for products
drop policy if exists "Admin can insert products" on products;
create policy "Admin can insert products" on products for insert
  with check (public.is_admin());

drop policy if exists "Admin can update products" on products;
create policy "Admin can update products" on products for update
  using (public.is_admin());

drop policy if exists "Admin can delete products" on products;
create policy "Admin can delete products" on products for delete
  using (public.is_admin());

-- 6. Replace old "Anyone can view profiles" with role-based policy
drop policy if exists "Anyone can view profiles" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Users can view profiles" on profiles for select
  using (public.is_admin() or auth.uid() = user_id);

-- 7. Admin policies for shops
drop policy if exists "Admins can view all shops" on shops;
create policy "Admins can view all shops" on shops for select
  using (public.is_admin() or owner_id = auth.uid());

-- 8. Admin policies for orders
drop policy if exists "Admins can view all orders" on orders;
create policy "Admins can view all orders" on orders for select
  using (public.is_admin() or shop_id in (select id from shops where owner_id = auth.uid()));

-- 9. Admin policy for updating user roles
drop policy if exists "Admins can update user role" on profiles;
create policy "Admins can update user role" on profiles for update
  using (public.is_admin());
