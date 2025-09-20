import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info, Star, Globe, Code, BookOpen, Database as DatabaseIcon, BarChart3 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LibraryItem = Database['public']['Tables']['library_items']['Row'];

interface LibraryCardProps {
  item: LibraryItem;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tools': return Globe;
    case 'courses': return BookOpen;
    case 'codes': return Code;
    case 'sources': return DatabaseIcon;
    case 'datasets': return BarChart3;
    default: return Globe;
  }
};

const getPriceColor = (price: string) => {
  switch (price) {
    case 'free': return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'paid': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'freemium': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'subscription': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    default: return 'bg-muted';
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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
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
              {item.language && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {item.language}
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
          
          {item.is_open_source && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              Open Source
            </Badge>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
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

        {/* Category-specific attributes */}
        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {item.category === 'tools' && (
              <>
                {(item.attributes as any).platforms && (
                  <div>Plataformas: {(item.attributes as any).platforms.join(", ")}</div>
                )}
                {(item.attributes as any).license && (
                  <div>Licença: {(item.attributes as any).license}</div>
                )}
              </>
            )}
            
            {item.category === 'courses' && (
              <>
                {(item.attributes as any).provider && (
                  <div>Provedor: {(item.attributes as any).provider}</div>
                )}
                {(item.attributes as any).duration && (
                  <div>Duração: {(item.attributes as any).duration}</div>
                )}
                {(item.attributes as any).certificate && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Certificado incluído
                  </div>
                )}
              </>
            )}
            
            {item.category === 'codes' && (
              <>
                {(item.attributes as any).version && (
                  <div>Versão: {(item.attributes as any).version}</div>
                )}
                {(item.attributes as any).status && (
                  <div>Status: {(item.attributes as any).status}</div>
                )}
              </>
            )}
            
            {item.category === 'sources' && (
              <>
                {(item.attributes as any).country && (
                  <div>País: {(item.attributes as any).country}</div>
                )}
                {(item.attributes as any).update_frequency && (
                  <div>Frequência: {(item.attributes as any).update_frequency}</div>
                )}
              </>
            )}
            
            {item.category === 'datasets' && (
              <>
                {(item.attributes as any).year && (
                  <div>Ano: {(item.attributes as any).year}</div>
                )}
                {(item.attributes as any).format && (
                  <div>Formato: {(item.attributes as any).format}</div>
                )}
              </>
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