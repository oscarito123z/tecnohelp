
GRANT SELECT ON public.servicios TO anon, authenticated;

DROP POLICY IF EXISTS "Servicios visibles para todos" ON public.servicios;
CREATE POLICY "Servicios visibles para todos"
  ON public.servicios FOR SELECT
  TO anon, authenticated
  USING (true);
