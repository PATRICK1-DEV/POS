-- ============================================================
-- Admin CRUD on users (but cannot promote to admin)
-- ============================================================

-- Drop old policies that need replacing
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can update user role" on profiles;

-- Regular users can update their own profile (non-role fields)
create policy "Users can update own profile" on profiles for update
  using (auth.uid() = user_id);

-- Admin can update any profile, but cannot set role='admin' for other users
create policy "Admin can update profiles" on profiles for update
  using (public.is_admin())
  with check (
    auth.uid() = user_id or (role is distinct from 'admin')
  );

-- Admin can delete any profile
create policy "Admin can delete profiles" on profiles for delete
  using (public.is_admin());
