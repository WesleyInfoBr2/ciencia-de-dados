import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category_name?: string;
}

interface WikiSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const WikiSearch = ({ onSearch, placeholder = "Buscar artigos...", className }: WikiSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchArticles(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchArticles = async (searchQuery: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('wiki_posts')
        .select(`
          id,
          title,
          excerpt,
          slug,
          wiki_categories!inner(name)
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      const searchResults = data?.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        slug: post.slug,
        category_name: post.wiki_categories?.name
      })) || [];

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightSearchTerms = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
        part
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className || ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className="pl-10 pr-10"
            aria-label="Campo de busca"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Limpar busca"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {showResults && (results.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Buscando...
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    to={`/wiki/${result.slug}`}
                    className="block p-3 hover:bg-muted rounded-md transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="font-medium text-sm mb-1">
                      {highlightSearchTerms(result.title, query)}
                    </div>
                    {result.excerpt && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {highlightSearchTerms(result.excerpt, query)}
                      </div>
                    )}
                    {result.category_name && (
                      <div className="text-xs text-primary mt-1">
                        {result.category_name}
                      </div>
                    )}
                  </Link>
                ))}
                
                {onSearch && (
                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSearch(query);
                        setShowResults(false);
                      }}
                      className="w-full justify-start text-xs"
                    >
                      Ver todos os resultados para "{query}"
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};