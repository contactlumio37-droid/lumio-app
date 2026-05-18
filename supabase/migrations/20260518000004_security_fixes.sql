-- Fix: update_updated_at — search_path fixe pour éviter l'injection
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = '';

-- Fix: auth_uid helper — search_path fixe
CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE
SECURITY INVOKER
SET search_path = '';

-- Fix: rls_auto_enable — révoquer l'accès public à cette fonction SECURITY DEFINER pré-existante
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
