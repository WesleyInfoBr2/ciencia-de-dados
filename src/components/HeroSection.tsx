import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Zap } from "lucide-react";
import heroImage from "@/assets/hero-data-science.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  
  // Buscar contagem de usuários cadastrados
  const { data: usersCount } = useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error('Error fetching users count:', error);
        return 0;
      }
      return count || 0;
    }
  });

  // Buscar contagem de posts publicados
  const { data: postsCount } = useQuery({
    queryKey: ['wiki-posts-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('wiki_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      return count || 0;
    }
  });

  // Buscar contagem de itens de biblioteca
  const { data: libraryItemsCount } = useQuery({
    queryKey: ['library-items-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
            <Zap className="w-4 h-4 text-secondary mr-2" />
            <span className="text-sm font-medium text-secondary-foreground">
              Plataforma Brasileira de Ciência de Dados
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight drop-shadow-sm">
            Transforme Dados em{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-none">
              Conhecimento
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            Sua jornada na ciência de dados começa aqui. Conecte-se com uma comunidade vibrante, 
            aprenda com especialistas e acesse ferramentas que impulsionam sua carreira em dados.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={() => navigate('/wiki')}>
              Explore a Wiki
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" className="w-full sm:w-auto" onClick={() => navigate('/libraries')}>
              <BookOpen className="w-5 h-5" />
              Ver Biblioteca
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {usersCount !== undefined ? usersCount.toLocaleString('pt-BR') : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Membros Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {postsCount !== undefined ? postsCount.toLocaleString('pt-BR') : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Conteúdos Publicados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {libraryItemsCount !== undefined ? libraryItemsCount.toLocaleString('pt-BR') : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Ferramentas Catalogadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse delay-1000" />
    </section>
  );
};

export default HeroSection;