
-- Enum roles
CREATE TYPE public.app_role AS ENUM ('cliente', 'tecnico', 'admin');
CREATE TYPE public.reserva_estado AS ENUM ('pendiente', 'asignado', 'completado', 'cancelado');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  distrito TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuarios actualizan su propio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuarios crean su propio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Función security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Servicios (públicos)
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio_base NUMERIC(10,2) NOT NULL DEFAULT 400,
  icono TEXT NOT NULL DEFAULT 'wrench',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.servicios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicios TO authenticated;
GRANT ALL ON public.servicios TO service_role;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicios visibles para todos" ON public.servicios
  FOR SELECT TO anon, authenticated USING (activo = true);
CREATE POLICY "Admins gestionan servicios" ON public.servicios
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reservas
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES public.servicios(id),
  tecnico_id UUID REFERENCES auth.users(id),
  fecha_programada DATE NOT NULL,
  hora_programada TEXT NOT NULL,
  distrito TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono_contacto TEXT NOT NULL,
  descripcion_problema TEXT,
  precio_estimado NUMERIC(10,2),
  estado reserva_estado NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservas TO authenticated;
GRANT ALL ON public.reservas TO service_role;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes ven sus reservas" ON public.reservas
  FOR SELECT TO authenticated USING (auth.uid() = cliente_id);
CREATE POLICY "Tecnicos ven reservas asignadas" ON public.reservas
  FOR SELECT TO authenticated USING (auth.uid() = tecnico_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes crean reservas" ON public.reservas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Clientes actualizan sus reservas pendientes" ON public.reservas
  FOR UPDATE TO authenticated USING (auth.uid() = cliente_id AND estado IN ('pendiente'));
CREATE POLICY "Tecnicos y admins actualizan reservas" ON public.reservas
  FOR UPDATE TO authenticated USING (auth.uid() = tecnico_id OR public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reservas_updated_at BEFORE UPDATE ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger auto-create profile + cliente role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, telefono, distrito)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'distrito'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cliente');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Servicios iniciales
INSERT INTO public.servicios (nombre, descripcion, precio_base, icono) VALUES
  ('Mantenimiento Preventivo', 'Limpieza interna, optimización del sistema y revisión general de su computadora', 400, 'sparkles'),
  ('Reparación de Equipo', 'Diagnóstico y reparación de fallas en computadoras de escritorio y laptops', 600, 'wrench'),
  ('Formateo e Instalación', 'Formateo, instalación de Windows y programas esenciales', 700, 'hard-drive'),
  ('Configuración de Redes', 'Instalación de WiFi, configuración de routers e impresoras', 500, 'wifi'),
  ('Clases a Domicilio', 'Enseñanza personalizada de uso básico de computadora, internet y celular', 400, 'graduation-cap'),
  ('Asesoría Digital', 'Ayuda para configurar correo, WhatsApp, banca en línea y trámites digitales', 400, 'lightbulb');
