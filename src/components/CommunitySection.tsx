import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Code, 
  Database, 
  GraduationCap, 
  Lightbulb, 
  Settings,
  Users,
  FileText,
  Wrench
} from "lucide-react";

const CommunitySection = () => {
  const contentTypes = [
    {
      title: "Conteúdo",
      description: "Artigos e insights sobre ciência de dados",
      icon: FileText,
      count: "120+ artigos",
      color: "text-blue-600"
    },
    {
      title: "Como Fazer",
      description: "Tutoriais práticos e guias passo a passo",
      icon: Lightbulb,
      count: "80+ tutoriais",
      color: "text-green-600"
    },
    {
      title: "Aplicação Prática",
      description: "Cases reais e projetos implementados",
      icon: Settings,
      count: "45+ cases",
      color: "text-purple-600"
    }
  ];

  const libraries = [
    {
      title: "Ferramentas Digitais",
      description: "Softwares e plataformas essenciais",
      icon: Wrench,
      count: "50+ ferramentas"
    },
    {
      title: "Formações Digitais",
      description: "Cursos e trilhas de aprendizagem",
      icon: GraduationCap,
      count: "30+ formações"
    },
    {
      title: "Livros e Materiais",
      description: "E-books e recursos educacionais",
      icon: BookOpen,
      count: "40+ materiais"
    },
    {
      title: "Códigos e Pacotes",
      description: "Bibliotecas Python e snippets úteis",
      icon: Code,
      count: "25+ códigos"
    },
    {
      title: "Bancos de Dados",
      description: "Datasets públicos e bases de dados",
      icon: Database,
      count: "15+ bancos"
    }
  ];

  return (
    <section id="comunidade" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Users className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Comunidade Aberta</span>
          </div>
          
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Wiki da Comunidade
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Uma base de conhecimento colaborativa onde todos podem contribuir e aprender. 
            Acesse conteúdos gratuitos, publique seus próprios artigos e explore nossa biblioteca de recursos.
          </p>
        </div>

        {/* Content Types */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-8 text-center">
            Tipos de Conteúdo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contentTypes.map((type, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth group cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-bounce">
                    <type.icon className={`w-6 h-6 ${type.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{type.title}</CardTitle>
                  <div className="text-sm text-secondary font-medium">{type.count}</div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resource Libraries */}
        <div className="mb-12">
          <h3 className="font-heading text-2xl font-semibold text-foreground mb-8 text-center">
            Bibliotecas de Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.map((library, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                      <library.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{library.title}</CardTitle>
                      <div className="text-xs text-secondary font-medium">{library.count}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{library.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg" className="mr-4">
            Explorar Wiki
          </Button>
          <Button variant="outline" size="lg">
            Contribuir Conteúdo
          </Button>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      </div>
    </section>
  );
};

export default CommunitySection;