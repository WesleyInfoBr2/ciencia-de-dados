import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Comunidade",
      links: [
        { name: "Wiki", href: "#wiki" },
        { name: "Conteúdos", href: "#conteudos" },
        { name: "Como Fazer", href: "#tutoriais" },
        { name: "Aplicações Práticas", href: "#cases" },
      ]
    },
    {
      title: "Recursos",
      links: [
        { name: "Ferramentas Digitais", href: "#ferramentas" },
        { name: "Formações", href: "#formacoes" },
        { name: "Livros e Materiais", href: "#materiais" },
        { name: "Códigos Python", href: "#codigos" },
      ]
    },
    {
      title: "Produtos",
      links: [
        { name: "EstatísticaFácil", href: "#estatisticafacil" },
        { name: "RevPrisma", href: "#revprisma" },
        { name: "DadosBrasil", href: "#dadosbrasil" },
        { name: "Roadmap", href: "#roadmap" },
      ]
    },
    {
      title: "Suporte",
      links: [
        { name: "Documentação", href: "#docs" },
        { name: "FAQ", href: "#faq" },
        { name: "Contato", href: "#contato" },
        { name: "Status", href: "#status" },
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                CiênciaDeDados.org
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
              A plataforma brasileira para ciência de dados. Conectamos profissionais, 
              compartilhamos conhecimento e desenvolvemos ferramentas que impulsionam a 
              análise de dados no Brasil.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-heading font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} CiênciaDeDados.org</span>
            <Separator orientation="vertical" className="h-4" />
            <a href="#privacidade" className="hover:text-primary transition-smooth">
              Privacidade
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="#termos" className="hover:text-primary transition-smooth">
              Termos de Uso
            </a>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>para a comunidade brasileira de dados</span>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </footer>
  );
};

export default Footer;