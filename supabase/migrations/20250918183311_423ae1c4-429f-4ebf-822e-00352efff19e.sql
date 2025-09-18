-- Criar bucket para imagens da wiki
INSERT INTO storage.buckets (id, name, public) VALUES ('wiki-images', 'wiki-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de imagens da wiki
-- Qualquer pessoa pode visualizar imagens
CREATE POLICY "Anyone can view wiki images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'wiki-images');

-- Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload wiki images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'wiki-images' AND auth.uid() IS NOT NULL);

-- Usuários podem atualizar suas próprias imagens
CREATE POLICY "Users can update their own wiki images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'wiki-images' AND auth.uid() IS NOT NULL);

-- Usuários podem deletar suas próprias imagens (opcional)
CREATE POLICY "Users can delete their own wiki images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'wiki-images' AND auth.uid() IS NOT NULL);