import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Download, Calendar, Wrench, Code, GraduationCap, Database as DatabaseIcon, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LibraryItem = Database['public']['Tables']['library_items']['Row'];
type LibraryFile = Database['public']['Tables']['library_files']['Row'];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tools': return Wrench;
    case 'courses': return GraduationCap;
    case 'codes': return Code;
    case 'sources': return DatabaseIcon;
    case 'datasets': return BarChart3;
    default: return Wrench;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'tools': return 'Ferramenta Digital';
    case 'courses': return 'Formação Digital';
    case 'codes': return 'Código/Pacote';
    case 'sources': return 'Fonte de Dados';
    case 'datasets': return 'Base de Dados';
    default: return category;
  }
};

const getPriceLabel = (price: string) => {
  switch (price) {
    case 'free': return 'Gratuito';
    case 'paid': return 'Pago';
    case 'freemium': return 'Freemium';
    case 'subscription': return 'Assinatura';
    default: return price;
  }
};

const getPriceColor = (price: string) => {
  switch (price) {
    case 'free': return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'paid': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'freemium': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'subscription': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    default: return 'bg-muted';
  }
};

export function LibraryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchItem();
    }
  }, [slug]);

  const fetchItem = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      // Fetch library item
      const { data: itemData, error: itemError } = await supabase
        .from('library_items')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (itemError) throw itemError;
      
      if (!itemData) {
        toast({
          title: "Item não encontrado",
          description: "O item solicitado não foi encontrado",
          variant: "destructive"
        });
        return;
      }

      setItem(itemData);

      // Fetch associated files
      const { data: filesData, error: filesError } = await supabase
        .from('library_files')
        .select('*')
        .eq('library_item_id', itemData.id);

      if (filesError) throw filesError;
      setFiles(filesData || []);

    } catch (error) {
      console.error('Error fetching item:', error);
      toast({
        title: "Erro ao carregar item",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-card rounded w-32"></div>
              <div className="h-12 bg-card rounded"></div>
              <div className="h-32 bg-card rounded"></div>
              <div className="h-48 bg-card rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Item não encontrado</h1>
              <Button asChild>
                <Link to="/bibliotecas">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às Bibliotecas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const Icon = getCategoryIcon(item.category);
  const attributes = item.attributes as Record<string, any> || {};

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/bibliotecas">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Bibliotecas
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {getCategoryLabel(item.category)}
                        </Badge>
                        {attributes.language && (
                          <Badge variant="outline">
                            {attributes.language}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-3xl font-bold mb-2">
                        {item.name}
                      </CardTitle>
                      {item.short_description && (
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {item.short_description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge className={getPriceColor(item.price)}>
                      {getPriceLabel(item.price)}
                    </Badge>
                    
                    {attributes.open_source && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                        Open Source
                      </Badge>
                    )}
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {item.website_url && (
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <a href={item.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Category-specific Details */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.category === 'tools' && (
                    <>
                      {attributes.platforms && (
                        <div>
                          <h4 className="font-semibold mb-2">Plataformas Suportadas</h4>
                          <div className="flex flex-wrap gap-2">
                            {attributes.platforms.map((platform: string, index: number) => (
                              <Badge key={index} variant="secondary">{platform}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {attributes.license && (
                        <div>
                          <h4 className="font-semibold mb-1">Licença</h4>
                          <p className="text-muted-foreground">{attributes.license}</p>
                        </div>
                      )}
                      {attributes.category && (
                        <div>
                          <h4 className="font-semibold mb-1">Categoria</h4>
                          <p className="text-muted-foreground">{attributes.category}</p>
                        </div>
                      )}
                    </>
                  )}

                  {item.category === 'courses' && (
                    <>
                      {attributes.provider && (
                        <div>
                          <h4 className="font-semibold mb-1">Provedor</h4>
                          <p className="text-muted-foreground">{attributes.provider}</p>
                        </div>
                      )}
                      {attributes.duration && (
                        <div>
                          <h4 className="font-semibold mb-1">Duração</h4>
                          <p className="text-muted-foreground">{attributes.duration}</p>
                        </div>
                      )}
                      {attributes.mode && (
                        <div>
                          <h4 className="font-semibold mb-1">Modalidade</h4>
                          <p className="text-muted-foreground">{attributes.mode}</p>
                        </div>
                      )}
                      {attributes.certificate !== undefined && (
                        <div>
                          <h4 className="font-semibold mb-1">Certificado</h4>
                          <Badge variant={attributes.certificate ? "default" : "secondary"}>
                            {attributes.certificate ? "Incluído" : "Não incluído"}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}

                  {item.category === 'codes' && (
                    <>
                      {attributes.version && (
                        <div>
                          <h4 className="font-semibold mb-1">Versão</h4>
                          <p className="text-muted-foreground">{attributes.version}</p>
                        </div>
                      )}
                      {attributes.status && (
                        <div>
                          <h4 className="font-semibold mb-1">Status</h4>
                          <Badge variant={attributes.status === 'active' ? 'default' : 'secondary'}>
                            {attributes.status}
                          </Badge>
                        </div>
                      )}
                      {attributes.dependencies && (
                        <div>
                          <h4 className="font-semibold mb-2">Dependências</h4>
                          <div className="flex flex-wrap gap-2">
                            {attributes.dependencies.map((dep: string, index: number) => (
                              <Badge key={index} variant="outline">{dep}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {item.category === 'sources' && (
                    <>
                      {attributes.country && (
                        <div>
                          <h4 className="font-semibold mb-1">País</h4>
                          <p className="text-muted-foreground">{attributes.country}</p>
                        </div>
                      )}
                      {attributes.sector && (
                        <div>
                          <h4 className="font-semibold mb-1">Setor</h4>
                          <p className="text-muted-foreground">{attributes.sector}</p>
                        </div>
                      )}
                      {attributes.theme && (
                        <div>
                          <h4 className="font-semibold mb-1">Tema</h4>
                          <p className="text-muted-foreground">{attributes.theme}</p>
                        </div>
                      )}
                      {attributes.update_frequency && (
                        <div>
                          <h4 className="font-semibold mb-1">Frequência de Atualização</h4>
                          <p className="text-muted-foreground">{attributes.update_frequency}</p>
                        </div>
                      )}
                      {attributes.license && (
                        <div>
                          <h4 className="font-semibold mb-1">Licença</h4>
                          <p className="text-muted-foreground">{attributes.license}</p>
                        </div>
                      )}
                    </>
                  )}

                  {item.category === 'datasets' && (
                    <>
                      {attributes.theme && (
                        <div>
                          <h4 className="font-semibold mb-1">Tema</h4>
                          <p className="text-muted-foreground">{attributes.theme}</p>
                        </div>
                      )}
                      {attributes.year && (
                        <div>
                          <h4 className="font-semibold mb-1">Ano de Referência</h4>
                          <p className="text-muted-foreground">{attributes.year}</p>
                        </div>
                      )}
                      {attributes.format && (
                        <div>
                          <h4 className="font-semibold mb-1">Formato</h4>
                          <Badge variant="outline">{attributes.format}</Badge>
                        </div>
                      )}
                      {attributes.variables && (
                        <div>
                          <h4 className="font-semibold mb-2">Tipos de Variáveis</h4>
                          <div className="flex flex-wrap gap-2">
                            {attributes.variables.map((variable: string, index: number) => (
                              <Badge key={index} variant="secondary">{variable}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Files Section */}
              {files.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Arquivos Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{file.filename}</h4>
                            <p className="text-sm text-muted-foreground">
                              {file.mime_type}
                              {file.file_size && ` • ${(file.file_size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Informações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria</span>
                    <span className="font-medium">{getCategoryLabel(item.category)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço</span>
                    <Badge className={getPriceColor(item.price)}>
                      {getPriceLabel(item.price)}
                    </Badge>
                  </div>
                  <Separator />
                  {attributes.language && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Linguagem</span>
                        <span className="font-medium">{attributes.language}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {attributes.open_source !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Source</span>
                      <Badge variant={attributes.open_source ? "default" : "secondary"}>
                        {attributes.open_source ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  )}

                  {/* Category-specific attributes in Quick Info */}
                  {item.category === 'tools' && (
                    <>
                      {attributes.platforms && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <span className="text-muted-foreground">Plataformas</span>
                            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                              {(attributes.platforms as string[]).slice(0, 3).map((p: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {attributes.license && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Licença</span>
                            <span className="font-medium text-sm">{attributes.license}</span>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {item.category === 'courses' && (
                    <>
                      {attributes.provider && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provedor</span>
                            <span className="font-medium text-sm">{attributes.provider}</span>
                          </div>
                        </>
                      )}
                      {attributes.duration && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duração</span>
                            <span className="font-medium text-sm">{attributes.duration}</span>
                          </div>
                        </>
                      )}
                      {attributes.mode && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Modalidade</span>
                            <span className="font-medium text-sm">{attributes.mode}</span>
                          </div>
                        </>
                      )}
                      {attributes.certificate !== undefined && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Certificado</span>
                            <Badge variant={attributes.certificate ? "default" : "secondary"} className="text-xs">
                              {attributes.certificate ? "Sim" : "Não"}
                            </Badge>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {item.category === 'codes' && (
                    <>
                      {attributes.status && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={attributes.status === 'Ativo' ? "default" : "secondary"} className="text-xs">
                              {attributes.status}
                            </Badge>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {item.category === 'sources' && (
                    <>
                      {attributes.country && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">País</span>
                            <span className="font-medium text-sm">{attributes.country}</span>
                          </div>
                        </>
                      )}
                      {attributes.sector && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Setor</span>
                            <span className="font-medium text-sm">{attributes.sector}</span>
                          </div>
                        </>
                      )}
                      {attributes.theme && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tema</span>
                            <span className="font-medium text-sm">{attributes.theme}</span>
                          </div>
                        </>
                      )}
                      {attributes.update_frequency && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Atualização</span>
                            <span className="font-medium text-sm">{attributes.update_frequency}</span>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {item.category === 'datasets' && (
                    <>
                      {attributes.theme && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tema</span>
                            <span className="font-medium text-sm">{attributes.theme}</span>
                          </div>
                        </>
                      )}
                      {attributes.year && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ano</span>
                            <span className="font-medium text-sm">{attributes.year}</span>
                          </div>
                        </>
                      )}
                      {attributes.format && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Formato</span>
                            <Badge variant="outline" className="text-xs">{attributes.format}</Badge>
                          </div>
                        </>
                      )}
                      {/* File download for datasets */}
                      {files.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <span className="text-muted-foreground">Arquivo</span>
                            {files.map((file) => (
                              <Button
                                key={file.id}
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                              >
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                  {file.filename}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}