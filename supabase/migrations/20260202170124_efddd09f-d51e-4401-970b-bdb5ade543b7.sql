-- Atualiza função para adicionar +10 ao total de membros
CREATE OR REPLACE FUNCTION public.get_members_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (COUNT(*) + 10)::INTEGER FROM public.profiles;
$$;