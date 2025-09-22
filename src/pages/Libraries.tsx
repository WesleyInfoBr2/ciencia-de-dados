import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { LibraryCard } from "@/components/LibraryCard";
import { LibraryFilters } from "@/components/LibraryFilters";
import { LibraryImport } from "@/components/LibraryImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Upload, X, ChevronLeft, ChevronRight, Wrench, GraduationCap, Code, Database, BarChart3 } from "lucide-react";
import { updatePageMetadata } from "@/utils/seo";
import type { Database as DB } from "@/integrations/supabase/types";

type LibraryItem = DB['public']['Tables']['library_items']['Row'];
type LibraryCategory = DB['public']['Enums']['library_category'];

interface LibraryFilters {
  [key: string]: string[];
}

interface PaginationCursor {
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

const CATEGORIES = [
  { id: 'tools' as LibraryCategory, label: 'Ferramentas Digitais', icon: Wrench },
  { id: 'courses' as LibraryCategory, label: 'Formações Digitais', icon: GraduationCap },
  { id: 'codes' as LibraryCategory, label: 'Códigos e Pacotes', icon: Code },
  { id: 'sources' as LibraryCategory, label: 'Fontes de Dados', icon: Database },
  { id: 'datasets' as LibraryCategory, label: 'Bases de Dados', icon: BarChart3 }
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "recent", label: "Mais Recentes" },
  { value: "name", label: "Nome A-Z" }
];

