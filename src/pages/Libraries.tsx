import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { LibraryCard } from "@/components/LibraryCard";
import { LibraryFilters } from "@/components/LibraryFilters";
import { LibraryImport } from "@/components/LibraryImport";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type LibraryItem = Database['public']['Tables']['library_items']['Row'];
type LibraryCategory = Database['public']['Enums']['library_category'];

const CATEGORIES = {
  tools: { label: "Ferramentas Digitais", icon: "🛠️" },
  courses: { label: "Formações Digitais", icon: "🎓" },
  codes: { label: "Códigos e Pacotes", icon: "💻" },
  sources: { label: "Fontes de Dados", icon: "📊" },
  datasets: { label: "Bases de Dados", icon: "📈" }
} as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "recent", label: "Mais Recentes" },
  { value: "name", label: "Nome A-Z" }
];

export default function Libraries() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>(
    (searchParams.get("category") as LibraryCategory) || "tools"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [showImport, setShowImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeCategory, searchTerm, sortBy, filters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (activeCategory !== "tools") params.set("category", activeCategory);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    setSearchParams(params);
  }, [searchTerm, activeCategory, sortBy, setSearchParams]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("library_items")
        .select("*")
        .eq("category", activeCategory);

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
      }

      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (key === "tags") {
            query = query.overlaps("tags", values);
          } else if (key === "price" || key === "language") {
            query = query.in(key, values);
          } else if (key === "is_open_source") {
            query = query.eq("is_open_source", values[0] === "true");
          } else {
            values.forEach(value => {
              query = query.contains("attributes", { [key]: value });
            });
          }
        }
      });

      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching library items:", error);
      toast({
        title: "Erro ao carregar itens",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const clearFilters = () => setFilters({});
  const activeFiltersCount = Object.values(filters).flat().length;

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Hub de Bibliotecas
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Descubra ferramentas, cursos, códigos, fontes de dados e datasets para ciência de dados
            </p>
            
            {user && (
              <Button onClick={() => setShowImport(true)} className="mb-6" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
            )}
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar em todas as categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, values]) =>
                    values.map(value => (
                      <Badge
                        key={`${key}-${value}`}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const newValues = filters[key].filter(v => v !== value);
                          handleFilterChange(key, newValues);
                        }}
                      >
                        {value} ×
                      </Badge>
                    ))
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  Limpar todos
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-8">
            {showFilters && (
              <div className="w-80 shrink-0">
                <LibraryFilters
                  category={activeCategory}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            <div className="flex-1">
              <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as LibraryCategory)}>
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
                    <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                      <span className="mr-1">{icon}</span>
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{label.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(CATEGORIES).map(category => (
                  <TabsContent key={category} value={category}>
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                          <LibraryCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                        <p className="text-muted-foreground">
                          Tente ajustar os filtros ou termo de busca
                        </p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {showImport && (
        <LibraryImport
          onClose={() => setShowImport(false)}
          onImportComplete={() => {
            setShowImport(false);
            fetchItems();
          }}
        />
      )}
    </>
  );
}