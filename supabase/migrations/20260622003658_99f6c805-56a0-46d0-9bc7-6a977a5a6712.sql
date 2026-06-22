
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add 'tecnico' role if not present
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tecnico';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Function: list staff (admins + tecnicos) for login dropdown
CREATE OR REPLACE FUNCTION public.get_staff_list()
RETURNS TABLE(id uuid, nombre text, email text, role public.app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.nombre, u.email::text, ur.role
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  JOIN auth.users u ON u.id = p.id
  WHERE ur.role IN ('admin','tecnico')
  ORDER BY p.nombre;
$$;

REVOKE EXECUTE ON FUNCTION public.get_staff_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_staff_list() TO anon, authenticated;

-- Function: reset password using master PIN
CREATE OR REPLACE FUNCTION public.reset_staff_password(p_user_id uuid, p_pin text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

REVOKE EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_staff_password(uuid, text, text) TO anon, authenticated;

-- Function: create staff user (admin-only)
CREATE OR REPLACE FUNCTION public.create_staff_user(p_nombre text, p_email text, p_password text, p_role public.app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear trabajadores';
  END IF;
  IF p_role NOT IN ('admin','tecnico') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;
  IF length(coalesce(p_password,'')) < 4 THEN
    RAISE EXCEPTION 'Contraseña muy corta';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(p_email)) THEN
    RAISE EXCEPTION 'Ya existe un usuario con ese correo';
  END IF;

  v_uid := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    lower(p_email),
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
    jsonb_build_object('nombre', p_nombre),
    now(), now()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_uid,
    jsonb_build_object('sub', v_uid::text, 'email', lower(p_email)),
    'email', lower(p_email), now(), now(), now()
  );

  -- profile may have been created by trigger; upsert
  INSERT INTO public.profiles (id, nombre)
  VALUES (v_uid, p_nombre)
  ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

  -- replace default 'cliente' role with requested role
  DELETE FROM public.user_roles WHERE user_id = v_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, p_role);

  RETURN v_uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_staff_user(text, text, text, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_staff_user(text, text, text, public.app_role) TO authenticated;

-- Seed Oscar Silva (admin) if not exists
DO $$
DECLARE v_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'oscar.silva@tecnohelp.ni') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'oscar.silva@tecnohelp.ni',
      crypt('1234', gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
      jsonb_build_object('nombre','Oscar Silva'),
      now(), now()
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email','oscar.silva@tecnohelp.ni'),
      'email','oscar.silva@tecnohelp.ni', now(), now(), now());
    INSERT INTO public.profiles (id, nombre) VALUES (v_uid, 'Oscar Silva')
      ON CONFLICT (id) DO UPDATE SET nombre = 'Oscar Silva';
    DELETE FROM public.user_roles WHERE user_id = v_uid;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin');
  END IF;
END $$;
