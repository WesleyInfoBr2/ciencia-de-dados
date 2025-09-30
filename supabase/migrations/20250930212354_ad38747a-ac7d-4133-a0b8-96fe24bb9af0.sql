-- Add new columns to wiki_posts for Notion-like features
ALTER TABLE wiki_posts
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS properties jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reading_time int;

-- Create wiki_revisions table for version history
CREATE TABLE IF NOT EXISTS wiki_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES wiki_posts(id) ON DELETE CASCADE NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on wiki_revisions
ALTER TABLE wiki_revisions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view revisions of published posts
CREATE POLICY "Anyone can view revisions of published posts"
ON wiki_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM wiki_posts 
    WHERE wiki_posts.id = wiki_revisions.post_id 
    AND (wiki_posts.is_published = true OR wiki_posts.author_id = auth.uid())
  )
);

-- Policy: Authors can create revisions of their posts
CREATE POLICY "Authors can create revisions"
ON wiki_revisions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM wiki_posts 
    WHERE wiki_posts.id = wiki_revisions.post_id 
    AND wiki_posts.author_id = auth.uid()
  )
);

-- Create trigram indexes for search
CREATE INDEX IF NOT EXISTS idx_wiki_title_trgm ON wiki_posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_wiki_excerpt_trgm ON wiki_posts USING gin (excerpt gin_trgm_ops);