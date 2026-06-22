
-- Fix mutable search_path on auto_confirm_user
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$function$;

-- Revoke EXECUTE from public/anon/authenticated on trigger-only SECURITY DEFINER functions.
-- These run via triggers (owner context), not callable via Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user() FROM PUBLIC, anon, authenticated;

-- has_role() is intentionally callable by authenticated users because RLS policies invoke it.
-- Revoke from anon (no policy needs anon to evaluate it) and PUBLIC.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
