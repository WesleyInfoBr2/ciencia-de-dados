import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { BookOpen, Calendar, User, Plus, FileText, Users, Search as SearchIcon, Filter, X, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { WikiSearch } from "@/components/WikiSearch";
import { updatePageMetadata } from "@/utils/seo";
import { getCategoryEmoji } from "@/lib/categoryIcons";
import cienciaDadosVenn from "@/assets/ciencia-dados-venn.png";

interface WikiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
  };
  wiki_categories: {
    name: string;
    slug: string;
    icon: string;
    color: string;
  } | null;
}

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

const ITEMS_PER_PAGE = 15;

const Wiki = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL parameters
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sortOrder = searchParams.get('sort') || 'alpha_asc';
  const showOnlyMine = searchParams.get('mine') === 'true';
  
  const [posts, setPosts] = useState<WikiPost[]>([]);
  const [myDrafts, setMyDrafts] = useState<WikiPost[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyDrafts, setLoadingMyDrafts] = useState(false);
  const [stats, setStats] = useState({ totalPosts: 0, totalCategories: 0 });
  
  // Collapsible states
  const [draftsOpen, setDraftsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Carousel page
  const [currentPage, setCurrentPage] = useState(0);

  // Update URL when filters change
  const updateURL = (updates: Partial<{
    q: string;
    category: string;
    tags: string;
    sort: string;
    mine: string;
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
    fetchAvailableTags();
  }, [searchQuery, selectedCategory, selectedTags.join(','), sortOrder, showOnlyMine, user?.id]);

  // Fetch user's drafts separately
  useEffect(() => {
    if (user) {
      fetchMyDrafts();
    } else {
      setMyDrafts([]);
    }
  }, [user]);
  
  // Reset carousel page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory, selectedTags.join(','), sortOrder, showOnlyMine]);

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
          category_id,
          tags,
          reading_time,
          profiles!wiki_posts_author_id_fkey (
            full_name,
            username
          ),
          wiki_categories (
            name,
            slug,
            icon,
            color
          ),
          wiki_post_likes (
            id
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

      // Apply tags filter
      if (selectedTags.length > 0) {
        query = query.overlaps('tags', selectedTags);
      }
      
      // Apply "my articles" filter
      if (showOnlyMine && user) {
        query = query.eq('author_id', user.id);
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;
      
      // Sort based on selected order
      let sortedData = data || [];
      if (sortOrder === 'alpha_asc') {
        sortedData = sortedData.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      } else if (sortOrder === 'alpha_desc') {
        sortedData = sortedData.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR'));
      } else if (sortOrder === 'recent') {
        sortedData = sortedData.sort((a, b) => 
          new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()
        );
      } else if (sortOrder === 'popular') {
        sortedData = sortedData.sort((a, b) => 
          ((b as any).wiki_post_likes?.length || 0) - ((a as any).wiki_post_likes?.length || 0)
        );
      } else if (sortOrder === 'relevant') {
        sortedData = sortedData.sort((a, b) => {
          const aLikes = (a as any).wiki_post_likes?.length || 0;
          const bLikes = (b as any).wiki_post_likes?.length || 0;
          const aReading = (a as any).reading_time || 0;
          const bReading = (b as any).reading_time || 0;
          const aScore = aLikes * 10 + aReading;
          const bScore = bLikes * 10 + bReading;
          return bScore - aScore;
        });
      }
      
      setPosts(sortedData);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_posts')
        .select('tags')
        .eq('is_published', true);

      if (error) throw error;

      const allTags = (data || []).flatMap(post => post.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    }
  };

  // Buscar apenas rascunhos do usuário logado
  const fetchMyDrafts = async () => {
    if (!user) return;
    
    setLoadingMyDrafts(true);
    try {
      const { data, error } = await supabase
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
          category_id,
          profiles!wiki_posts_author_id_fkey (
            full_name,
            username
          ),
          wiki_categories (
            name,
            slug,
            icon,
            color
          )
        `)
        .eq('author_id', user.id)
        .eq('is_published', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMyDrafts(data || []);
    } catch (error) {
      console.error('Erro ao buscar meus rascunhos:', error);
      setMyDrafts([]);
    } finally {
      setLoadingMyDrafts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_categories')
        .select('id, name, slug, description, icon, color, sort_order')
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

  const getCategoryColor = (color?: string) => {
    const colorMap: Record<string, string> = {
      'green': 'border-green-500 bg-green-50 dark:bg-green-950',
      'yellow': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950', 
      'red': 'border-red-500 bg-red-50 dark:bg-red-950'
    };
    return colorMap[color || ''] || 'border-muted bg-muted/20';
  };


  const handleSearch = (query: string) => {
    updateURL({ q: query });
  };

  const handleCategoryFilter = (category: string) => {
    updateURL({ category: category === 'all' ? '' : category });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    updateURL({ tags: newTags.join(',') });
  };

  const handleSortChange = (sort: string) => {
    updateURL({ sort });
  };

  const clearFilters = () => {
    updateURL({ category: '', tags: '', mine: '' });
  };
  
  const handleMyArticlesToggle = (checked: boolean) => {
    updateURL({ mine: checked ? 'true' : '' });
  };
  
  // Pagination for carousel
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedPosts = posts.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

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
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Wiki CiênciaDeDados
            </h1>
            
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
          <div className="max-w-2xl mx-auto mb-8">
            <WikiSearch 
              onSearch={handleSearch}
              placeholder="Buscar artigos na wiki..."
            />
          </div>

          {/* Sobre a Wiki */}
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              A wiki CiênciadeDados.org é um projeto que iniciou de forma solitária, mas com expectativas ambiciosas. A ideia do projeto se baseia no princípio da colaboração, cooperação.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <h3 className="font-semibold text-primary mb-2">Missão</h3>
                <p className="text-sm text-muted-foreground">
                  Manter um ambiente colaborativo, em formato wiki, para compartilhamento de conhecimentos relacionados ao campo de conhecimento da Ciência de Dados
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <h3 className="font-semibold text-primary mb-2">Visão</h3>
                <p className="text-sm text-muted-foreground">
                  O conhecimento só é válido quando é compartilhado
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Estatisticar (liberdade poética para descrever atividades relacionadas ao processo de coletar, organizar, descrever, analisar e interpretar dados com o objetivo de facilitar a tomada de decisão) pode parecer uma atribuição destinada a poucos escolhidos, passado de geração em geração, em rituais repletos de referências ao grande Mago Gauss. Mas não se engane, toda esta cerimônia é apenas uma livre inspiração em sociedades secretas para parecermos mais pomposos do que somos na realidade.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Facilitar a tomada de decisão com base na análise de dados implica no uso de um conjunto de ferramentas que estão à disposição de quase todos os mortais. Na verdade, a parte mais difícil do dia é saber qual ferramenta usar. Para este problema também tem-se uma solução: a informação. Quanto mais informações são compartilhadas e criticadas, mais conhecimento é criado e difundido.
            </p>

            <p className="text-muted-foreground leading-relaxed font-medium">
              Conseguir transformar dados em informações facilita o processo de tomar decisão, gerando valor nas organizações e na sociedade.
            </p>

            {/* Seção Ciência de Dados como área */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-bold mb-4 text-foreground">Ciência de Dados como área de conhecimento</h2>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    O mercado tem demonstrado grande interesse em profissionais que consigam analisar dados com a apropriação de recursos estatísticos e computacionais, além de conseguir transformar em conhecimento estratégico para a organização. Esta relação entre as áreas de Estatística, Computação e Negócios, que evidencia a riqueza do profissional de Ciência de Dados, também causa confusões entre os profissionais das áreas compartilhadas.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Existem vários grupos discutindo ao redor do mundo sobre a função do Cientista de Dados e quem seria o "dono" do conhecimento.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Independente destas discussões, estatística e computação (como áreas de conhecimento) combinam esforços e dão propósito para o que antes era feito, prioritariamente, pelos estatísticos: levar inteligência de negócio para organizações dos diversos ramos.
                  </p>
                </div>
                <div className="md:w-64 flex-shrink-0">
                  <img 
                    src={cienciaDadosVenn} 
                    alt="Diagrama de Venn mostrando a interseção entre Estatística, Computação e Negócios formando a Ciência de Dados"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-8">
          {/* Main Content - Full Width */}
            
            {/* Seção Meus Rascunhos - apenas para usuário logado */}
            {user && myDrafts.length > 0 && (
              <Collapsible open={draftsOpen} onOpenChange={setDraftsOpen}>
                <section aria-labelledby="my-drafts-heading" className="bg-card rounded-lg p-6 shadow-sm">
                  <CollapsibleTrigger className="flex items-center justify-between w-full mb-4 cursor-pointer hover:opacity-80">
                    <h2 id="my-drafts-heading" className="text-xl font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-500" />
                      Meus Rascunhos
                      <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600">
                        {myDrafts.length}
                      </Badge>
                    </h2>
                    {draftsOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    {loadingMyDrafts ? (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-64 flex-shrink-0 rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {myDrafts.map((post) => (
                          <Link
                            key={post.id}
                            to={`/wiki/${post.slug}`}
                            className="flex-shrink-0 w-64 p-4 rounded-lg border-l-4 transition-all hover:shadow-md bg-amber-50 dark:bg-amber-950/30 border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-medium text-sm line-clamp-2 flex-1">{post.title}</h3>
                              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1 bg-amber-500"></span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(post.created_at)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </section>
              </Collapsible>
            )}

            {/* Filtros por Categoria e Tags */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <section className="bg-card rounded-lg p-6 shadow-sm">
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-4 cursor-pointer hover:opacity-80">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros
                  </h2>
                  <div className="flex items-center gap-2">
                    {(selectedCategory || selectedTags.length > 0 || showOnlyMine) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); clearFilters(); }} 
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    )}
                    {filtersOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4">
                  {/* Meus artigos checkbox + Categorias */}
                  <div>
                    <div className="flex items-center gap-6 mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                      {user && (
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="my-articles" 
                            checked={showOnlyMine}
                            onCheckedChange={(checked) => handleMyArticlesToggle(checked as boolean)}
                          />
                          <label 
                            htmlFor="my-articles" 
                            className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            Meus artigos
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={!selectedCategory ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => handleCategoryFilter('all')}
                      >
                        Todas
                      </Badge>
                      {categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.slug ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/20"
                          onClick={() => handleCategoryFilter(category.slug)}
                        >
                          <span className="mr-1">{getCategoryEmoji(category.icon)}</span>
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {availableTags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.slice(0, 20).map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/20 text-xs"
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {availableTags.length > 20 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{availableTags.length - 20} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filtros ativos */}
                  {(selectedCategory || selectedTags.length > 0 || showOnlyMine) && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">Filtros ativos: </span>
                      {showOnlyMine && (
                        <Badge variant="secondary" className="text-xs mx-1">
                          Meus artigos
                        </Badge>
                      )}
                      {selectedCategory && (
                        <Badge variant="secondary" className="text-xs mx-1">
                          {categories.find(c => c.slug === selectedCategory)?.name}
                        </Badge>
                      )}
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs mx-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Artigos */}
            <section aria-labelledby="articles-heading">
              <div className="flex items-center justify-between mb-6">
                <h2 id="articles-heading" className="text-2xl font-bold">
                  {searchQuery ? (
                    <>Resultados da busca "{searchQuery}" ({posts.length})</>
                  ) : selectedCategory || selectedTags.length > 0 || showOnlyMine ? (
                    <>Artigos filtrados ({posts.length})</>
                  ) : (
                    <>Artigos ({posts.length})</>
                  )}
                </h2>

                {/* Ordenação */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortOrder} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha_asc">Ordem alfabética (A-Z)</SelectItem>
                      <SelectItem value="alpha_desc">Ordem alfabética (Z-A)</SelectItem>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="relevant">Mais relevantes</SelectItem>
                      <SelectItem value="popular">Mais curtidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="space-y-6">
                  {/* Carousel */}
                  <Carousel className="w-full" opts={{ align: "start", loop: false }}>
                    <CarouselContent className="-ml-4">
                      {paginatedPosts.map((post) => (
                        <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className={`group hover:shadow-lg transition-all duration-200 border-l-4 h-full ${getCategoryColor(post.wiki_categories?.color)} hover:border-l-primary`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  {post.wiki_categories && (
                                    <Badge variant="secondary" className={getCategoryColor(post.wiki_categories.color).replace('border-l-4', '').replace('hover:border-l-primary', '')}>
                                      <span className="mr-1">{getCategoryEmoji(post.wiki_categories.icon)}</span>
                                      {post.wiki_categories.name}
                                    </Badge>
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
                                    <span className="truncate max-w-[100px]">{post.profiles?.full_name || post.profiles?.username || 'Autor'}</span>
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
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {paginatedPosts.length > 3 && (
                      <>
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                      </>
                    )}
                  </Carousel>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(i)}
                          >
                            {i + 1}
                          </Button>
                        )).slice(
                          Math.max(0, currentPage - 2),
                          Math.min(totalPages, currentPage + 3)
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                      >
                        Próxima
                      </Button>
                      <span className="text-sm text-muted-foreground ml-2">
                        {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, posts.length)} de {posts.length}
                      </span>
                    </div>
                  )}
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
      </main>
    </div>
  );
};

export default Wiki;