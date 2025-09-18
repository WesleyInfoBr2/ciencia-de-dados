import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, User, LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">CD</span>
          </div>
          <span className="font-heading font-bold text-xl text-foreground">
            CiênciaDeDados.org
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#inicio"
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Início
          </a>
          <a
            href="#comunidade"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Comunidade
          </a>
          <a
            href="#produtos"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Produtos
          </a>
          <a
            href="#precos"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Preços
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <User className="w-4 h-4 mr-2" />
            Entrar
          </Button>
          <Button variant="cta" size="sm" className="hidden md:flex">
            Começar Grátis
          </Button>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;