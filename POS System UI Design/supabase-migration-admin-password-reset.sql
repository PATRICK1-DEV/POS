-- RPC function for admin to reset any user's password
CREATE OR REPLACE FUNCTION admin_reset_user_password(target_user_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  IF NOT (SELECT public.is_admin()) THEN
    RETURN false;
  END IF;
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;
