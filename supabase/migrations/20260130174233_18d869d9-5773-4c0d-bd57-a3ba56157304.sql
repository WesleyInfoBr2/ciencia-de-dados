-- Create storage bucket for wiki file attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('wiki-files', 'wiki-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to wiki files
CREATE POLICY "Public can read wiki files"
ON storage.objects FOR SELECT
USING (bucket_id = 'wiki-files');

-- Allow authenticated users to upload wiki files
CREATE POLICY "Authenticated users can upload wiki files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wiki-files' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete wiki files"
ON storage.objects FOR DELETE
USING (bucket_id = 'wiki-files' AND auth.role() = 'authenticated');