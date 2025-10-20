import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
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

const ProductDadosBrasil = () => {
  const features = [
    {
      title: "API Unificada",
      description: "Acesse múltiplas fontes de dados públicos através de uma única interface"
    },
    {
      title: "Dados do IBGE",
      description: "Censos, pesquisas domiciliares, indicadores sociais e econômicos atualizados"
    },
    {
      title: "Indicadores Sociais",
      description: "Saúde, educação, segurança, emprego e desenvolvimento humano"
    },
    {
      title: "Séries Temporais",
      description: "Dados históricos para análises de tendências e projeções"
    },
    {
      title: "Dados Geoespaciais",
      description: "Informações por município, estado e região com mapas interativos"
    },
    {
      title: "Exportação Facilitada",
      description: "Baixe dados em CSV, JSON, Excel ou conecte diretamente via API"
    }
  ];

  const comparisonData = [
    {
      feature: "Requisições por Mês",
      free: "1.000",
      limited: "50.000",
      unlimited: "Ilimitado"
    },
    {
      feature: "Fontes de Dados",
      free: "IBGE básico",
      limited: "Todas públicas",
      unlimited: "Públicas + Premium"
    },
    {
      feature: "Histórico de Dados",
      free: "5 anos",
      limited: "20 anos",
      unlimited: "Completo"
    },
    {
      feature: "Downloads Simultâneos",
      free: "1",
      limited: "10",
      unlimited: "Ilimitado"
    },
    {
      feature: "Formato de Exportação",
      free: "CSV, JSON",
      limited: "+ Excel, Parquet",
      unlimited: "Todos formatos"
    },
    {
      feature: "Cache de Consultas",
      free: "❌",
      limited: "24 horas",
      unlimited: "Personalizado"
    },
    {
      feature: "Webhooks",
      free: "❌",
      limited: "5",
      unlimited: "Ilimitado"
    },
    {
      feature: "Suporte Técnico",
      free: "Comunidade",
      limited: "E-mail",
      unlimited: "Prioritário"
    },
    {
      feature: "SLA de Disponibilidade",
      free: "95%",
      limited: "99%",
      unlimited: "99.9%"
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Globe className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">DadosBrasil</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
                Dados Públicos Brasileiros{" "}
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Centralizados
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Acesso unificado aos principais datasets e indicadores públicos do Brasil. 
                Simplifique suas análises com dados confiáveis e atualizados.
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
                Tudo que você precisa para acessar e analisar dados públicos brasileiros
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
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
                Escolha o plano ideal para suas necessidades de acesso a dados
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
                      <TableCell className="text-center font-bold text-blue-600">R$ 79</TableCell>
                      <TableCell className="text-center font-bold text-purple-600">R$ 249</TableCell>
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
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white">
              <CardContent className="p-12 text-center">
                <h3 className="font-heading text-3xl font-bold mb-4">
                  Seja Notificado no Lançamento
                </h3>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Cadastre-se para receber em primeira mão informações sobre o lançamento 
                  e garanta acesso antecipado ao DadosBrasil.
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

export default ProductDadosBrasil;
