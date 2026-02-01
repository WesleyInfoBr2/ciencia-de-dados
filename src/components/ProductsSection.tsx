import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { redirectToProduct } from "@/lib/sso";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTS } from "@/pages/Products";

const ProductsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mostrar apenas os 3 primeiros produtos na home
  const featuredProducts = PRODUCTS.slice(0, 3);

  const handleAccessProduct = async (product: typeof PRODUCTS[0]) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para acessar este produto.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (product.status === "development") {
      toast({
        title: "Em desenvolvimento",
        description: "Este produto ainda está em desenvolvimento e não está disponível para acesso.",
      });
      return;
    }

    toast({
      title: "Verificando acesso...",
      description: "Aguarde enquanto verificamos seu acesso ao produto.",
    });

    const success = await redirectToProduct(
      product.slug,
      product.baseUrl,
      user.id
    );

    if (!success) {
      toast({
        title: "Acesso negado",
        description: "Você não tem acesso a este produto. Entre em contato para solicitar acesso.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "beta":
        return <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">Beta</Badge>;
      case "development":
        return <Badge variant="outline" className="border-orange-200 text-orange-600">Em Desenvolvimento</Badge>;
      case "alpha":
        return <Badge variant="outline" className="border-red-200 text-red-600">Alpha</Badge>;
      default:
        return <Badge variant="default">Ativo</Badge>;
    }
  };

  return (
    <section id="produtos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Zap className="w-4 h-4 text-secondary mr-2" />
            <span className="text-sm font-medium text-secondary-foreground">Suite de Produtos</span>
          </div>
          
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Ferramentas Poderosas para{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Ciência de Dados
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Uma suíte integrada de aplicações especializadas para diferentes aspectos da ciência de dados. 
            Cada ferramenta foi desenvolvida pensando na produtividade e facilidade de uso.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth group cursor-pointer overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${product.color}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${product.color} flex items-center justify-center group-hover:scale-110 transition-bounce`}>
                    <product.icon className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(product.status)}
                </div>
                
                <CardTitle className="text-xl font-semibold mb-2">{product.name}</CardTitle>
                <div className="text-xs text-muted-foreground font-mono">{product.baseUrl}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {product.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Principais recursos:</div>
                  <div className="flex flex-wrap gap-1">
                    {product.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => navigate(`/produtos`)}
                  >
                    Saiba Mais
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleAccessProduct(product)}
                    disabled={product.status === "development"}
                  >
                    {product.status === "development" ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <>Acessar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mb-12">
          <Button variant="outline" size="lg" onClick={() => navigate('/produtos')}>
            Ver Todos os Produtos ({PRODUCTS.length})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Call to Action for More Products */}
        <div className="text-center bg-gradient-subtle rounded-2xl p-8 shadow-card">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-4">
            Mais Produtos em Desenvolvimento
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nossa equipe está constantemente trabalhando em novas ferramentas. 
            Junte-se à nossa comunidade para ser o primeiro a saber sobre novos lançamentos.
          </p>
          <div className="flex justify-center">
            <Button variant="cta" size="lg" onClick={() => navigate('/contato?motivo=sugerir-produto')}>
              Sugerir Produto
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
