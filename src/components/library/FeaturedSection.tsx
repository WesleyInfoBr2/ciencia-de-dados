import { LibraryCard } from "@/components/LibraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

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

interface FeaturedSectionProps {
  items: LibraryItem[];
  loading: boolean;
}

export function FeaturedSection({ items, loading }: FeaturedSectionProps) {
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

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-6 w-6 text-accent fill-accent" />
        <h2 className="text-2xl font-bold">Destaques</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.slice(0, 8).map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
