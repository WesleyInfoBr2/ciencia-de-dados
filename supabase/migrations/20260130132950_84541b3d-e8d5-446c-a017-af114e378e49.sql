-- Remover políticas SELECT restritivas duplicadas/conflitantes
DROP POLICY IF EXISTS "Anyone can view published wiki posts" ON public.wiki_posts;
DROP POLICY IF EXISTS "Ler posts publicados" ON public.wiki_posts;
DROP POLICY IF EXISTS "Ler próprios rascunhos" ON public.wiki_posts;

-- Criar política PERMISSIVE unificada para SELECT
-- Permite: publicados (todos), próprios posts (autor), todos posts (admin)
CREATE POLICY "wiki_posts_select_policy"
ON public.wiki_posts
FOR SELECT
USING (
  is_published = true 
  OR auth.uid() = author_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);