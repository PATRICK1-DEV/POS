-- Allow admin to delete a user and cascade through all related tables
create or replace function delete_user_cascade(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = target_user_id;
end;
$$;
