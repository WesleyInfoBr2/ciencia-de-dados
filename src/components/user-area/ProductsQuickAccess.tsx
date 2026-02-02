import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Database, 
  FileSearch, 
  BookOpen, 
  Bot,
  ExternalLink,
  Lock,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasAccess: boolean;
  status: "available" | "coming_soon" | "beta";
  baseUrl: string;
}

interface ProductsQuickAccessProps {
  products: Product[];
  isLoading: boolean;
  onAccessProduct: (product: Product) => void;
}

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  estatisticafacil: BarChart3,
  dadosbrasil: Database,
  revprisma: FileSearch,
  pnfacil: BookOpen,
  gestorllm: Bot,
};

const statusLabels = {
  available: { label: "Disponível", variant: "default" as const },
  coming_soon: { label: "Em breve", variant: "secondary" as const },
  beta: { label: "Beta", variant: "outline" as const },
};

export const ProductsQuickAccess = ({
  products,
  isLoading,
  onAccessProduct,
}: ProductsQuickAccessProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Acesso Rápido aos Produtos</h2>
        <p className="text-muted-foreground text-sm">
          Acesse diretamente os produtos do ecossistema Ciência de Dados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const Icon = productIcons[product.slug] || Database;
          const statusConfig = statusLabels[product.status];

          return (
            <Card 
              key={product.id} 
              className={!product.hasAccess ? "opacity-75" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant={statusConfig.variant} className="mt-1 text-xs">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm line-clamp-2">
                  {product.description}
                </CardDescription>

                {product.hasAccess && product.status === "available" ? (
                  <Button 
                    className="w-full" 
                    onClick={() => onAccessProduct(product)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Entrar no Produto
                  </Button>
                ) : product.status !== "available" ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Em Desenvolvimento
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <Lock className="h-4 w-4 mr-2" />
                    Acesso Bloqueado
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum produto disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
};
