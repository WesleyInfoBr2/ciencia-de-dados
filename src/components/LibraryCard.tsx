import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info, Wrench, Code, GraduationCap, Database as DatabaseIcon, BarChart3, Star } from "lucide-react";

// Interface para o item da biblioteca (compatível com a nova estrutura)
interface LibraryItem {
  id: string;
  category: string;
  name: string;
  short_description: string | null;
  website_url: string | null;
  price: string;
  tags: string[] | null;
  is_featured: boolean | null;
  status: string | null;
  slug: string;
  attributes: unknown;
  created_at: string | null;
  updated_at: string | null;
}

interface LibraryCardProps {
  item: LibraryItem;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tools': return Wrench;
    case 'courses': return GraduationCap;
    case 'codes': return Code;
    case 'sources': return DatabaseIcon;
    case 'datasets': return BarChart3;
    default: return Wrench;
  }
};

const getPriceColor = (price: string) => {
  switch (price) {
    case 'free': return 'bg-accent/10 text-accent-foreground';
    case 'paid': return 'bg-destructive/10 text-destructive';
    case 'freemium': return 'bg-primary/10 text-primary';
    case 'subscription': return 'bg-secondary text-secondary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPriceLabel = (price: string) => {
  switch (price) {
    case 'free': return 'Gratuito';
    case 'paid': return 'Pago';
    case 'freemium': return 'Freemium';
    case 'subscription': return 'Assinatura';
    default: return price;
  }
};

export function LibraryCard({ item }: LibraryCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const Icon = getCategoryIcon(item.category);
  
  const shouldTruncate = item.short_description && item.short_description.length > 120;
  const displayDescription = shouldTruncate && !isDescriptionExpanded 
    ? item.short_description?.slice(0, 120) + "..." 
    : item.short_description;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden relative">
      {/* Featured indicator */}
      {item.is_featured && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-accent fill-accent" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {item.name}
              </CardTitle>
              {(item.attributes as Record<string, any>)?.language && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {(item.attributes as Record<string, any>).language}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {item.short_description && (
          <CardDescription className="text-sm leading-relaxed mb-4">
            {displayDescription}
            {shouldTruncate && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="ml-1 text-primary hover:underline text-xs font-medium"
              >
                {isDescriptionExpanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </CardDescription>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getPriceColor(item.price)}>
            {getPriceLabel(item.price)}
          </Badge>
          
          {(item.attributes as Record<string, any>)?.open_source && (
            <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/30">
              Open Source
            </Badge>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 bg-muted/50"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-muted/50">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        {item.website_url && (
          <Button asChild size="sm" className="flex-1">
            <a href={item.website_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Acessar
            </a>
          </Button>
        )}
        
        <Button asChild variant="outline" size="sm">
          <Link to={`/bibliotecas/${item.slug}`}>
            <Info className="h-3 w-3 mr-1" />
            Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
