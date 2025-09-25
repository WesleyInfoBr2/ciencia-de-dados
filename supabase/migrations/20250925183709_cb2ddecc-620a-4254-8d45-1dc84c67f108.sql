-- Add color column to wiki_categories table
ALTER TABLE public.wiki_categories 
ADD COLUMN color TEXT DEFAULT NULL;

-- Update existing categories with colors
UPDATE public.wiki_categories 
SET color = CASE 
  WHEN name = 'Conteúdo' THEN 'green'
  WHEN name = 'Como fazer' THEN 'yellow' 
  WHEN name = 'Aplicação prática' THEN 'red'
  ELSE 'gray'
END;