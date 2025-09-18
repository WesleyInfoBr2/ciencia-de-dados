import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const WikiImport = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    skipped?: number;
  } | null>(null);

  const handleImport = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para importar conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-wiki-content', {
        body: { author_id: user.id }
      });

      if (error) {
        throw error;
      }

      setImportResult(data);
      
      toast({
        title: "Importação concluída!",
        description: data.message,
      });

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: `Erro na importação: ${error.message}`
      });
      
      toast({
        title: "Erro na importação",
        description: "Erro ao importar conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/wiki">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Wiki
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold">Importar Conteúdo</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Importação Automática de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                Esta função irá importar automaticamente conteúdo de exemplo para popular a wiki com artigos sobre:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-6">
                <li><strong>Introdução à Ciência de Dados</strong> - Conceitos fundamentais</li>
                <li><strong>Configuração de Ambiente Python</strong> - Tutorial prático</li>
                <li><strong>Análise de Vendas com Python</strong> - Estudo de caso</li>
                <li><strong>Pandas para Manipulação de Dados</strong> - Guia da biblioteca</li>
                <li><strong>Introdução ao Machine Learning</strong> - Conceitos e algoritmos</li>
              </ul>

              {importResult && (
                <Alert className={importResult.success ? "border-green-200" : "border-red-200"}>
                  <div className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <AlertDescription>
                    {importResult.message}
                    {importResult.success && importResult.imported !== undefined && (
                      <>
                        <br />
                        <strong>Artigos importados:</strong> {importResult.imported}
                        {importResult.skipped !== undefined && (
                          <>
                            <br />
                            <strong>Artigos já existentes:</strong> {importResult.skipped}
                          </>
                        )}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full"
                  size="lg"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Importar Conteúdo
                    </>
                  )}
                </Button>

                {importResult?.success && (
                  <Button variant="outline" asChild>
                    <Link to="/wiki">
                      Ver Artigos Importados
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> Esta importação criará conteúdo de exemplo baseado na estrutura do site atual. 
                Artigos já existentes serão ignorados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WikiImport;