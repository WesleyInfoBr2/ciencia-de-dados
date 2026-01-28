import { LibraryCard } from "@/components/LibraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  website_url: string | null;
  price: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  status: string | null;
  language: string | null;
  is_open_source: boolean | null;
  attributes: unknown;
  created_at: string | null;
  updated_at: string | null;
}

interface LibraryGridProps {
  items: LibraryItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}

export function LibraryGrid({ items, loading, hasMore, onLoadMore, loadingMore }: LibraryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-2">
          Nenhum item encontrado
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou a busca
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
