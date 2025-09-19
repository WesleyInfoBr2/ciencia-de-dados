-- Remover restrições existentes no campo content
ALTER TABLE wiki_posts DROP CONSTRAINT IF EXISTS wiki_posts_content_check;

-- Alterar campo content para JSONB para armazenar dados do ProseMirror
ALTER TABLE wiki_posts ALTER COLUMN content TYPE JSONB USING 
  CASE 
    WHEN content IS NULL OR content = '' THEN '{}'::JSONB
    WHEN content ~ '^[[:space:]]*[\{\[]' THEN content::JSONB
    ELSE json_build_object('type', 'doc', 'content', json_build_array(json_build_object('type', 'paragraph', 'content', json_build_array(json_build_object('type', 'text', 'text', content)))))::JSONB
  END;

-- Criar bucket para imagens do blog
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);

-- Políticas para o bucket blog
CREATE POLICY "Anyone can view blog images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog');

CREATE POLICY "Authenticated users can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog' AND auth.uid() IS NOT NULL);