-- Remove post_type requirement from wiki_posts table since we're using only categories
ALTER TABLE public.wiki_posts ALTER COLUMN post_type DROP NOT NULL;
ALTER TABLE public.wiki_posts ALTER COLUMN post_type SET DEFAULT 'conteudo';

-- Update existing posts to ensure they have a category if they don't already
UPDATE public.wiki_posts 
SET post_type = 'conteudo'
WHERE post_type IS NULL;