import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, BookOpen, Users, TrendingUp, PlayCircle, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface WikiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  post_type: string;
  profiles: {
    full_name: string;
    username: string;
  };
  wiki_categories: {
    name: string;
    slug: string;
    icon: string;
  } | null;
}

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const Wiki = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<WikiPost[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, selectedType, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('wiki_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        author_id,
        is_published,
        published_at,
        created_at,
        post_type,
        profiles!wiki_posts_author_id_fkey (
          full_name,
          username
        ),
        wiki_categories (
          name,
          slug,
          icon
        )
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedType !== "all") {
      query = query.eq('post_type', selectedType as 'conteudo' | 'como_fazer' | 'aplicacao_pratica');
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('wiki_categories')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'conteudo': 'Conteúdo',
      'como_fazer': 'Como fazer',
      'aplicacao_pratica': 'Aplicação prática'
    };
    return types[type] || type;
  };

  const getPostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'conteudo': 'bg-blue-100 text-blue-800',
      'como_fazer': 'bg-green-100 text-green-800',
      'aplicacao_pratica': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="h-5 w-5" />;
      case 'PlayCircle':
        return <PlayCircle className="h-5 w-5" />;
      case 'Target':
        return <Target className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Wiki Ciência de Dados</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Sua fonte completa de conhecimento em ciência de dados, análise e inteligência artificial
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">{posts.length} Artigos</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{categories.length} Categorias</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">Em crescimento</span>
            </div>
          </div>

          {user && (
            <div className="flex gap-2">
              <Link to="/wiki/import">
                <Button variant="outline" size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Importar Conteúdo
                </Button>
              </Link>
              <Link to="/wiki/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Artigo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.icon)}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="conteudo">Conteúdo</SelectItem>
                <SelectItem value="como_fazer">Como fazer</SelectItem>
                <SelectItem value="aplicacao_pratica">Aplicação prática</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Explorar por Categoria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getCategoryIcon(category.icon)}
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory !== "all" || selectedType !== "all" || searchTerm 
                ? "Resultados da Busca" 
                : "Artigos Recentes"
              }
            </h2>
            {posts.length > 0 && (
              <span className="text-muted-foreground">
                {posts.length} {posts.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedType !== "all"
                    ? "Tente ajustar os filtros ou termos de busca."
                    : "Ainda não há artigos publicados na wiki."}
                </p>
                {user && (
                  <Link to="/wiki/new">
                    <Button>Criar Primeiro Artigo</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getPostTypeColor(post.post_type)}>
                        {getPostTypeLabel(post.post_type)}
                      </Badge>
                      {post.wiki_categories && (
                        <span className="text-lg" title={post.wiki_categories.name}>
                          {post.wiki_categories.icon}
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link 
                        to={`/wiki/${post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        por {post.profiles?.full_name || post.profiles?.username || 'Usuário'}
                      </span>
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Wiki;