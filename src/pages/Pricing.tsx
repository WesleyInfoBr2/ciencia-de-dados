import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { updatePageMetadata } from "@/utils/seo";

const Pricing = () => {
  const navigate = useNavigate();

  // SEO Metadata
  useEffect(() => {
    updatePageMetadata({
      title: "Preços e Planos | CiênciaDeDados.org",
      description: "Conheça os planos Gratuito, Limitado e Ilimitado. Acesse ferramentas de análise estatística, revisão sistemática e dados públicos a partir de R$ 0.",
      canonical: "https://cienciadedados.org/precos",
      ogTitle: "Planos e Preços - CiênciaDeDados.org",
      ogDescription: "Do plano gratuito ao acesso ilimitado por R$ 149/mês. Escolha o plano ideal para suas necessidades em ciência de dados.",
      ogImage: "https://cienciadedados.org/og-image.jpg",
    });
  }, []);

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar e explorar a comunidade",
      color: "green",
      features: [
        { text: "Acesso limitado a recursos gratuitos de todos os produtos", included: true },
        { text: "Criar e publicar posts na Wiki", included: true },
        { text: "Sugerir itens para as Bibliotecas", included: true },
        { text: "Participar de discussões da comunidade", included: true },
        { text: "Visualizar conteúdos públicos", included: true },
        { text: "Acesso completo aos produtos", included: false },
        { text: "Recursos avançados de análise", included: false },
        { text: "Suporte prioritário", included: false }
      ],
      cta: "Começar Gratuitamente",
      highlighted: false
    },
    {
      name: "Limitado",
      price: "A partir de R$ 79",
      period: "/mês por produto",
      description: "Acesso completo a um produto específico da sua escolha",
      color: "blue",
      features: [
        { text: "Tudo do plano Gratuito", included: true },
        { text: "Acesso completo a UM produto escolhido", included: true },
        { text: "Todos os recursos avançados do produto", included: true },
        { text: "Exportação de dados sem limites", included: true },
        { text: "API de integração (quando disponível)", included: true },
        { text: "Suporte por e-mail", included: true },
        { text: "Atualizações prioritárias", included: true },
        { text: "Acesso aos demais produtos", included: false }
      ],
      cta: "Escolher Produto",
      highlighted: true
    },
    {
      name: "Ilimitado",
      price: "R$ 149",
      period: "/mês",
      description: "Acesso completo a todos os produtos e ferramentas",
      color: "purple",
      features: [
        { text: "Tudo do plano Gratuito", included: true },
        { text: "Acesso completo a TODOS os produtos", included: true },
        { text: "EstatísticaFácil - Análises estatísticas completas", included: true },
        { text: "RevPrisma - Revisões sistemáticas ilimitadas", included: true },
        { text: "DadosBrasil - Dados públicos sem restrições", included: true },
        { text: "Futuros produtos incluídos automaticamente", included: true },
        { text: "Suporte prioritário multicanal", included: true },
        { text: "Economia de até 40% vs planos individuais", included: true }
      ],
      cta: "Assinar Ilimitado",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
                Escolha o Plano{" "}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Ideal para Você
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Seja para explorar gratuitamente, aprofundar-se em um produto específico, 
                ou ter acesso ilimitado a todas as ferramentas - temos o plano perfeito para suas necessidades.
              </p>

              <Badge variant="outline" className="mb-8">
                Sem compromisso • Cancele quando quiser
              </Badge>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${
                    plan.highlighted 
                      ? 'border-primary shadow-elegant scale-105' 
                      : 'shadow-card'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? "cta" : "outline"}
                      disabled
                    >
                      {plan.cta}
                    </Button>
                    
                    {index === 0 && (
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        Disponível agora para toda a comunidade
                      </p>
                    )}
                    {index > 0 && (
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        Disponível a partir de 31/01/2026
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Details */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
                Entenda as Diferenças
              </h2>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Plano Gratuito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Ideal para quem está começando e quer explorar a comunidade Ciência de Dados. 
                      Você tem acesso aos recursos básicos de todos os produtos, pode contribuir com 
                      conteúdo na Wiki e participar ativamente da comunidade.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Limitações:</strong> Acesso restrito a funcionalidades básicas, 
                      limites de uso em análises e exportações.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Plano Limitado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Perfeito para profissionais que precisam de uma ferramenta específica com 
                      todos os recursos. Você escolhe qual produto deseja usar por completo 
                      (EstatísticaFácil, RevPrisma ou DadosBrasil) e tem acesso ilimitado a 
                      todas as suas funcionalidades.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Valores:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                      <li>EstatísticaFácil: R$ 79/mês</li>
                      <li>RevPrisma: R$ 99/mês</li>
                      <li>DadosBrasil: R$ 79/mês</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Plano Ilimitado
                      <Badge className="ml-2">Melhor Custo-Benefício</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      A escolha mais vantajosa para quem usa ou pretende usar múltiplos produtos. 
                      Por apenas R$ 149/mês você tem acesso completo a todos os produtos atuais e 
                      futuros, representando uma economia significativa em relação aos planos individuais.
                    </p>
                    <p className="text-sm text-green-600 font-medium mb-2">
                      💰 Economia de até R$ 108/mês (40%) vs comprar todos os planos individuais
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Além disso, você garante acesso automático a todos os novos produtos que 
                      lançarmos no futuro, sem custo adicional.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
                Perguntas Frequentes
              </h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Posso mudar de plano depois?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                      As mudanças são aplicadas no próximo ciclo de cobrança.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">O que acontece se eu cancelar?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Você mantém acesso aos recursos pagos até o final do período já pago. 
                      Depois, volta automaticamente ao plano Gratuito, mantendo todo seu 
                      conteúdo e contribuições.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Há desconto para pagamento anual?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Sim! No lançamento ofereceremos planos anuais com 20% de desconto. 
                      Cadastre seu interesse para ser notificado.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary-glow border-0 text-white">
              <CardContent className="p-12 text-center">
                <h3 className="font-heading text-3xl font-bold mb-4">
                  Comece Gratuitamente Hoje
                </h3>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Explore a comunidade, crie conteúdo e experimente os recursos básicos 
                  de todos os produtos sem compromisso.
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Criar Conta Gratuita
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