const Libraries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Parse URL parameters
  const activeTab = (searchParams.get('tab') as LibraryCategory) || 'tools';
  const searchTerm = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'relevance';
  const cursor = searchParams.get('cursor') || '';
  const direction = searchParams.get('direction') || 'next';
  
  // Parse filters from URL
  const getFiltersFromURL = (): LibraryFilters => {
    const filtersParam = searchParams.get('filters');
    if (!filtersParam) return {};
    
    try {
      return JSON.parse(atob(filtersParam));
    } catch {
      return {};
    }
  };

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<LibraryCategory, number>>({
    tools: 0,
    courses: 0,
    codes: 0,
    sources: 0,
    datasets: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LibraryFilters>(getFiltersFromURL());
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pagination, setPagination] = useState<PaginationCursor>({
    hasNext: false,
    hasPrev: false
  });

  // Update URL when state changes
  const updateURL = (updates: Partial<{
    tab: LibraryCategory;
    q: string;
    sort: string;
    cursor: string;
    direction: string;
    filters: LibraryFilters;
  }>) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.tab !== undefined) {
      if (updates.tab === 'tools') {
        newParams.delete('tab');
      } else {
        newParams.set('tab', updates.tab);
      }
    }
    
    if (updates.q !== undefined) {
      if (updates.q === '') {
        newParams.delete('q');
      } else {
        newParams.set('q', updates.q);
      }
    }
    
    if (updates.sort !== undefined) {
      if (updates.sort === 'relevance') {
        newParams.delete('sort');
      } else {
        newParams.set('sort', updates.sort);
      }
    }
    
    if (updates.cursor !== undefined) {
      if (updates.cursor === '') {
        newParams.delete('cursor');
        newParams.delete('direction');
      } else {
        newParams.set('cursor', updates.cursor);
        newParams.set('direction', updates.direction || 'next');
      }
    }
    
    if (updates.filters !== undefined) {
      const hasFilters = Object.keys(updates.filters).some(key => updates.filters[key].length > 0);
      if (hasFilters) {
        newParams.set('filters', btoa(JSON.stringify(updates.filters)));
      } else {
        newParams.delete('filters');
      }
    }
    
    setSearchParams(newParams);
  };

  // Load item counts for tabs
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const promises = CATEGORIES.map(async (category) => {
          const { count } = await supabase
            .from('library_items')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.id);
          return { category: category.id, count: count || 0 };
        });
        
        const results = await Promise.all(promises);
        const counts = results.reduce((acc, { category, count }) => {
          acc[category as LibraryCategory] = count;
          return acc;
        }, {} as Record<LibraryCategory, number>);
        
        setItemCounts(counts);
      } catch (error) {
        console.error('Erro ao carregar contadores:', error);
      }
    };
    
    loadCounts();
  }, []);

  // Load items when parameters change
  useEffect(() => {
    fetchItems();
  }, [activeTab, searchTerm, sortBy, filters, cursor, direction]);

  const fetchItems = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('library_items')
        .select('*')
        .eq('category', activeTab);

      // Apply search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
      }

      // Apply filters based on category
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (key === 'is_open_source') {
            query = query.eq('is_open_source', values.includes('true'));
          } else if (key === 'price') {
            query = query.in('price', values as ('free' | 'paid' | 'freemium' | 'subscription')[]);
          } else if (key === 'language') {
            query = query.in('language', values);
          } else if (key === 'tags') {
            query = query.overlaps('tags', values);
          } else {
            // Handle JSONB attributes filters
            values.forEach(value => {
              query = query.contains('attributes', { [key]: value });
            });
          }
        }
      });

      // Apply sorting
      switch (sortBy) {
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        default: // relevance
          if (searchTerm) {
            // For search relevance, we could implement a more sophisticated scoring
            query = query.order('name', { ascending: true });
          } else {
            query = query.order('created_at', { ascending: false });
          }
      }

      // Apply pagination cursor
      const pageSize = 12;
      if (cursor) {
        if (direction === 'next') {
          query = query.gt('created_at', cursor);
        } else {
          query = query.lt('created_at', cursor);
          query = query.order('created_at', { ascending: true });
        }
      }
      
      query = query.limit(pageSize + 1); // +1 to check if there are more items

      const { data, error } = await query;

      if (error) throw error;

      // Handle pagination
      let items = data || [];
      const hasMore = items.length > pageSize;
      
      if (hasMore) {
        items = items.slice(0, pageSize);
      }

      // Reverse order if going backwards
      if (cursor && direction === 'prev') {
        items.reverse();
      }

      setItems(items);
      
      // Update pagination state
      setPagination({
        hasNext: hasMore && direction === 'next',
        hasPrev: !!cursor,
        nextCursor: hasMore && items.length > 0 ? items[items.length - 1].created_at : undefined,
        prevCursor: items.length > 0 ? items[0].created_at : undefined
      });

    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da biblioteca.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: LibraryCategory) => {
    updateURL({ 
      tab, 
      cursor: '', 
      direction: 'next',
      // Keep filters when switching tabs
      filters 
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const query = formData.get('search') as string;
    
    updateURL({ 
      q: query.trim(), 
      cursor: '', 
      direction: 'next' 
    });
  };

  const handleFilterChange = (newFilters: LibraryFilters) => {
    setFilters(newFilters);
    updateURL({ 
      filters: newFilters, 
      cursor: '', 
      direction: 'next' 
    });
  };

  const handleSortChange = (sort: string) => {
    updateURL({ 
      sort, 
      cursor: '', 
      direction: 'next' 
    });
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    updateURL({ 
      filters: emptyFilters, 
      cursor: '', 
      direction: 'next' 
    });
  };

  const handlePagination = (direction: 'next' | 'prev') => {
    const cursor = direction === 'next' ? pagination.nextCursor : pagination.prevCursor;
    if (cursor) {
      updateURL({ cursor, direction });
    }
  };

  // Update page metadata
  useEffect(() => {
    const categoryLabel = CATEGORIES.find(c => c.id === activeTab)?.label || 'Recursos';
    updatePageMetadata({
      title: `${categoryLabel} | Bibliotecas | CiênciaDeDados.org`,
      description: `Explore nossa coleção de ${categoryLabel.toLowerCase()} para ciência de dados. Encontre ferramentas, cursos, códigos e datasets para impulsionar seus projetos.`,
      canonical: `https://cienciadedados.org/bibliotecas?tab=${activeTab}`,
    });
  }, [activeTab]);

  const hasActiveFilters = Object.values(filters).some(values => Array.isArray(values) && values.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Bibliotecas</h1>
          <p className="text-xl text-muted-foreground">
            Descubra ferramentas, cursos, códigos e recursos para ciência de dados
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  name="search"
                  placeholder="Buscar recursos..."
                  defaultValue={searchTerm}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      (e.target as HTMLInputElement).value = '';
                      updateURL({ q: '', cursor: '', direction: 'next' });
                    }
                  }}
                />
              </div>
            </form>
            
            <div className="flex items-center gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
              
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>

              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImport(!showImport)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {Object.entries(filters).map(([key, values]) =>
                Array.isArray(values) && values.length > 0 ? (
                  values.map((value) => (
                    <Badge
                      key={`${key}-${value}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      {key}: {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          const newFilters = { ...filters };
                          newFilters[key] = newFilters[key].filter((v: string) => v !== value);
                          handleFilterChange(newFilters);
                        }}
                      />
                    </Badge>
                  ))
                ) : null
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                <category.icon className="h-4 w-4" />
                {category.label}
                <Badge variant="secondary" className="text-xs">
                  {itemCounts[category.id] || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {/* Filters Panel */}
              {showFilters && (
                <div className="mb-6">
                  <LibraryFilters
                    category={activeTab}
                    filters={filters}
                    onFilterChange={(key, values) => {
                      const newFilters = { ...filters, [key]: values };
                      handleFilterChange(newFilters);
                    }}
                  />
                </div>
              )}

              {/* Import Panel */}
              {showImport && user && (
                <div className="mb-6">
                  <LibraryImport
                    onImportComplete={() => {
                      setShowImport(false);
                      fetchItems();
                    }}
                    onClose={() => setShowImport(false)}
                  />
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl border p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <category.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum item encontrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || hasActiveFilters
                        ? "Tente ajustar sua busca ou filtros"
                        : "Ainda não temos itens nesta categoria"
                      }
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <LibraryCard key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {(pagination.hasNext || pagination.hasPrev) && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => handlePagination('prev')}
                        disabled={!pagination.hasPrev}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        {items.length} itens carregados
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => handlePagination('next')}
                        disabled={!pagination.hasNext}
                        className="gap-2"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Libraries;
