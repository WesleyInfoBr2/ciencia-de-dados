import { useState } from "react";
import { LibraryCard } from "@/components/LibraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface LibraryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  website_url: string | null;
  price: string;
  tags: string[] | null;
  is_featured: boolean | null;
  status: string | null;
  attributes: unknown;
  created_at: string | null;
  updated_at: string | null;
}

interface FeaturedSectionProps {
  items: LibraryItem[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 8;

export function FeaturedSection({ items, loading }: FeaturedSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-6 w-6 text-accent fill-accent" />
          <h2 className="text-2xl font-bold">Destaques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleItems = items.slice(startIndex, endIndex);

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-accent fill-accent" />
          <h2 className="text-2xl font-bold">Destaques</h2>
          <span className="text-sm text-muted-foreground ml-2">
            ({items.length} itens)
          </span>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPage 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Ir para página ${i + 1}`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleItems.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 text-sm text-muted-foreground">
          Página {currentPage + 1} de {totalPages}
        </div>
      )}
    </section>
  );
}
