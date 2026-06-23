
DROP POLICY IF EXISTS "Tecnicos ven reservas asignadas" ON public.reservas;
DROP POLICY IF EXISTS "Tecnicos y admins actualizan reservas" ON public.reservas;

CREATE POLICY "Staff ven todas las reservas"
  ON public.reservas FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Staff actualizan reservas"
  ON public.reservas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));
