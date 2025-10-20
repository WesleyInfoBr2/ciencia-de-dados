import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
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

const ProductEstatisticaFacil = () => {
  const features = [
    {
      title: "Análises Descritivas Completas",
      description: "Gere estatísticas descritivas automaticamente com visualizações interativas"
    },
    {
      title: "Testes Estatísticos Avançados",
      description: "Execute testes paramétricos e não-paramétricos com interpretação automática"
    },
    {
      title: "Visualizações Profissionais",
      description: "Crie gráficos personalizáveis e prontos para publicação"
    },
    {
      title: "Relatórios Automatizados",
      description: "Exporte relatórios completos em PDF com resultados e interpretações"
    },
    {
      title: "Interface Intuitiva",
      description: "Não é necessário conhecimento de programação ou estatística avançada"
    },
    {
      title: "Suporte a Múltiplos Formatos",
      description: "Importe dados de CSV, Excel, SPSS e outros formatos populares"
    }
  ];

  const comparisonData = [
    {
      feature: "Análises por Mês",
      free: "10",
      limited: "Ilimitado",
      unlimited: "Ilimitado"
    },
    {
      feature: "Tipos de Testes",
      free: "Básicos",
      limited: "Todos",
      unlimited: "Todos"
    },
    {
      feature: "Tamanho do Dataset",
      free: "1.000 linhas",
      limited: "Sem limite",
      unlimited: "Sem limite"
    },
    {
      feature: "Exportação de Resultados",
      free: "PDF",
      limited: "PDF, Word, Excel",
      unlimited: "PDF, Word, Excel"
    },
    {
      feature: "Visualizações",
      free: "Básicas",
      limited: "Avançadas",
      unlimited: "Avançadas"
    },
    {
      feature: "Relatórios Personalizados",
      free: "❌",
      limited: "✅",
      unlimited: "✅"
    },
    {
      feature: "API de Integração",
      free: "❌",
      limited: "✅",
      unlimited: "✅"
    },
    {
      feature: "Histórico de Análises",
      free: "7 dias",
      limited: "Permanente",
      unlimited: "Permanente"
    },
    {
      feature: "Suporte Técnico",
      free: "Comunidade",
      limited: "E-mail",
      unlimited: "Prioritário"
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">EstatísticaFácil</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
                Análises Estatísticas{" "}
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Simples e Intuitivas
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Plataforma completa para análises estatísticas que transforma dados complexos 
                em insights compreensíveis, sem necessidade de conhecimento avançado em estatística.
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
                Tudo que você precisa para realizar análises estatísticas profissionais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
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
                Escolha o plano ideal para suas necessidades de análise estatística
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
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white">
              <CardContent className="p-12 text-center">
                <h3 className="font-heading text-3xl font-bold mb-4">
                  Seja Notificado no Lançamento
                </h3>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Cadastre-se para receber em primeira mão informações sobre o lançamento 
                  e garanta acesso antecipado ao EstatísticaFácil.
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

export default ProductEstatisticaFacil;
