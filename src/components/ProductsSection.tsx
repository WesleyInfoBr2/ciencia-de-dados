import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, FileSpreadsheet, Globe, Lock, Star, Zap } from "lucide-react";

const ProductsSection = () => {
  const products = [
    {
      name: "EstatísticaFácil",
      slug: "estatisticafacil",
      description: "Plataforma completa para análises estatísticas intuitivas e relatórios automatizados",
      status: "beta",
      features: ["Análises Descritivas", "Testes Estatísticos", "Visualizações", "Relatórios PDF"],
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
      baseUrl: "estatisticafacil.cienciadedados.org"
    },
    {
      name: "RevPrisma",
      slug: "revprisma",
      description: "Sistema avançado de revisão sistemática e meta-análise para pesquisadores",
      status: "development",
      features: ["Screening Automático", "Extração de Dados", "Meta-análise", "Colaboração"],
      icon: FileSpreadsheet,
      color: "from-purple-500 to-pink-500",
      baseUrl: "revprisma.cienciadedados.org"
    },
    {
      name: "DadosBrasil",
      slug: "dadosbrasil",
      description: "Acesso centralizado aos principais datasets e indicadores públicos brasileiros",
      status: "alpha",
      features: ["APIs Unificadas", "Dados IBGE", "Indicadores Sociais", "Séries Temporais"],
      icon: Globe,
      color: "from-green-500 to-emerald-500",
      baseUrl: "dadosbrasil.cienciadedados.org"
    }
  ];

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
          {products.map((product, index) => (
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
                  <Button variant="default" size="sm" className="flex-1" disabled={product.status === 'development'}>
                    {product.status === 'development' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Em Breve
                      </>
                    ) : (
                      <>
                        Acessar
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="lg">
              Sugerir Produto
            </Button>
            <Button variant="outline" size="lg">
              Roadmap Público
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;