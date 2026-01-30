-- Fix overly permissive storage policies for wiki-images, blog, and wiki-files buckets
-- These policies currently allow ANY authenticated user to delete ANY file

-- =============================================
-- FIX wiki-images bucket policies
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own wiki images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own wiki images" ON storage.objects;

-- Users can only update their own images (based on owner field)
CREATE POLICY "Wiki images update own only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wiki-images' 
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Users can only delete their own images
CREATE POLICY "Wiki images delete own only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wiki-images' 
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- =============================================
-- FIX blog bucket policies  
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;

-- Users can only update their own blog images
CREATE POLICY "Blog images update own only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog'
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Users can only delete their own blog images
CREATE POLICY "Blog images delete own only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog'
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- =============================================
-- FIX wiki-files bucket policies
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can delete wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own wiki files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own wiki files" ON storage.objects;

-- Users can only update their own wiki files
CREATE POLICY "Wiki files update own only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wiki-files'
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Users can only delete their own wiki files
CREATE POLICY "Wiki files delete own only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wiki-files'
  AND (
    auth.uid() = owner
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);