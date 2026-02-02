import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Code, 
  Database, 
  GraduationCap, 
  Lightbulb, 
  Settings,
  Users,
  FileText,
  Wrench
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CommunitySection = () => {
  const navigate = useNavigate();
  
  // IDs das categorias da tabela wiki_categories
  const CATEGORY_IDS = {
    conteudos: '873cf439-428c-423a-948c-777176a379bb',
    comoFazer: '5713839b-67ca-4b14-bc91-c4c264e9ff68',
    aplicacaoPratica: 'bd44e5b6-b5f1-4cf0-9510-c11b4a26d30d'
  };

  // Buscar contagens por category_id (vinculado a wiki_categories)
  const { data: conteudoCount } = useQuery({
    queryKey: ['wiki-posts-conteudo'],
    queryFn: async () => {
      const { count } = await supabase
        .from('wiki_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('category_id', CATEGORY_IDS.conteudos);
      return count || 0;
    }
  });

  const { data: comoFazerCount } = useQuery({
    queryKey: ['wiki-posts-como-fazer'],
    queryFn: async () => {
      const { count } = await supabase
        .from('wiki_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('category_id', CATEGORY_IDS.comoFazer);
      return count || 0;
    }
  });

  const { data: aplicacaoPraticaCount } = useQuery({
    queryKey: ['wiki-posts-aplicacao-pratica'],
    queryFn: async () => {
      const { count } = await supabase
        .from('wiki_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('category_id', CATEGORY_IDS.aplicacaoPratica);
      return count || 0;
    }
  });

  // Buscar contagens por categoria de biblioteca
  const { data: toolsCount } = useQuery({
    queryKey: ['library-items-tools'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'tools');
      return count || 0;
    }
  });

  const { data: coursesCount } = useQuery({
    queryKey: ['library-items-courses'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'courses');
      return count || 0;
    }
  });

  const { data: codesCount } = useQuery({
    queryKey: ['library-items-codes'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'codes');
      return count || 0;
    }
  });

  const { data: sourcesCount } = useQuery({
    queryKey: ['library-items-sources'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'sources');
      return count || 0;
    }
  });

  const { data: datasetsCount } = useQuery({
    queryKey: ['library-items-datasets'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'datasets');
      return count || 0;
    }
  });

  const contentTypes = [
    {
      title: "Conteúdo",
      description: "Artigos e insights sobre ciência de dados",
      icon: FileText,
      count: conteudoCount,
      color: "text-blue-600",
      categorySlug: "conteudos"
    },
    {
      title: "Como Fazer",
      description: "Tutoriais práticos e guias passo a passo",
      icon: Lightbulb,
      count: comoFazerCount,
      color: "text-green-600",
      categorySlug: "como-fazer"
    },
    {
      title: "Aplicação Prática",
      description: "Cases reais e projetos implementados",
      icon: Settings,
      count: aplicacaoPraticaCount,
      color: "text-purple-600",
      categorySlug: "aplicacao-pratica"
    }
  ];

  const libraries = [
    {
      title: "Ferramentas Digitais",
      description: "Softwares e plataformas essenciais",
      icon: Wrench,
      count: toolsCount,
      category: "tools"
    },
    {
      title: "Formações Digitais",
      description: "Cursos e trilhas de aprendizagem",
      icon: GraduationCap,
      count: coursesCount,
      category: "courses"
    },
    {
      title: "Livros e Materiais",
      description: "E-books e recursos educacionais",
      icon: BookOpen,
      count: sourcesCount,
      category: "sources"
    },
    {
      title: "Códigos e Pacotes",
      description: "Bibliotecas Python e snippets úteis",
      icon: Code,
      count: codesCount,
      category: "codes"
    },
    {
      title: "Bancos de Dados",
      description: "Datasets públicos e bases de dados",
      icon: Database,
      count: datasetsCount,
      category: "datasets"
    }
  ];

  return (
    <section id="comunidade" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Users className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Comunidade Aberta</span>
          </div>
          
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Wiki da Comunidade
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Uma base de conhecimento colaborativa onde todos podem contribuir e aprender. 
            Acesse conteúdos gratuitos, publique seus próprios artigos e explore nossa biblioteca de recursos.
          </p>
        </div>

        {/* Content Types */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-8 text-center">
            Tipos de Conteúdo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contentTypes.map((type, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-elegant transition-smooth group cursor-pointer"
                onClick={() => navigate(`/wiki?category=${type.categorySlug}`)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-bounce">
                    <type.icon className={`w-6 h-6 ${type.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{type.title}</CardTitle>
                  <div className="text-sm text-secondary font-medium">
                    {type.count !== undefined ? `${type.count.toLocaleString('pt-BR')} ${type.count === 1 ? 'item' : 'itens'}` : '-'}
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resource Libraries */}
        <div className="mb-12">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-8 text-center">
            Bibliotecas de Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.map((library, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-elegant transition-smooth group cursor-pointer"
                onClick={() => navigate(`/libraries?category=${library.category}`)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                      <library.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{library.title}</CardTitle>
                      <div className="text-xs text-secondary font-medium">
                        {library.count !== undefined ? `${library.count.toLocaleString('pt-BR')} ${library.count === 1 ? 'item' : 'itens'}` : '-'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{library.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      </div>
    </section>
  );
};

export default CommunitySection;