import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductRevPrisma = () => {
  const features = [
    {
      title: "Screening Automatizado",
      description: "IA para triagem automática de artigos com base em critérios de inclusão/exclusão"
    },
    {
      title: "Extração de Dados Estruturada",
      description: "Formulários customizáveis para extração padronizada de dados dos estudos"
    },
    {
      title: "Meta-análise Integrada",
      description: "Ferramentas estatísticas para síntese quantitativa de resultados"
    },
    {
      title: "Colaboração em Tempo Real",
      description: "Trabalhe simultaneamente com sua equipe com controle de conflitos"
    },
    {
      title: "Conformidade PRISMA",
      description: "Fluxogramas e relatórios automáticos seguindo diretrizes PRISMA 2020"
    },
    {
      title: "Gestão de Referências",
      description: "Importação direta de bases como PubMed, Scopus e Web of Science"
    }
  ];

  const comparisonData = [
    {
      feature: "Projetos Simultâneos",
      free: "1",
      limited: "5",
      unlimited: "Ilimitado"
    },
    {
      feature: "Screening por IA",
      free: "100 artigos",
      limited: "1.000 artigos",
      unlimited: "Ilimitado"
    },
    {
      feature: "Colaboradores por Projeto",
      free: "2",
      limited: "10",
      unlimited: "Ilimitado"
    },
    {
      feature: "Extração de Dados",
      free: "Formulário básico",
      limited: "Customizado",
      unlimited: "Avançado + IA"
    },
    {
      feature: "Meta-análise",
      free: "❌",
      limited: "Básica",
      unlimited: "Avançada"
    },
    {
      feature: "Exportação PRISMA",
      free: "PDF",
      limited: "PDF + Word",
      unlimited: "Todos formatos"
    },
    {
      feature: "Histórico de Versões",
      free: "7 dias",
      limited: "90 dias",
      unlimited: "Permanente"
    },
    {
      feature: "Suporte Técnico",
      free: "Comunidade",
      limited: "E-mail",
      unlimited: "Prioritário"
    },
    {
      feature: "API de Integração",
      free: "❌",
      limited: "❌",
      unlimited: "✅"
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <FileSpreadsheet className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">RevPrisma</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
                Revisões Sistemáticas{" "}
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Inteligentes
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sistema completo para condução de revisões sistemáticas e meta-análises 
                seguindo as diretrizes PRISMA, com automação por IA e colaboração em tempo real.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  Em Desenvolvimento
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Lançamento previsto: 31/01/2026
                </div>
              </div>

              <Button variant="cta" size="lg" disabled>
                Notificar-me no Lançamento
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Recursos Principais
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para conduzir revisões sistemáticas de alta qualidade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Planos e Funcionalidades
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Escolha o plano ideal para seus projetos de revisão sistemática
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Card className="shadow-elegant">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Funcionalidade</TableHead>
                      <TableHead className="text-center">Gratuito</TableHead>
                      <TableHead className="text-center">Limitado</TableHead>
                      <TableHead className="text-center">Ilimitado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.feature}</TableCell>
                        <TableCell className="text-center">{row.free}</TableCell>
                        <TableCell className="text-center">{row.limited}</TableCell>
                        <TableCell className="text-center">{row.unlimited}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Preço Mensal</TableCell>
                      <TableCell className="text-center font-bold text-green-600">R$ 0</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">R$ 99</TableCell>
                      <TableCell className="text-center font-bold text-purple-600">
                        R$ 149*
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-xs text-muted-foreground">
                        * O plano Ilimitado dá acesso completo a todos os produtos por R$ 149/mês.{" "}
                        <a href="/precos" className="text-primary hover:underline">
                          Saiba mais sobre os planos
                        </a>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
              <CardContent className="p-12 text-center">
                <h3 className="font-heading text-3xl font-bold mb-4">
                  Seja Notificado no Lançamento
                </h3>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Cadastre-se para receber em primeira mão informações sobre o lançamento 
                  e garanta acesso antecipado ao RevPrisma.
                </p>
                <Button variant="secondary" size="lg" disabled>
                  Cadastrar Interesse
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

export default ProductRevPrisma;
