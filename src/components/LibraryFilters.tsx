import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LibraryCategory = 'tools' | 'courses' | 'codes' | 'sources' | 'datasets';

interface LibraryFiltersProps {
  category: LibraryCategory;
  filters: Record<string, string[]>;
  onFilterChange: (filterType: string, values: string[]) => void;
}

const PRICE_OPTIONS = ['free', 'paid', 'freemium', 'subscription'];

const PRICE_LABELS: Record<string, string> = {
  free: 'Gratuito',
  paid: 'Pago', 
  freemium: 'Freemium',
  subscription: 'Assinatura'
};

// Category-specific filter configurations
const CATEGORY_FILTERS: Record<LibraryCategory, { key: string; label: string; options?: string[] }[]> = {
  codes: [
    { key: 'language', label: 'Linguagem' },
    { key: 'open_source', label: 'Open Source', options: ['true', 'false'] },
  ],
  tools: [
    { key: 'open_source', label: 'Open Source', options: ['true', 'false'] },
    { key: 'plataformas', label: 'Plataformas' },
  ],
  courses: [
    { key: 'instituicao', label: 'Instituição' },
    { key: 'duracao', label: 'Duração' },
    { key: 'certificado', label: 'Certificado', options: ['true', 'false'] },
  ],
  sources: [
    { key: 'metodo_acesso', label: 'Método de Acesso' },
    { key: 'observacoes', label: 'Observações' },
    { key: 'tema', label: 'Tema' },
  ],
  datasets: [
    { key: 'tema', label: 'Tema' },
    { key: 'ano_referencia', label: 'Ano de Referência' },
    { key: 'licenca', label: 'Licença' },
    { key: 'fonte', label: 'Fonte' },
    { key: 'arquivo', label: 'Arquivo' },
    { key: 'formato', label: 'Formato' },
    { key: 'tamanho_amostra', label: 'Tamanho da Amostra' },
    { key: 'tipo', label: 'Tipo de Variável', options: ['contínua', 'discreta', 'nominal', 'ordinal'] },
  ],
};

export function LibraryFilters({ category, filters, onFilterChange }: LibraryFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    tags: true
  });

  useEffect(() => {
    fetchAvailableOptions();
  }, [category]);

  const fetchAvailableOptions = async () => {
    try {
      const { data: items } = await supabase
        .from('library_items')
        .select('tags, attributes')
        .eq('category', category);

      if (items) {
        // Extract unique tags
        const allTags = items.flatMap(item => item.tags || []);
        setAvailableTags([...new Set(allTags)].sort());

        // Extract dynamic options from attributes
        const newDynamicOptions: Record<string, string[]> = {};
        const categoryAttrs = CATEGORY_FILTERS[category] || [];
        const attrKeys = categoryAttrs.map(a => a.key);
        
        items.forEach(item => {
          const attrs = (item.attributes as Record<string, any>) || {};
          attrKeys.forEach(key => {
            if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== '') {
              if (!newDynamicOptions[key]) {
                newDynamicOptions[key] = [];
              }
              const val = String(attrs[key]).trim();
              if (val && !newDynamicOptions[key].includes(val)) {
                newDynamicOptions[key].push(val);
              }
            }
          });
        });

        Object.keys(newDynamicOptions).forEach(key => {
          newDynamicOptions[key] = newDynamicOptions[key].sort();
        });

        setDynamicOptions(newDynamicOptions);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleCheckboxChange = (filterType: string, value: string, checked: boolean) => {
    const currentValues = filters[filterType] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFilterChange(filterType, newValues);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDisplayLabel = (key: string, value: string) => {
    if (key === 'open_source') {
      return value === 'true' ? 'Sim' : 'Não';
    }
    if (key === 'certificado') {
      return value === 'true' ? 'Com certificado' : 'Sem certificado';
    }
    return value;
  };

  const categoryFilters = CATEGORY_FILTERS[category] || [];

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Filter */}
        <Collapsible 
          open={openSections.price} 
          onOpenChange={() => toggleSection('price')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
            <span className="font-medium">Preço</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {PRICE_OPTIONS.map(price => (
              <div key={price} className="flex items-center space-x-2">
                <Checkbox
                  id={`price-${price}`}
                  checked={(filters.price || []).includes(price)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('price', price, checked as boolean)
                  }
                />
                <Label htmlFor={`price-${price}`} className="text-sm">
                  {PRICE_LABELS[price]}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Category-specific Filters */}
        {categoryFilters.map(attr => {
          const options = attr.options || dynamicOptions[attr.key] || [];
          if (options.length === 0) return null;

          const sectionKey = `attr_${attr.key}`;
          
          return (
            <Collapsible 
              key={attr.key} 
              open={openSections[sectionKey]}
              onOpenChange={() => toggleSection(sectionKey)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                <span className="font-medium">{attr.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {options.slice(0, 15).map(option => {
                  const filterKey = `attr_${attr.key}`;
                  const displayLabel = getDisplayLabel(attr.key, option);
                  
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${filterKey}-${option}`}
                        checked={(filters[filterKey] || []).includes(option)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(filterKey, option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${filterKey}-${option}`} className="text-sm">
                        {displayLabel}
                      </Label>
                    </div>
                  );
                })}
                {options.length > 15 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{options.length - 15} opções
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <Collapsible 
            open={openSections.tags} 
            onOpenChange={() => toggleSection('tags')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Tags</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.tags ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {availableTags.slice(0, 20).map(tag => (
                  <Badge
                    key={tag}
                    variant={(filters.tags || []).includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 text-xs"
                    onClick={() => {
                      const isSelected = (filters.tags || []).includes(tag);
                      handleCheckboxChange('tags', tag, !isSelected);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
