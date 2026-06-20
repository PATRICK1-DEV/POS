-- ============================================================
-- ROBUST FIX: Make admin see all users/shops regardless of role
-- ============================================================

-- STEP 1: Check what profiles exist (diagnostic)
-- Run this first to see the actual data:
-- SELECT id, user_id, username, email, phone, role FROM profiles ORDER BY created_at;

-- STEP 2: Update admin role using auth.users JOIN (reliable)
-- This matches by the auth.users email, not the profiles.email
UPDATE profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.user_id = u.id
  AND u.email = 'kasembepatrick100@gmail.com'
  AND (p.role IS NULL OR p.role != 'admin');

-- STEP 3: Verify the update worked
-- Run this to confirm:
-- SELECT p.id, p.username, p.email, p.role, u.email as auth_email
-- FROM profiles p
-- JOIN auth.users u ON p.user_id = u.id
-- WHERE u.email = 'kasembepatrick100@gmail.com';

-- STEP 4: Recreate is_admin() with email fallback
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and (role = 'admin' or email = 'kasembepatrick100@gmail.com')
  );
$$;

-- STEP 5: [FALLBACK] If the above doesn't work, drop and recreate
-- the RLS policies to check JWT email directly instead of is_admin()
-- Uncomment these if STEP 2-4 still don't fix the issue:

/*
drop policy if exists "Users can view profiles" on profiles;
create policy "Users can view profiles" on profiles for select
  using (
    (auth.jwt() ->> 'email') = 'kasembepatrick100@gmail.com'
    or auth.uid() = user_id
  );

drop policy if exists "Admins can view all shops" on shops;
create policy "Admins can view all shops" on shops for select
  using (
    (auth.jwt() ->> 'email') = 'kasembepatrick100@gmail.com'
    or owner_id = auth.uid()
  );

drop policy if exists "Admins can view all orders" on orders;
create policy "Admins can view all orders" on orders for select
  using (
    (auth.jwt() ->> 'email') = 'kasembepatrick100@gmail.com'
    or shop_id in (select id from shops where owner_id = auth.uid())
  );
*/
