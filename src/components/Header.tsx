import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, User, LogIn, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoCD from "@/assets/logo-cd.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src={logoCD} alt="CiênciaDeDados.org" className="w-8 h-8" />
          <span className="font-heading font-bold text-xl text-foreground">
            CiênciaDeDados.org
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Início
          </Link>
          <Link
            to="/wiki"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Wiki
          </Link>
          <Link
            to="/libraries"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Bibliotecas
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth flex items-center gap-1">
              Produtos
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/produtos/estatisticafacil" className="cursor-pointer">
                  EstatísticaFácil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/produtos/revprisma" className="cursor-pointer">
                  RevPrisma
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/produtos/dadosbrasil" className="cursor-pointer">
                  DadosBrasil
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to="/precos"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Preços
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-muted-foreground">
                Olá, {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex"
                onClick={handleAuthAction}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex"
                asChild
              >
                <Link to="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Link>
              </Button>
              <Button 
                variant="cta" 
                size="sm" 
                className="hidden md:flex"
                asChild
              >
                <Link to="/auth">
                  Começar Grátis
                </Link>
              </Button>
            </>
          )}
          
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