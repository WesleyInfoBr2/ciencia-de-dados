-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.organization_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE public.entitlement_status AS ENUM ('active', 'inactive', 'trial', 'expired');
CREATE TYPE public.wiki_post_type AS ENUM ('conteudo', 'como_fazer', 'aplicacao_pratica');
CREATE TYPE public.library_type AS ENUM ('ferramentas', 'formacoes', 'livros', 'codigos', 'bancos_dados');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    plan organization_plan DEFAULT 'free',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memberships table (user-organization relationships)
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    role app_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- Create products table (services catalog)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entitlements table (what orgs can access)
CREATE TABLE public.entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    status entitlement_status DEFAULT 'inactive',
    plan TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, product_id)
);

-- Create wiki_categories table
CREATE TABLE public.wiki_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wiki_posts table (community content)
CREATE TABLE public.wiki_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    post_type wiki_post_type NOT NULL,
    category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create libraries table (tools, courses, books, etc.)
CREATE TABLE public.libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    library_type library_type NOT NULL,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default products
INSERT INTO public.products (slug, name, description, base_url, is_public) VALUES
('estatistica-facil', 'Estatística Fácil', 'Ferramenta de análise estatística simplificada', 'https://a.cienciadedados.org', FALSE),
('rev-prisma', 'Rev Prisma', 'Análise de revisões e feedback', 'https://b.cienciadedados.org', FALSE),
('dados-brasil', 'Dados Brasil', 'Base de dados públicos brasileiros', 'https://c.cienciadedados.org', FALSE);

-- Insert default wiki categories
INSERT INTO public.wiki_categories (name, slug, description, icon) VALUES
('Conteúdos', 'conteudos', 'Artigos e materiais educacionais', 'BookOpen'),
('Como Fazer', 'como-fazer', 'Tutoriais e guias práticos', 'PlayCircle'),
('Aplicação Prática', 'aplicacao-pratica', 'Casos de uso e projetos reais', 'Target'),
('Ferramentas', 'ferramentas', 'Catálogo de ferramentas digitais', 'Wrench'),
('Formações', 'formacoes', 'Cursos e formações digitais', 'GraduationCap'),
('Livros', 'livros', 'Biblioteca de e-books e materiais', 'Book'),
('Códigos', 'codigos', 'Códigos e pacotes Python', 'Code'),
('Bancos de Dados', 'bancos-dados', 'Bases de dados públicas', 'Database');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role_in_org(_user_id UUID, _org_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.memberships 
  WHERE user_id = _user_id AND org_id = _org_id;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE user_id = _user_id AND org_id = _org_id
  );
$$;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.memberships WHERE org_id = id
  )
);

CREATE POLICY "Organization owners can update their orgs" ON public.organizations
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Memberships policies
CREATE POLICY "Users can view memberships of their orgs" ON public.memberships
FOR SELECT USING (
  public.is_org_member(auth.uid(), org_id) OR auth.uid() = user_id
);

CREATE POLICY "Org admins can manage memberships" ON public.memberships
FOR ALL USING (
  public.get_user_role_in_org(auth.uid(), org_id) IN ('owner', 'admin')
);

-- Products policies (public for catalog)
CREATE POLICY "Anyone can view public products" ON public.products
FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all products" ON public.products
FOR SELECT TO authenticated USING (true);

-- Entitlements policies
CREATE POLICY "Users can view entitlements of their orgs" ON public.entitlements
FOR SELECT USING (
  public.is_org_member(auth.uid(), org_id)
);

-- Wiki categories policies (public read)
CREATE POLICY "Anyone can view wiki categories" ON public.wiki_categories
FOR SELECT USING (true);

-- Wiki posts policies (public read, authenticated write)
CREATE POLICY "Anyone can view published wiki posts" ON public.wiki_posts
FOR SELECT USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create wiki posts" ON public.wiki_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON public.wiki_posts
FOR UPDATE USING (auth.uid() = author_id);

-- Libraries policies (public read)
CREATE POLICY "Anyone can view libraries" ON public.libraries
FOR SELECT USING (true);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wiki_posts_updated_at BEFORE UPDATE ON public.wiki_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON public.libraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();