import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LibraryCategory = Database['public']['Enums']['library_category'];
type LibraryPrice = Database['public']['Enums']['library_price'];

interface LibraryFiltersProps {
  category: LibraryCategory;
  filters: Record<string, string[]>;
  onFilterChange: (filterType: string, values: string[]) => void;
}

const PRICE_OPTIONS: LibraryPrice[] = ['free', 'paid', 'freemium', 'subscription'];

const PRICE_LABELS = {
  free: 'Gratuito',
  paid: 'Pago', 
  freemium: 'Freemium',
  subscription: 'Assinatura'
};

// Category-specific filter configurations
const CATEGORY_FILTERS = {
  tools: {
    platforms: ['Windows', 'macOS', 'Linux', 'Web', 'Mobile'],
    license: ['MIT', 'GPL', 'Apache', 'BSD', 'Proprietary'],
    category: ['Programming Language', 'Framework', 'Library', 'IDE', 'Database']
  },
  courses: {
    provider: ['Coursera', 'edX', 'Udemy', 'FGV', 'USP', 'Alura'],
    mode: ['online', 'presencial', 'híbrido'],
    certificate: ['true', 'false']
  },
  codes: {
    status: ['active', 'deprecated', 'experimental'],
    language: ['Python', 'R', 'JavaScript', 'SQL', 'Java']
  },
  sources: {
    country: ['Brasil', 'Global', 'Estados Unidos', 'Europa'],
    sector: ['Público', 'Privado', 'Internacional', 'Acadêmico'],
    theme: ['Demografia', 'Economia', 'Saúde', 'Educação', 'Meio Ambiente'],
    license: ['Aberta', 'CC-BY', 'CC-BY-SA', 'Restrita'],
    update_frequency: ['Diária', 'Semanal', 'Mensal', 'Trimestral', 'Anual']
  },
  datasets: {
    theme: ['Demografia', 'Economia', 'Saúde', 'Educação', 'Meio Ambiente', 'Clima'],
    format: ['CSV', 'JSON', 'XML', 'Excel', 'API'],
    variables: ['continuous', 'discrete', 'nominal', 'ordinal']
  }
} as const;

export function LibraryFilters({ category, filters, onFilterChange }: LibraryFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    openSource: true,
    language: true,
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

        // Extract unique languages from attributes
        const allLanguages = items
          .map(item => (item.attributes as Record<string, any>)?.language)
          .filter((lang): lang is string => Boolean(lang));
        setAvailableLanguages([...new Set(allLanguages)].sort());
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

  const categoryFilters = CATEGORY_FILTERS[category] || {};

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


        {/* Language Filter */}
        {availableLanguages.length > 0 && (
          <Collapsible 
            open={openSections.language} 
            onOpenChange={() => toggleSection('language')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium">Linguagem</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.language ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {availableLanguages.map(language => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`language-${language}`}
                    checked={(filters.language || []).includes(language)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('language', language, checked as boolean)
                    }
                  />
                  <Label htmlFor={`language-${language}`} className="text-sm">
                    {language}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Category-specific Filters */}
        {Object.entries(categoryFilters).map(([filterKey, options]) => (
          <Collapsible key={filterKey} defaultOpen={false}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
              <span className="font-medium capitalize">
                {filterKey === 'update_frequency' ? 'Frequência' : 
                 filterKey === 'certificate' ? 'Certificado' :
                 filterKey}
              </span>
              <ChevronDown className="h-4 w-4 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {(options as string[]).map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filterKey}-${option}`}
                    checked={(filters[filterKey] || []).includes(option)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(filterKey, option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`${filterKey}-${option}`} className="text-sm">
                    {filterKey === 'certificate' ? (option === 'true' ? 'Com certificado' : 'Sem certificado') : option}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

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