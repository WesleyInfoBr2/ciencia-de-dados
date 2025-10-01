-- Garantir que wiki_posts.content seja JSONB (não text)
ALTER TABLE wiki_posts
  ALTER COLUMN content TYPE jsonb
  USING (
    CASE 
      WHEN jsonb_typeof(content) IS NULL 
      THEN to_jsonb(content::text)
      ELSE content 
    END
  );