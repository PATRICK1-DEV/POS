-- Fix: Add security definer function to look up email by username during login
-- This bypasses RLS so unauthenticated users can log in with their username

create or replace function public.get_email_by_username(lookup_username text)
returns text
language sql
security definer
stable
as $$
  select email from public.profiles where username = lookup_username limit 1;
$$;
