import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Calendar, User, Plus, FileText, HelpCircle, Lightbulb, Users, TrendingUp, Search as SearchIcon } from "lucide-react";
import Header from "@/components/Header";
import { WikiSearch } from "@/components/WikiSearch";
import { updatePageMetadata } from "@/utils/seo";

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
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL parameters
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedType = searchParams.get('type') || '';
  
  const [posts, setPosts] = useState<WikiPost[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalCategories: 0 });

  // Update URL when filters change
  const updateURL = (updates: Partial<{
    q: string;
    category: string;
    type: string;
  }>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    loadStats();
  }, [searchQuery, selectedCategory, selectedType]);

  useEffect(() => {
    // Update page metadata
    updatePageMetadata({
      title: searchQuery 
        ? `Busca: ${searchQuery} | Wiki | CiênciaDeDados.org`
        : 'Wiki | CiênciaDeDados.org',
      description: searchQuery
        ? `Resultados da busca por "${searchQuery}" na wiki de ciência de dados`
        : 'Base de conhecimento em ciência de dados. Artigos, tutoriais e guias práticos para profissionais e estudantes.',
      canonical: `https://cienciadedados.org/wiki${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
    });
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
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
          category_id,
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
        .eq('is_published', true);

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('wiki_categories.slug', selectedCategory);
      }

      // Apply post type filter
      if (selectedType) {
        query = query.eq('post_type', selectedType as 'conteudo' | 'como_fazer' | 'aplicacao_pratica');
      }

      // Order by relevance for search, otherwise by date
      if (searchQuery) {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('published_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategories([]);
    }
  };

  const loadStats = async () => {
    try {
      const [postsCount, categoriesCount] = await Promise.all([
        supabase
          .from('wiki_posts')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true),
        supabase
          .from('wiki_categories')
          .select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalPosts: postsCount.count || 0,
        totalCategories: categoriesCount.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
      'conteudo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'como_fazer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'aplicacao_pratica': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'FileText': FileText,
      'HelpCircle': HelpCircle,
      'Lightbulb': Lightbulb,
      'Users': Users,
      'TrendingUp': TrendingUp
    };
    
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleSearch = (query: string) => {
    updateURL({ q: query });
  };

  const handleCategoryFilter = (category: string) => {
    updateURL({ category: category === 'all' ? '' : category });
  };

  const handleTypeFilter = (type: string) => {
    updateURL({ type: type === 'all' ? '' : type });
  };

  const highlightSearchTerms = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{part}</mark> : 
        part
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-card rounded-lg p-8 mb-12 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Wiki CiênciaDeDados
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Base de conhecimento colaborativa em ciência de dados
            </p>
            
            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{stats.totalPosts} artigos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{stats.totalCategories} categorias</span>
              </div>
            </div>

            {user && (
              <div className="flex justify-center gap-4">
                <Link to="/wiki/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Artigo
                  </Button>
                </Link>
                <Link to="/wiki/import">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Importar Conteúdo
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <WikiSearch 
              onSearch={handleSearch}
              placeholder="Buscar artigos na wiki..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory || 'all'} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={selectedType || 'all'} onValueChange={handleTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
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

            {(searchQuery || selectedCategory || selectedType) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  updateURL({ q: '', category: '', type: '' });
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Active search/filter indicators */}
          {(searchQuery || selectedCategory || selectedType) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Busca: "{searchQuery}"
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary">
                  Categoria: {categories.find(c => c.slug === selectedCategory)?.name}
                </Badge>
              )}
              {selectedType && (
                <Badge variant="secondary">
                  Tipo: {getPostTypeLabel(selectedType)}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <section aria-labelledby="articles-heading">
              <h2 id="articles-heading" className="text-2xl font-bold mb-6">
                {searchQuery ? (
                  <>Resultados da busca "{searchQuery}" ({posts.length})</>
                ) : selectedCategory || selectedType ? (
                  <>Artigos filtrados ({posts.length})</>
                ) : (
                  <>Artigos recentes</>
                )}
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getPostTypeColor(post.post_type)}>
                              {getPostTypeLabel(post.post_type)}
                            </Badge>
                            {post.wiki_categories && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-sm" role="img" aria-label={post.wiki_categories.name}>
                                  {post.wiki_categories.icon}
                                </span>
                                <span className="text-xs">{post.wiki_categories.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          <Link 
                            to={`/wiki/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {highlightSearchTerms(post.title, searchQuery)}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                            {highlightSearchTerms(post.excerpt, searchQuery)}
                          </p>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{post.profiles?.full_name || post.profiles?.username || 'Autor'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <time dateTime={post.published_at || post.created_at}>
                                {formatDate(post.published_at || post.created_at)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum artigo encontrado'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? `Não encontramos artigos para "${searchQuery}". Tente outros termos de busca.`
                        : 'Ainda não há artigos publicados com esses filtros.'
                      }
                    </p>
                    {user && (
                      <Link to="/wiki/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar primeiro artigo
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories Section */}
            <section aria-labelledby="categories-heading" className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle id="categories-heading" className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Explorar por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.slug)}
                      className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${
                        selectedCategory === category.slug ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg" role="img" aria-label={category.name}>
                          {category.icon}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {category.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {categories.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma categoria disponível
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Quick Actions */}
            {user && (
              <section aria-labelledby="actions-heading">
                <Card>
                  <CardHeader>
                    <CardTitle id="actions-heading" className="text-base">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link to="/wiki/new" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Artigo
                      </Button>
                    </Link>
                    <Link to="/wiki/import" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <FileText className="h-4 w-4" />
                        Importar Conteúdo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wiki;