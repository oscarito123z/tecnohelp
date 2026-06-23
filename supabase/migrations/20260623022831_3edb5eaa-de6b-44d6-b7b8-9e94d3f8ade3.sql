
-- 1. Rename servicios to friendlier labels
UPDATE public.servicios SET nombre = 'Mantenimiento'        WHERE nombre = 'Mantenimiento Preventivo';
UPDATE public.servicios SET nombre = 'Reparación'           WHERE nombre = 'Reparación de Equipo';
UPDATE public.servicios SET nombre = 'Formateo'             WHERE nombre = 'Formateo e Instalación';
UPDATE public.servicios SET nombre = 'Redes y WiFi'         WHERE nombre = 'Configuración de Redes';
UPDATE public.servicios SET nombre = 'Clases a domicilio'   WHERE nombre = 'Clases a Domicilio';
UPDATE public.servicios SET nombre = 'Asesoría digital'     WHERE nombre = 'Asesoría Digital';

-- 2. Seed master admin "Oscar Silva"
DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'oscar.silva@tecnohelp.ni';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'oscar.silva@tecnohelp.ni',
      crypt('1234', gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
      jsonb_build_object('nombre','Oscar Silva'),
      now(), now()
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email','oscar.silva@tecnohelp.ni'),
      'email', 'oscar.silva@tecnohelp.ni', now(), now(), now()
    );
  END IF;

  INSERT INTO public.profiles (id, nombre)
  VALUES (v_uid, 'Oscar Silva')
  ON CONFLICT (id) DO UPDATE SET nombre = 'Oscar Silva';

  DELETE FROM public.user_roles WHERE user_id = v_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin');
END $$;
