import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, FileSpreadsheet, Globe, Heart, Lightbulb, Lock, Rocket, Zap, Brain, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { redirectToProduct } from "@/lib/sso";
import { useToast } from "@/hooks/use-toast";

// Definição centralizada dos produtos - sincronizada com o banco de dados
export const PRODUCTS = [
  {
    name: "EstatísticaFácil",
    slug: "estatisticafacil",
    description: "Plataforma completa para análises estatísticas intuitivas e relatórios automatizados. Ideal para pesquisadores, estudantes e profissionais que precisam realizar análises descritivas e inferenciais de forma simplificada.",
    status: "development",
    features: ["Análises Descritivas", "Testes Estatísticos", "Visualizações Interativas", "Relatórios PDF Automáticos"],
    icon: BarChart3,
    color: "from-blue-500 to-cyan-500",
    baseUrl: "estatisticafacil.cienciadedados.org",
    launchDate: "Previsão: Março 2026"
  },
  {
    name: "RevPrisma",
    slug: "revprisma",
    description: "Sistema avançado de revisão sistemática e meta-análise para pesquisadores. Automatize o processo de screening, extração de dados e síntese de evidências científicas.",
    status: "development",
    features: ["Screening Automático com IA", "Extração de Dados", "Meta-análise", "Colaboração em Tempo Real"],
    icon: FileSpreadsheet,
    color: "from-purple-500 to-pink-500",
    baseUrl: "revprisma.cienciadedados.org",
    launchDate: "Previsão: Abril 2026"
  },
  {
    name: "DadosBrasil",
    slug: "dadosbrasil",
    description: "Acesso centralizado aos principais datasets e indicadores públicos brasileiros. APIs unificadas para consumo de dados do IBGE, DataSUS, INEP e outras fontes oficiais.",
    status: "development",
    features: ["APIs Unificadas", "Dados IBGE e DataSUS", "Indicadores Sociais", "Séries Temporais"],
    icon: Globe,
    color: "from-green-500 to-emerald-500",
    baseUrl: "dadosbrasil.cienciadedados.org",
    launchDate: "Previsão: Maio 2026"
  },
  {
    name: "PnFácil",
    slug: "pnfacil",
    description: "Ferramenta para criação e gestão de planos de negócios simplificados. Ideal para empreendedores e startups que precisam estruturar seus modelos de negócio de forma ágil.",
    status: "development",
    features: ["Templates Prontos", "Canvas Interativo", "Projeções Financeiras", "Exportação PDF"],
    icon: FileText,
    color: "from-orange-500 to-amber-500",
    baseUrl: "pnfacil.cienciadedados.org",
    launchDate: "Previsão: Março 2026"
  },
  {
    name: "GestorLLM",
    slug: "gestorllm",
    description: "Plataforma de gestão e otimização de Large Language Models para empresas. Gerencie prompts, custos e performance dos seus modelos de IA em um único lugar.",
    status: "development",
    features: ["Gestão de Prompts", "Monitoramento de Custos", "A/B Testing", "Analytics Avançado"],
    icon: Brain,
    color: "from-indigo-500 to-violet-500",
    baseUrl: "gestorllm.cienciadedados.org",
    launchDate: "Previsão: Junho 2026"
  }
];

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
      case "production":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Em Produção</Badge>;
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Rocket className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">Produtos da Comunidade</span>
              </div>

              <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ferramentas que{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Impulsionam sua Análise
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                Desenvolvemos ferramentas especializadas para diferentes aspectos da ciência de dados. 
                Cada produto foi criado pensando na produtividade e facilidade de uso dos profissionais brasileiros.
              </p>

              <Card className="bg-card/50 backdrop-blur border-primary/20 max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground mb-2">Apoie a Comunidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Ao contratar nossos produtos, você ajuda a manter a comunidade CiênciaDeDados.org ativa e em constante evolução. 
                        Os recursos são reinvestidos no desenvolvimento de novas ferramentas, manutenção da Wiki e criação de conteúdo educacional gratuito.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Access Model Explanation */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 text-center">
                Modelo de Acesso
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">Gratuito</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acesso básico a todos os produtos com limite de uso. Ideal para conhecer as ferramentas.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge>Limitado</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo a produtos específicos que você assinar. Pague apenas pelo que usar.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className="bg-green-600">Ilimitado</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo a todos os produtos. Automaticamente calculado quando você assina todos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                Nosso Portfólio de Produtos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça as ferramentas que estamos desenvolvendo para a comunidade brasileira de ciência de dados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PRODUCTS.map((product, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth group overflow-hidden flex flex-col">
                  <div className={`h-2 bg-gradient-to-r ${product.color}`} />

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${product.color} flex items-center justify-center group-hover:scale-110 transition-bounce`}>
                        <product.icon className="w-7 h-7 text-white" />
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    <CardTitle className="text-xl font-semibold mb-1">{product.name}</CardTitle>
                    <div className="text-xs text-muted-foreground font-mono">{product.baseUrl}</div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="text-sm leading-relaxed mb-4">
                      {product.description}
                    </CardDescription>

                    <div className="space-y-3 mb-6">
                      <div className="text-sm font-medium text-foreground">Principais recursos:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {product.status === "development" && (
                      <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {product.launchDate}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-border flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccessProduct(product)}
                        disabled={product.status === "development"}
                      >
                        {product.status === "development" ? (
                          <>
                            <Lock className="w-4 h-4 mr-1" />
                            Em Breve
                          </>
                        ) : (
                          <>
                            Acessar Ferramenta
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/precos")}
                      >
                        Ver Preços
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Suggest Products Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center bg-gradient-subtle rounded-2xl p-8 md:p-12 shadow-card max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
                <Lightbulb className="w-4 h-4 text-secondary mr-2" />
                <span className="text-sm font-medium text-secondary-foreground">Contribua com Ideias</span>
              </div>

              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                Sugira Novos Produtos para o Roadmap
              </h2>
              
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Estamos constantemente buscando novas ideias para desenvolver ferramentas que atendam às necessidades 
                da comunidade brasileira de ciência de dados. Sua sugestão pode se tornar o próximo grande produto!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="cta" 
                  size="lg" 
                  onClick={() => navigate('/contato?motivo=sugerir-produto')}
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Sugerir Produto
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/faq')}
                >
                  Ver Perguntas Frequentes
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
