-- Update wiki categories to only include the 3 main post categories
TRUNCATE TABLE wiki_categories RESTART IDENTITY CASCADE;

INSERT INTO wiki_categories (name, slug, description, icon, sort_order) VALUES
('Conteúdos', 'conteudos', 'Artigos conceituais e fundamentos teóricos', 'BookOpen', 1),
('Como Fazer', 'como-fazer', 'Tutoriais e guias práticos passo a passo', 'PlayCircle', 2),
('Aplicação Prática', 'aplicacao-pratica', 'Casos práticos e aplicações reais', 'Target', 3);

-- Create tools table for digital tools/software
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_free BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  website_url TEXT,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view tools
CREATE POLICY "Anyone can view tools" 
ON public.tools 
FOR SELECT 
USING (true);

-- Create courses table for educational content
CREATE TABLE public.educational_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT,
  duration TEXT,
  price TEXT DEFAULT 'Gratuito',
  access_url TEXT,
  status TEXT DEFAULT 'active',
  added_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on educational_courses
ALTER TABLE public.educational_courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view courses
CREATE POLICY "Anyone can view educational courses" 
ON public.educational_courses 
FOR SELECT 
USING (true);

-- Create code_packages table for code libraries/packages
CREATE TABLE public.code_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT NOT NULL, -- 'python' or 'r'
  description TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'active',
  added_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on code_packages
ALTER TABLE public.code_packages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view code packages
CREATE POLICY "Anyone can view code packages" 
ON public.code_packages 
FOR SELECT 
USING (true);

-- Create data_sources table for secondary data sources
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  documentation_url TEXT,
  example_data TEXT,
  access_method TEXT,
  observations TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on data_sources
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view data sources
CREATE POLICY "Anyone can view data sources" 
ON public.data_sources 
FOR SELECT 
USING (true);

-- Create updated_at triggers for all new tables
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_educational_courses_updated_at
  BEFORE UPDATE ON public.educational_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_packages_updated_at
  BEFORE UPDATE ON public.code_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();