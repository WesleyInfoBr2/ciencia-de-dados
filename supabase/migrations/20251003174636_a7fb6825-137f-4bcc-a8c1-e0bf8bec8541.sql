-- Converter wiki_posts.content para JSONB se ainda não for
-- Isso garante que o Postgres trate content como JSON nativo
ALTER TABLE wiki_posts 
  ALTER COLUMN content TYPE jsonb 
  USING (
    CASE 
      WHEN jsonb_typeof(content) IS NULL THEN to_jsonb(content::text)
      ELSE content
    END
  );

-- Adicionar comentário para documentar o formato esperado
COMMENT ON COLUMN wiki_posts.content IS 'ProseMirror document JSON format - must be valid JSON object with type:"doc" and content array';