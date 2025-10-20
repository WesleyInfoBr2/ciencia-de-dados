-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update products table with additional fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'development' CHECK (status IN ('development', 'beta', 'production', 'maintenance')),
ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
ADD COLUMN IF NOT EXISTS supabase_project_id TEXT,
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS launch_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{"free": {}, "limited": {}, "unlimited": {}}',
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;

-- Update RLS policies for products
DROP POLICY IF EXISTS "Anyone can view public products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;

CREATE POLICY "Anyone can view available products"
ON public.products
FOR SELECT
USING (is_public = true AND is_available = true);

CREATE POLICY "Authenticated users can view all public products"
ON public.products
FOR SELECT
USING (is_public = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial products data
INSERT INTO public.products (name, slug, description, base_url, status, is_public, is_available, custom_domain, launch_date)
VALUES 
  ('EstatísticaFácil', 'estatisticafacil', 'Análise estatística simplificada com IA para todos os níveis', '/produtos/estatisticafacil', 'development', true, false, 'estatisticafacil.cienciadedados.org', '2026-01-31'),
  ('RevPrisma', 'revprisma', 'Sistema completo para revisões sistemáticas seguindo diretrizes PRISMA', '/produtos/revprisma', 'development', true, false, 'revprisma.cienciadedados.org', '2026-01-31'),
  ('DadosBrasil', 'dadosbrasil', 'Acesso facilitado a dados públicos brasileiros', '/produtos/dadosbrasil', 'development', true, false, 'dadosbrasil.cienciadedados.org', '2026-01-31')
ON CONFLICT (slug) DO UPDATE
SET 
  status = EXCLUDED.status,
  is_available = EXCLUDED.is_available,
  custom_domain = EXCLUDED.custom_domain,
  launch_date = EXCLUDED.launch_date;

-- Create product_access table to control user access to products
CREATE TABLE IF NOT EXISTS public.product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('free', 'limited', 'unlimited')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, product_id)
);

-- Enable RLS on product_access
ALTER TABLE public.product_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_access
CREATE POLICY "Users can view their own product access"
ON public.product_access
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage product access"
ON public.product_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));