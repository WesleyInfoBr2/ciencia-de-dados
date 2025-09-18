-- Ajustar tipo da coluna content para garantir armazenamento correto de texto longo
-- e limpar dados corrompidos
ALTER TABLE wiki_posts ALTER COLUMN content TYPE text;

-- Remover post corrompido se existir
DELETE FROM wiki_posts WHERE slug = 'teste-artigo' AND LENGTH(content) > 50000;

-- Adicionar constraint para evitar conteúdo excessivamente longo (maior que 1MB)
ALTER TABLE wiki_posts ADD CONSTRAINT content_size_limit CHECK (LENGTH(content) <= 1048576);