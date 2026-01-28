import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, X, Wrench, GraduationCap, Code, Database, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LibraryCategory = 'tools' | 'courses' | 'codes' | 'sources' | 'datasets';

interface LibrarySidebarProps {
  selectedCategory: LibraryCategory | 'all';
  onCategoryChange: (category: LibraryCategory | 'all') => void;
  filters: Record<string, string[]>;
  onFilterChange: (filterType: string, values: string[]) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  { id: 'all' as const, label: 'Todas', icon: null },
  { id: 'tools' as LibraryCategory, label: 'Ferramentas Digitais', icon: Wrench },
  { id: 'courses' as LibraryCategory, label: 'Formações Digitais', icon: GraduationCap },
  { id: 'codes' as LibraryCategory, label: 'Códigos e Pacotes', icon: Code },
  { id: 'sources' as LibraryCategory, label: 'Fontes de Dados', icon: Database },
  { id: 'datasets' as LibraryCategory, label: 'Bases de Dados', icon: BarChart3 },
];

const PRICE_OPTIONS = [
  { value: 'free', label: 'Gratuito' },
  { value: 'paid', label: 'Pago' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'subscription', label: 'Assinatura' },
];

export function LibrarySidebar({
  selectedCategory,
  onCategoryChange,
  filters,
  onFilterChange,
  onClearFilters,
}: LibrarySidebarProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    openSource: true,
    language: true,
    tags: false,
  });

  useEffect(() => {
    fetchAvailableOptions();
  }, [selectedCategory]);

  const fetchAvailableOptions = async () => {
    try {
      let query = supabase
        .from('library_items')
        .select('tags, language');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: items } = await query;

      if (items) {
        // Extract unique tags
        const allTags = items.flatMap(item => item.tags || []);
        setAvailableTags([...new Set(allTags)].sort().slice(0, 30));

        // Extract unique languages
        const allLanguages = items
          .map(item => item.language)
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
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = Object.values(filters).some(values => values.length > 0);

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 pr-4">
            {/* Category Filter */}
            <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                <span className="font-medium">Biblioteca</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat.icon && <cat.icon className="h-4 w-4" />}
                    {cat.label}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Price Filter */}
            <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                <span className="font-medium">Preço</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {PRICE_OPTIONS.map(price => (
                  <div key={price.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`price-${price.value}`}
                      checked={(filters.price || []).includes(price.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('price', price.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`price-${price.value}`} className="text-sm cursor-pointer">
                      {price.label}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Open Source Filter */}
            <Collapsible open={openSections.openSource} onOpenChange={() => toggleSection('openSource')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                <span className="font-medium">Código Aberto</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.openSource ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-source-true"
                    checked={(filters.is_open_source || []).includes('true')}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('is_open_source', 'true', checked as boolean)
                    }
                  />
                  <Label htmlFor="open-source-true" className="text-sm cursor-pointer">
                    Apenas Open Source
                  </Label>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Language Filter */}
            {availableLanguages.length > 0 && (
              <Collapsible open={openSections.language} onOpenChange={() => toggleSection('language')}>
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
                      <Label htmlFor={`language-${language}`} className="text-sm cursor-pointer">
                        {language}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <Collapsible open={openSections.tags} onOpenChange={() => toggleSection('tags')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                  <span className="font-medium">Tags</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.tags ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map(tag => (
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
