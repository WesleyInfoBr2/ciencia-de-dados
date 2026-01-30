import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

interface TagWithCount {
  tag: string;
  count: number;
}

interface TagFilterProps {
  allTags: string[]; // Raw tags with duplicates for accurate counting
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  className?: string;
}

const INITIAL_VISIBLE_COUNT = 10;

export const TagFilter = ({ 
  allTags, 
  selectedTags, 
  onTagToggle,
  className 
}: TagFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Count tag occurrences and sort by usage (most used first)
  const tagsWithCount = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [allTags]);

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) {
      return tagsWithCount;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return tagsWithCount.filter(({ tag }) => 
      tag.toLowerCase().includes(query)
    );
  }, [tagsWithCount, searchQuery]);

  // Determine visible tags
  const visibleTags = useMemo(() => {
    if (showAll || searchQuery.trim()) {
      return filteredTags;
    }
    return filteredTags.slice(0, INITIAL_VISIBLE_COUNT);
  }, [filteredTags, showAll, searchQuery]);

  const remainingCount = filteredTags.length - INITIAL_VISIBLE_COUNT;
  const hasMoreTags = !searchQuery.trim() && remainingCount > 0;

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
        {selectedTags.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedTags.length} selecionada{selectedTags.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8 h-8 text-sm"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Tags List */}
      {filteredTags.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          Nenhuma tag encontrada para "{searchQuery}"
        </p>
      ) : (
        <>
          <ScrollArea className={showAll && !searchQuery ? "max-h-48" : undefined}>
            <div className="flex flex-wrap gap-2">
              {visibleTags.map(({ tag, count }) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 text-xs transition-colors"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              ))}
            </div>
          </ScrollArea>

          {/* Show More / Show Less Button */}
          {hasMoreTags && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-xs w-full justify-center gap-1 h-7"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Ver mais ({remainingCount})
                </>
              )}
            </Button>
          )}

          {/* Search results count */}
          {searchQuery.trim() && filteredTags.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredTags.length} tag{filteredTags.length > 1 ? 's' : ''} encontrada{filteredTags.length > 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </div>
  );
};
