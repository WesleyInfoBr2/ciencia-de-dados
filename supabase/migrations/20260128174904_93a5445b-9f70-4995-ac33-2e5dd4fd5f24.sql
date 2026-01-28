-- Drop existing table to recreate with proper structure
-- First, backup any existing data by selecting into temp if needed
DROP TABLE IF EXISTS library_files CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;

-- Create library_items table with proper structure
CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campos comuns (todas as categorias)
  category TEXT NOT NULL CHECK (category IN ('tools', 'courses', 'codes', 'sources', 'datasets')),
  name TEXT NOT NULL,
  short_description TEXT,
  website_url TEXT,
  price TEXT NOT NULL DEFAULT 'free' CHECK (price IN ('free', 'paid', 'freemium', 'subscription')),
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  slug TEXT NOT NULL UNIQUE,
  
  -- Campos específicos para codes (armazenados em atributos JSONB)
  language TEXT, -- Também usado para sources como idioma
  is_open_source BOOLEAN DEFAULT false,
  
  -- Atributos específicos por categoria (JSONB flexível)
  attributes JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create library_files table for datasets attachments
CREATE TABLE public.library_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_library_items_category ON public.library_items(category);
CREATE INDEX idx_library_items_slug ON public.library_items(slug);
CREATE INDEX idx_library_items_featured ON public.library_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_library_items_tags ON public.library_items USING GIN(tags);
CREATE INDEX idx_library_items_attributes ON public.library_items USING GIN(attributes);
CREATE INDEX idx_library_files_item ON public.library_files(library_item_id);

-- Enable RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for library_items (public read)
CREATE POLICY "Anyone can view library items"
  ON public.library_items
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage library items"
  ON public.library_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for library_files (public read)
CREATE POLICY "Anyone can view library files"
  ON public.library_files
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage library files"
  ON public.library_files
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_library_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_library_items_timestamp
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW
  EXECUTE FUNCTION update_library_items_updated_at();

-- Create storage bucket for library files (datasets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'library-files', 
  'library-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/octet-stream', 'application/x-spss-sav', 'application/x-stata-dta']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for library-files bucket
CREATE POLICY "Anyone can view library files storage"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'library-files');

CREATE POLICY "Admins can upload library files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update library files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete library files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'::app_role));