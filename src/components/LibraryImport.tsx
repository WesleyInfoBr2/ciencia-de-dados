import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LibraryCategory = Database['public']['Enums']['library_category'];
type LibraryPrice = Database['public']['Enums']['library_price'];

interface LibraryImportProps {
  onClose: () => void;
  onImportComplete: () => void;
}

const CATEGORIES = [
  { value: 'tools', label: 'Ferramentas Digitais' },
  { value: 'courses', label: 'Formações Digitais' },
  { value: 'codes', label: 'Códigos e Pacotes' },
  { value: 'sources', label: 'Fontes de Dados' },
  { value: 'datasets', label: 'Bases de Dados' }
] as const;

const PRICE_OPTIONS = [
  { value: 'free', label: 'Gratuito' },
  { value: 'paid', label: 'Pago' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'subscription', label: 'Assinatura' }
] as const;

interface ImportItem {
  name: string;
  slug: string;
  short_description: string;
  website_url: string;
  tags: string[];
  language: string;
  price: LibraryPrice;
  is_open_source: boolean;
  attributes: Record<string, any>;
}

export function LibraryImport({ onClose, onImportComplete }: LibraryImportProps) {
  const [category, setCategory] = useState<LibraryCategory>('tools');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive"
      });
      return;
    }

    setCsvFile(file);
    const text = await file.text();
    setCsvContent(text);
    
    // Parse CSV headers
    const lines = text.trim().split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Auto-map common column names
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('nome') || lowerHeader.includes('name')) {
          autoMapping['name'] = header;
        } else if (lowerHeader.includes('descrição') || lowerHeader.includes('description')) {
          autoMapping['short_description'] = header;
        } else if (lowerHeader.includes('url') || lowerHeader.includes('link')) {
          autoMapping['website_url'] = header;
        } else if (lowerHeader.includes('linguagem') || lowerHeader.includes('language')) {
          autoMapping['language'] = header;
        } else if (lowerHeader.includes('preço') || lowerHeader.includes('price')) {
          autoMapping['price'] = header;
        } else if (lowerHeader.includes('tags') || lowerHeader.includes('palavras')) {
          autoMapping['tags'] = header;
        }
      });

      setColumnMapping(autoMapping);
      setStep('mapping');
    }
  };

  const handleMappingComplete = () => {
    if (!csvContent) return;

    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        return row;
      });

      setPreviewData(preview);
      setStep('preview');
    } catch (error) {
      toast({
        title: "Erro ao processar CSV",
        description: "Verifique o formato do arquivo",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  const handleImport = async () => {
    if (!csvContent) return;

    setLoading(true);
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const items: ImportItem[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Parse tags
        const tagsValue = row[columnMapping.tags] || '';
        const tags = tagsValue ? tagsValue.split(';').map((tag: string) => tag.trim()) : [];

        // Parse price
        let price: LibraryPrice = 'free';
        const priceValue = row[columnMapping.price]?.toLowerCase() || '';
        if (priceValue.includes('pago') || priceValue.includes('paid')) price = 'paid';
        else if (priceValue.includes('freemium')) price = 'freemium';
        else if (priceValue.includes('assinatura') || priceValue.includes('subscription')) price = 'subscription';

        // Parse open source
        const openSourceValue = row[columnMapping.is_open_source]?.toLowerCase() || '';
        const isOpenSource = openSourceValue.includes('sim') || openSourceValue.includes('true') || openSourceValue.includes('yes');

        const name = row[columnMapping.name] || '';
        
        return {
          name,
          slug: generateSlug(name),
          short_description: row[columnMapping.short_description] || '',
          website_url: row[columnMapping.website_url] || '',
          tags,
          language: row[columnMapping.language] || '',
          price,
          is_open_source: isOpenSource,
          attributes: buildAttributes(row, headers, category)
        };
      });

      // Insert items into database
      const { error } = await supabase
        .from('library_items')
        .insert(
          items.map(item => ({
            ...item,
            category
          }))
        );

      if (error) throw error;

      toast({
        title: "Importação concluída",
        description: `${items.length} itens importados com sucesso`,
      });

      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erro na importação",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buildAttributes = (row: any, headers: string[], category: LibraryCategory): Record<string, any> => {
    const attributes: Record<string, any> = {};
    
    // Map category-specific attributes
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      const value = row[header];
      
      if (!value || ['name', 'slug', 'short_description', 'website_url', 'tags', 'language', 'price', 'is_open_source'].some(field => 
        columnMapping[field] === header
      )) return;

      // Category-specific mappings
      switch (category) {
        case 'tools':
          if (lowerHeader.includes('plataforma')) attributes.platforms = value.split(';');
          else if (lowerHeader.includes('licen')) attributes.license = value;
          else if (lowerHeader.includes('categoria')) attributes.category = value;
          break;
        case 'courses':
          if (lowerHeader.includes('provedor')) attributes.provider = value;
          else if (lowerHeader.includes('duração')) attributes.duration = value;
          else if (lowerHeader.includes('certificado')) attributes.certificate = value.toLowerCase().includes('sim');
          else if (lowerHeader.includes('modalidade')) attributes.mode = value;
          break;
        case 'codes':
          if (lowerHeader.includes('status')) attributes.status = value;
          else if (lowerHeader.includes('versão')) attributes.version = value;
          else if (lowerHeader.includes('dependências')) attributes.dependencies = value.split(';');
          break;
        case 'sources':
          if (lowerHeader.includes('país')) attributes.country = value;
          else if (lowerHeader.includes('setor')) attributes.sector = value;
          else if (lowerHeader.includes('tema')) attributes.theme = value;
          else if (lowerHeader.includes('licença')) attributes.license = value;
          else if (lowerHeader.includes('frequência')) attributes.update_frequency = value;
          break;
        case 'datasets':
          if (lowerHeader.includes('tema')) attributes.theme = value;
          else if (lowerHeader.includes('ano')) attributes.year = value;
          else if (lowerHeader.includes('formato')) attributes.format = value;
          else if (lowerHeader.includes('variáveis')) attributes.variables = value.split(';');
          break;
      }
    });

    return attributes;
  };

  const getAvailableColumns = () => {
    if (!csvContent) return [];
    const lines = csvContent.trim().split('\n');
    return lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Biblioteca - {CATEGORIES.find(c => c.value === category)?.label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' && (
            <>
              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as LibraryCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="csv-file">Arquivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione um arquivo CSV com os dados a serem importados
                </p>
              </div>

              {csvFile && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Arquivo "{csvFile.name}" carregado. Clique em "Próximo" para mapear as colunas.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mapear Colunas</h3>
              <p className="text-sm text-muted-foreground">
                Mapeie as colunas do seu CSV para os campos do sistema
              </p>

              <div className="grid grid-cols-2 gap-4">
                {['name', 'short_description', 'website_url', 'language', 'price', 'tags', 'is_open_source'].map(field => (
                  <div key={field}>
                    <Label>{field === 'name' ? 'Nome' : 
                            field === 'short_description' ? 'Descrição' :
                            field === 'website_url' ? 'URL' :
                            field === 'language' ? 'Linguagem' :
                            field === 'price' ? 'Preço' :
                            field === 'tags' ? 'Tags (separadas por ;)' :
                            'Open Source'}</Label>
                    <Select 
                      value={columnMapping[field] || ''} 
                      onValueChange={(value) => setColumnMapping(prev => ({
                        ...prev,
                        [field]: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableColumns().map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Campos obrigatórios: Nome. Os demais campos são opcionais.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'preview' && previewData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prévia dos Dados</h3>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2">Nome</th>
                      <th className="border p-2">Descrição</th>
                      <th className="border p-2">URL</th>
                      <th className="border p-2">Linguagem</th>
                      <th className="border p-2">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        <td className="border p-2">{row[columnMapping.name] || '-'}</td>
                        <td className="border p-2">{row[columnMapping.short_description] || '-'}</td>
                        <td className="border p-2">{row[columnMapping.website_url] || '-'}</td>
                        <td className="border p-2">{row[columnMapping.language] || '-'}</td>
                        <td className="border p-2">{row[columnMapping.price] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">
                Mostrando apenas os primeiros 5 registros para prévia
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <div className="flex gap-2">
              {step === 'mapping' && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep('upload')}
                >
                  Voltar
                </Button>
              )}
              
              {step === 'preview' && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep('mapping')}
                >
                  Voltar
                </Button>
              )}

              {step === 'upload' && csvFile && (
                <Button onClick={() => setStep('mapping')}>
                  Próximo
                </Button>
              )}

              {step === 'mapping' && columnMapping.name && (
                <Button onClick={handleMappingComplete}>
                  Visualizar
                </Button>
              )}

              {step === 'preview' && (
                <Button 
                  onClick={handleImport} 
                  disabled={loading}
                >
                  {loading ? 'Importando...' : 'Importar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}