-- Função pública para contar todos os membros (sem restrição RLS)
CREATE OR REPLACE FUNCTION public.get_members_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.profiles;
$$;