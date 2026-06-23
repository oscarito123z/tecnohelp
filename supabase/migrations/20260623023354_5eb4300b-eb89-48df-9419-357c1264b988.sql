
REVOKE EXECUTE ON FUNCTION public.get_staff_list() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_staff_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reset_staff_password(p_user_id uuid, p_pin text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo un administrador signed-in puede restablecer contraseñas';
  END IF;
  IF p_pin <> 'TECNOHELP' THEN
    RAISE EXCEPTION 'PIN incorrecto';
  END IF;
  IF p_new_password IS NULL OR length(p_new_password) < 4 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 4 caracteres';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role IN ('admin','tecnico')) THEN
    RAISE EXCEPTION 'Usuario no autorizado';
  END IF;
  UPDATE auth.users
    SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = p_user_id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) TO authenticated;
