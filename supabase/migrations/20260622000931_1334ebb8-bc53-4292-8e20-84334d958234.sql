
-- Wire handle_new_user trigger so signups get profile + cliente role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow technicians to view all reservations (already exists for tecnico/admin assigned).
-- Add an admin-wide UPDATE policy is already present. Just ensure admins can see all reservations even if not assigned.
DROP POLICY IF EXISTS "Admins ven todas las reservas" ON public.reservas;
CREATE POLICY "Admins ven todas las reservas" ON public.reservas
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Helper to read profiles for the admin panel (admin can see all profiles)
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.profiles;
CREATE POLICY "Admins ven todos los perfiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
