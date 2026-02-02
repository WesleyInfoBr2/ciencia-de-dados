import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Crown,
  Zap,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";

type SubscriptionStatus = "gratuito" | "limitado" | "ilimitado";

interface ProductAccess {
  id: string;
  name: string;
  slug: string;
  hasAccess: boolean;
  accessType: string;
  usageCount: number;
  usageLimit: number | null;
  expiresAt: string | null;
}

interface SubscriptionsSectionProps {
  subscriptionStatus: SubscriptionStatus;
  products: ProductAccess[];
  isLoading: boolean;
}

const statusConfig = {
  gratuito: {
    label: "Gratuito",
    icon: Gift,
    color: "bg-muted text-muted-foreground",
    description: "Acesso básico com limite de uso",
  },
  limitado: {
    label: "Limitado",
    icon: Zap,
    color: "bg-secondary text-secondary-foreground",
    description: "Acesso a produtos específicos com assinatura ativa",
  },
  ilimitado: {
    label: "Ilimitado",
    icon: Crown,
    color: "bg-primary text-primary-foreground",
    description: "Acesso completo a todos os produtos",
  },
};

export const SubscriptionsSection = ({
  subscriptionStatus,
  products,
  isLoading,
}: SubscriptionsSectionProps) => {
  const config = statusConfig[subscriptionStatus];
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${config.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Status da Assinatura
                  <Badge className={config.color}>{config.label}</Badge>
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link to="/precos">
                <CreditCard className="h-4 w-4 mr-2" />
                Gerenciar Assinatura
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Products Access List */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso aos Produtos</CardTitle>
          <CardDescription>
            Veja o status de acesso a cada produto do ecossistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {product.hasAccess ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {product.accessType}
                      </Badge>
                      {product.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expira em {new Date(product.expiresAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Progress */}
                {product.hasAccess && product.usageLimit && (
                  <div className="w-40">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="text-muted-foreground">Uso</span>
                      <span>
                        {product.usageCount}/{product.usageLimit}
                      </span>
                    </div>
                    <Progress
                      value={(product.usageCount / product.usageLimit) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                {!product.hasAccess && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/precos">Desbloquear</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum produto disponível no momento.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
