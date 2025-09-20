-- Create enum types
CREATE TYPE public.library_category as ENUM ('tools', 'courses', 'codes', 'sources', 'datasets');
CREATE TYPE public.library_price as ENUM ('free', 'paid', 'freemium', 'subscription');

-- Create library_items table
CREATE TABLE public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category public.library_category NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    website_url TEXT,
    tags TEXT[] DEFAULT '{}',
    language TEXT,
    price public.library_price DEFAULT 'free',
    is_open_source BOOLEAN DEFAULT false,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create library_files table for attachments
CREATE TABLE public.library_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_library_items_category ON public.library_items(category);
CREATE INDEX idx_library_items_slug ON public.library_items(slug);
CREATE INDEX idx_library_items_created_at ON public.library_items(created_at);

-- Enable full-text search with pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_library_items_name_trgm ON public.library_items USING gin (name gin_trgm_ops);
CREATE INDEX idx_library_items_description_trgm ON public.library_items USING gin (short_description gin_trgm_ops);

-- Enable RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - public read, admin write
CREATE POLICY "Anyone can view library items" ON public.library_items
FOR SELECT USING (true);

CREATE POLICY "Anyone can view library files" ON public.library_files
FOR SELECT USING (true);

-- Note: Admin policies will be added separately once user roles are properly set up

-- Create storage bucket for bibliotecas
INSERT INTO storage.buckets (id, name, public) VALUES ('bibliotecas', 'bibliotecas', true);

-- Storage policies
CREATE POLICY "Anyone can view biblioteca files" ON storage.objects
FOR SELECT USING (bucket_id = 'bibliotecas');

-- Trigger for updated_at
CREATE TRIGGER update_library_items_updated_at
    BEFORE UPDATE ON public.library_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data
INSERT INTO public.library_items (category, name, slug, short_description, website_url, tags, language, price, is_open_source, attributes) VALUES
-- Tools
('tools', 'Python', 'python', 'Linguagem de programação versátil e poderosa', 'https://python.org', '{"programming", "data-science", "web-development"}', 'Python', 'free', true, '{"platforms": ["Windows", "macOS", "Linux"], "license": "PSF", "category": "Programming Language"}'),
('tools', 'Jupyter Notebook', 'jupyter-notebook', 'Ambiente interativo para ciência de dados', 'https://jupyter.org', '{"data-science", "notebook", "interactive"}', 'Python', 'free', true, '{"platforms": ["Web", "Desktop"], "license": "BSD", "category": "Development Environment"}'),

-- Courses  
('courses', 'Python para Ciência de Dados', 'python-data-science', 'Curso completo de Python aplicado à ciência de dados', 'https://coursera.org/python-ds', '{"python", "data-science", "machine-learning"}', 'Português', 'paid', false, '{"provider": "Coursera", "duration": "40 horas", "certificate": true, "mode": "online"}'),
('courses', 'Introdução ao R', 'intro-r', 'Fundamentos da linguagem R para análise estatística', 'https://edx.org/intro-r', '{"r", "statistics", "beginner"}', 'Português', 'free', false, '{"provider": "edX", "duration": "20 horas", "certificate": false, "mode": "online"}'),

-- Codes
('codes', 'pandas', 'pandas', 'Biblioteca Python para manipulação de dados', 'https://pandas.pydata.org', '{"python", "data-manipulation", "dataframes"}', 'Python', 'free', true, '{"status": "active", "version": "2.1.0", "dependencies": ["numpy"]}'),
('codes', 'ggplot2', 'ggplot2', 'Pacote R para visualização de dados elegante', 'https://ggplot2.tidyverse.org', '{"r", "visualization", "grammar-of-graphics"}', 'R', 'free', true, '{"status": "active", "version": "3.4.0", "dependencies": ["dplyr"]}'),

-- Sources
('sources', 'IBGE', 'ibge', 'Instituto Brasileiro de Geografia e Estatística', 'https://ibge.gov.br', '{"brasil", "censo", "estatisticas-oficiais"}', 'Português', 'free', false, '{"country": "Brasil", "sector": "Público", "theme": "Demografia", "license": "Aberta", "update_frequency": "Anual"}'),
('sources', 'World Bank Open Data', 'world-bank-data', 'Dados econômicos e sociais de países do mundo', 'https://data.worldbank.org', '{"economics", "global", "development"}', 'English', 'free', false, '{"country": "Global", "sector": "Internacional", "theme": "Economia", "license": "CC-BY", "update_frequency": "Trimestral"}'),

-- Datasets
('datasets', 'Censo Demográfico 2022', 'censo-demografico-2022', 'Dados do censo populacional brasileiro', 'https://censo2022.ibge.gov.br/dados', '{"brasil", "população", "censo"}', 'Português', 'free', false, '{"theme": "Demografia", "year": "2022", "format": "CSV", "variables": ["continuous", "discrete", "nominal"]}'),
('datasets', 'COVID-19 Brasil', 'covid-19-brasil', 'Série histórica de casos de COVID-19 no Brasil', 'https://covid.saude.gov.br', '{"covid", "saude", "epidemiologia"}', 'Português', 'free', false, '{"theme": "Saúde", "year": "2020-2024", "format": "JSON", "variables": ["continuous", "discrete", "ordinal"]}');