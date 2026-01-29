-- ============================================
-- HABILITAR RLS NA TABELA wiki_posts (se não existir)
-- ============================================
ALTER TABLE public.wiki_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Ler posts publicados" ON public.wiki_posts;
DROP POLICY IF EXISTS "Ler próprios rascunhos" ON public.wiki_posts;
DROP POLICY IF EXISTS "Atualizar próprio post" ON public.wiki_posts;
DROP POLICY IF EXISTS "Deletar próprio post" ON public.wiki_posts;
DROP POLICY IF EXISTS "Criar novo post" ON public.wiki_posts;

-- Política: Qualquer um pode ler posts publicados
CREATE POLICY "Ler posts publicados"
ON public.wiki_posts
FOR SELECT
USING (is_published = true);

-- Política: Usuários autenticados podem ler seus próprios rascunhos
CREATE POLICY "Ler próprios rascunhos"
ON public.wiki_posts
FOR SELECT
USING (auth.uid() = author_id);

-- Política: Apenas o autor pode atualizar seu próprio post
CREATE POLICY "Atualizar próprio post"
ON public.wiki_posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Política: Apenas o autor pode deletar seu próprio post
CREATE POLICY "Deletar próprio post"
ON public.wiki_posts
FOR DELETE
USING (auth.uid() = author_id);

-- Política: Usuários autenticados podem inserir posts
CREATE POLICY "Criar novo post"
ON public.wiki_posts
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- ============================================
-- TABELA DE CURTIDAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.wiki_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.wiki_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_fingerprint text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.wiki_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ler curtidas"
ON public.wiki_post_likes
FOR SELECT
USING (true);

CREATE POLICY "Curtir post"
ON public.wiki_post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Remover curtida"
ON public.wiki_post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TABELA DE COMENTÁRIOS (COM MODERAÇÃO)
-- ============================================
CREATE TABLE IF NOT EXISTS public.wiki_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.wiki_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.wiki_post_comments ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler comentários APROVADOS
CREATE POLICY "Ler comentários aprovados"
ON public.wiki_post_comments
FOR SELECT
USING (is_approved = true);

-- Autores dos posts podem ver todos os comentários dos seus posts (para moderação)
CREATE POLICY "Autor vê todos comentários do post"
ON public.wiki_post_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wiki_posts
    WHERE wiki_posts.id = wiki_post_comments.post_id
    AND wiki_posts.author_id = auth.uid()
  )
);

-- Admins podem ver todos os comentários
CREATE POLICY "Admin vê todos comentários"
ON public.wiki_post_comments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Usuários autenticados podem comentar
CREATE POLICY "Comentar como usuário"
ON public.wiki_post_comments
FOR INSERT
WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

-- Usuários podem editar seus próprios comentários
CREATE POLICY "Editar próprio comentário"
ON public.wiki_post_comments
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Usuários podem deletar seus próprios comentários
CREATE POLICY "Deletar próprio comentário"
ON public.wiki_post_comments
FOR DELETE
USING (auth.uid() = author_id);

-- Admins podem atualizar qualquer comentário (para aprovação)
CREATE POLICY "Admin atualiza comentários"
ON public.wiki_post_comments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar qualquer comentário
CREATE POLICY "Admin deleta comentários"
ON public.wiki_post_comments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGER: Aprovar automaticamente comentários de usuários cadastrados
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_approve_user_comments()
RETURNS trigger AS $$
BEGIN
  IF NEW.author_id IS NOT NULL THEN
    NEW.is_approved := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_auto_approve_user_comments ON public.wiki_post_comments;
CREATE TRIGGER trigger_auto_approve_user_comments
BEFORE INSERT ON public.wiki_post_comments
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_user_comments();

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_wiki_post_comments_updated_at ON public.wiki_post_comments;
CREATE TRIGGER update_wiki_post_comments_updated_at
BEFORE UPDATE ON public.wiki_post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABELA DE HISTÓRICO DE VERSÕES
-- ============================================
CREATE TABLE IF NOT EXISTS public.wiki_post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.wiki_posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb NOT NULL,
  excerpt text,
  tags text[],
  icon text,
  cover_image_url text,
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.wiki_post_versions ENABLE ROW LEVEL SECURITY;

-- Apenas o autor do post pode ver o histórico
CREATE POLICY "Ver histórico do próprio post"
ON public.wiki_post_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wiki_posts
    WHERE wiki_posts.id = wiki_post_versions.post_id
    AND wiki_posts.author_id = auth.uid()
  )
);

-- Apenas o autor pode inserir versões (via trigger)
CREATE POLICY "Criar versão do próprio post"
ON public.wiki_post_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wiki_posts
    WHERE wiki_posts.id = wiki_post_versions.post_id
    AND wiki_posts.author_id = auth.uid()
  )
);

-- ============================================
-- TRIGGER: Salvar versão automaticamente ao atualizar post
-- ============================================
CREATE OR REPLACE FUNCTION public.save_post_version()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.wiki_post_versions (
    post_id,
    title,
    content,
    excerpt,
    tags,
    icon,
    cover_image_url,
    edited_by
  ) VALUES (
    OLD.id,
    OLD.title,
    OLD.content,
    OLD.excerpt,
    OLD.tags,
    OLD.icon,
    OLD.cover_image_url,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_save_post_version ON public.wiki_posts;
CREATE TRIGGER trigger_save_post_version
BEFORE UPDATE ON public.wiki_posts
FOR EACH ROW
WHEN (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title)
EXECUTE FUNCTION public.save_post_version();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wiki_post_likes_post_id ON public.wiki_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_wiki_post_likes_user_id ON public.wiki_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_post_comments_post_id ON public.wiki_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_wiki_post_comments_approved ON public.wiki_post_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_wiki_post_versions_post_id ON public.wiki_post_versions(post_id);