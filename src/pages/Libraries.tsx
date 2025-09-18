import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Download, Code, GraduationCap, Database, Wrench, FileText, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface LibraryItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  website_url?: string;
  access_url?: string;
  institution?: string;
  duration?: string;
  price?: string;
  language?: string;
  documentation_url?: string;
  access_method?: string;
  observations?: string;
  status?: string;
  is_free?: boolean;
  is_online?: boolean;
}

export default function Libraries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Library data states
  const [tools, setTools] = useState<LibraryItem[]>([]);
  const [courses, setCourses] = useState<LibraryItem[]>([]);
  const [codePackages, setCodePackages] = useState<LibraryItem[]>([]);
  const [dataSources, setDataSources] = useState<LibraryItem[]>([]);
  const [datasets, setDatasets] = useState<LibraryItem[]>([]);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    setLoading(true);
    
    try {
      // Fetch all library types
      const [toolsRes, coursesRes, codeRes, sourcesRes, datasetsRes] = await Promise.all([
        supabase.from('tools').select('*').order('name'),
        supabase.from('educational_courses').select('*').order('name'),
        supabase.from('code_packages').select('*').order('name'),
        supabase.from('data_sources').select('*').order('name'),
        supabase.from('datasets').select('*').order('title').limit(20)
      ]);

      if (toolsRes.data) setTools(toolsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (codeRes.data) setCodePackages(codeRes.data);
      if (sourcesRes.data) setDataSources(sourcesRes.data);
      if (datasetsRes.data) {
        const formattedDatasets = datasetsRes.data.map(dataset => ({
          ...dataset,
          name: dataset.title, // Map title to name for consistency
        }));
        setDatasets(formattedDatasets);
      }
      
    } catch (error) {
      console.error('Error fetching library data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados das bibliotecas",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const importLibraryData = async (libraryType: string) => {
    setImporting(true);
    
    try {
      const response = await supabase.functions.invoke('import-library-data', {
        body: { library_type: libraryType }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Sucesso",
        description: `${response.data.imported} registros importados para ${libraryType}`,
      });

      // Refresh data
      await fetchLibraryData();
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erro",
        description: `Falha ao importar dados: ${error.message}`,
        variant: "destructive"
      });
    }
    
    setImporting(false);
  };

  const filterItems = (items: LibraryItem[], categoryField?: string) => {
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        (categoryField && item[categoryField as keyof LibraryItem] === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  };

  const LibraryCard = ({ item, type }: { item: LibraryItem; type: string }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="text-lg leading-tight">{item.name}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.is_free && <Badge variant="secondary" className="text-xs">Gratuito</Badge>}
            {item.is_online && <Badge variant="outline" className="text-xs">Online</Badge>}
          </div>
        </CardTitle>
        {item.description && (
          <CardDescription className="line-clamp-3">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {item.category && (
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          )}
          {item.institution && (
            <p className="text-sm text-muted-foreground">
              <strong>Instituição:</strong> {item.institution}
            </p>
          )}
          {item.duration && (
            <p className="text-sm text-muted-foreground">
              <strong>Duração:</strong> {item.duration}
            </p>
          )}
          {item.price && (
            <p className="text-sm text-muted-foreground">
              <strong>Valor:</strong> {item.price}
            </p>
          )}
          {item.language && (
            <Badge variant="secondary" className="text-xs">
              {item.language.toUpperCase()}
            </Badge>
          )}
          {item.access_method && (
            <p className="text-sm text-muted-foreground">
              <strong>Acesso:</strong> {item.access_method}
            </p>
          )}
          
          <div className="flex gap-2 pt-2">
            {(item.website_url || item.access_url) && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs"
              >
                <a
                  href={item.website_url || item.access_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Acessar
                </a>
              </Button>
            )}
            {item.documentation_url && (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs"
              >
                <a
                  href={item.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Docs
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Database className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Bibliotecas de Recursos</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Ferramentas, cursos, códigos e bases de dados para ciência de dados
          </p>
          
          {user && (
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={() => importLibraryData('tools')}
                disabled={importing}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Ferramentas
              </Button>
              <Button
                onClick={() => importLibraryData('courses')}
                disabled={importing}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Cursos
              </Button>
              <Button
                onClick={() => importLibraryData('code_python')}
                disabled={importing}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Códigos Python
              </Button>
              <Button
                onClick={() => importLibraryData('code_r')}
                disabled={importing}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Códigos R
              </Button>
              <Button
                onClick={() => importLibraryData('data_sources')}
                disabled={importing}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Fontes de Dados
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 px-4 bg-background/50 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Libraries Tabs */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Ferramentas
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Códigos
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Fontes
              </TabsTrigger>
              <TabsTrigger value="datasets" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Bases
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItems(tools).map((tool) => (
                  <LibraryCard key={tool.id} item={tool} type="tool" />
                ))}
              </div>
              {filterItems(tools).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma ferramenta encontrada.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItems(courses).map((course) => (
                  <LibraryCard key={course.id} item={course} type="course" />
                ))}
              </div>
              {filterItems(courses).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum curso encontrado.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItems(codePackages).map((pkg) => (
                  <LibraryCard key={pkg.id} item={pkg} type="code" />
                ))}
              </div>
              {filterItems(codePackages).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum pacote de código encontrado.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sources" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItems(dataSources).map((source) => (
                  <LibraryCard key={source.id} item={source} type="source" />
                ))}
              </div>
              {filterItems(dataSources).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma fonte de dados encontrada.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="datasets" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItems(datasets).map((dataset) => (
                  <LibraryCard key={dataset.id} item={dataset} type="dataset" />
                ))}
              </div>
              {filterItems(datasets).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma base de dados encontrada.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
    </>
  );
}