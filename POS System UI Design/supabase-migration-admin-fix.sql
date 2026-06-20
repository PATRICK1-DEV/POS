-- Fix: Ensure admin profile has admin role so RLS policies work

-- 1. Recreate is_admin() to also check by hardcoded admin email for robustness
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

-- 2. Ensure admin's profile role is set to 'admin'
update profiles
set role = 'admin'
where email = 'kasembepatrick100@gmail.com'
  and (role is null or role != 'admin');

-- 3. Backfill: ensure all auth users have a profile
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
