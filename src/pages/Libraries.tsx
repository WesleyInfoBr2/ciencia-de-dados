import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { FeaturedSection } from "@/components/library/FeaturedSection";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, X } from "lucide-react";
import { LibraryImport } from "@/components/LibraryImport";
import { updatePageMetadata } from "@/utils/seo";
import type { Database } from "@/integrations/supabase/types";

type LibraryItem = Database['public']['Tables']['library_items']['Row'];
type LibraryCategory = 'tools' | 'courses' | 'codes' | 'sources' | 'datasets';

interface LibraryFilters {
  [key: string]: string[];
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "recent", label: "Mais Recentes" },
  { value: "name", label: "Nome A-Z" }
];

const PAGE_SIZE = 12;

const Libraries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [featuredItems, setFeaturedItems] = useState<LibraryItem[]>([]);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [showImport, setShowImport] = useState(false);

  // Parse URL parameters
  const selectedCategory = (searchParams.get('category') as LibraryCategory | 'all') || 'all';
  const searchTerm = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'relevance';

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

  const [filters, setFilters] = useState<LibraryFilters>(getFiltersFromURL());

  // Update URL when state changes
  const updateURL = useCallback((updates: Partial<{
    category: LibraryCategory | 'all';
    q: string;
    sort: string;
    filters: LibraryFilters;
  }>) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      if (updates.category === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', updates.category);
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

    if (updates.filters !== undefined) {
      const hasFilters = Object.keys(updates.filters).some(key => updates.filters![key].length > 0);
      if (hasFilters) {
        newParams.set('filters', btoa(JSON.stringify(updates.filters)));
      } else {
        newParams.delete('filters');
      }
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Fetch ALL featured items (no limit for carousel)
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('*')
          .eq('is_featured', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setFeaturedItems(data || []);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, []);

  // Fetch items when parameters change
  const fetchItems = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    const currentOffset = reset ? 0 : offset;

    try {
      let query = supabase
        .from('library_items')
        .select('*');

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (key === 'is_open_source') {
            query = query.eq('is_open_source', values.includes('true'));
          } else if (key === 'price') {
            query = query.in('price', values);
          } else if (key === 'language') {
            query = query.in('language', values);
          } else if (key === 'tags') {
            query = query.overlaps('tags', values);
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
        default:
          query = query.order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(currentOffset, currentOffset + PAGE_SIZE);

      const { data, error } = await query;

      if (error) throw error;

      const newItems = data || [];
      setHasMore(newItems.length === PAGE_SIZE + 1);

      if (reset) {
        setItems(newItems.slice(0, PAGE_SIZE));
      } else {
        setItems(prev => [...prev, ...newItems.slice(0, PAGE_SIZE)]);
      }

      if (!reset) {
        setOffset(currentOffset + PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da biblioteca.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchTerm, sortBy, filters, offset, toast]);

  useEffect(() => {
    fetchItems(true);
  }, [selectedCategory, searchTerm, sortBy, filters]);

  // Handlers
  const handleCategoryChange = (category: LibraryCategory | 'all') => {
    updateURL({ category });
    setOffset(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const query = formData.get('search') as string;
    updateURL({ q: query.trim() });
    setOffset(0);
  };

  const handleFilterChange = (filterType: string, values: string[]) => {
    const newFilters = { ...filters, [filterType]: values };
    setFilters(newFilters);
    updateURL({ filters: newFilters });
    setOffset(0);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    updateURL({ filters: emptyFilters });
    setOffset(0);
  };

  const handleSortChange = (sort: string) => {
    updateURL({ sort });
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + PAGE_SIZE);
    fetchItems(false);
  };

  // Update page metadata
  useEffect(() => {
    updatePageMetadata({
      title: 'Bibliotecas | CiênciaDeDados.org',
      description: 'Explore nossa coleção de ferramentas, cursos, códigos e datasets para ciência de dados.',
      canonical: 'https://cienciadedados.org/bibliotecas',
    });
  }, []);

  const hasActiveFilters = Object.values(filters).some(values => values.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Bibliotecas</h1>
          <p className="text-xl text-muted-foreground">
            Descubra ferramentas, cursos, códigos e recursos para ciência de dados
          </p>
        </div>

        {/* Featured Section */}
        <FeaturedSection items={featuredItems} loading={loadingFeatured} />

        {/* Search and Controls */}
        <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                      updateURL({ q: '' });
                    }
                  }}
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
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
                values.length > 0 ? (
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
                          newFilters[key] = newFilters[key].filter(v => v !== value);
                          handleFilterChange(key, newFilters[key]);
                        }}
                      />
                    </Badge>
                  ))
                ) : null
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-6"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Import Panel */}
        {showImport && user && (
          <div className="mb-6">
            <LibraryImport
              onImportComplete={() => {
                setShowImport(false);
                fetchItems(true);
              }}
              onClose={() => setShowImport(false)}
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <LibrarySidebar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Right Content - Results */}
          <div className="lg:col-span-3">
            <LibraryGrid
              items={items}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Libraries;
