import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, LogIn, LogOut, ChevronDown, Shield, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import logoCD from "@/assets/logo-cd.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    }
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
                <Link to="/produtos" className="cursor-pointer font-medium">
                  Todos os Produtos
                </Link>
              </DropdownMenuItem>
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
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex"
                  asChild
                >
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
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
          
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={logoCD} alt="CiênciaDeDados.org" className="w-6 h-6" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/"
                  className="text-base font-medium text-foreground hover:text-primary transition-smooth py-2"
                  onClick={closeMobileMenu}
                >
                  Início
                </Link>
                <Link
                  to="/wiki"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-smooth py-2"
                  onClick={closeMobileMenu}
                >
                  Wiki
                </Link>
                <Link
                  to="/libraries"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-smooth py-2"
                  onClick={closeMobileMenu}
                >
                  Bibliotecas
                </Link>
                
                {/* Produtos submenu */}
                <div className="py-2">
                  <Link
                    to="/produtos"
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-smooth mb-2 block"
                    onClick={closeMobileMenu}
                  >
                    Produtos
                  </Link>
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    <Link
                      to="/produtos/estatisticafacil"
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1"
                      onClick={closeMobileMenu}
                    >
                      EstatísticaFácil
                    </Link>
                    <Link
                      to="/produtos/revprisma"
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1"
                      onClick={closeMobileMenu}
                    >
                      RevPrisma
                    </Link>
                    <Link
                      to="/produtos/dadosbrasil"
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1"
                      onClick={closeMobileMenu}
                    >
                      DadosBrasil
                    </Link>
                  </div>
                </div>

                <Link
                  to="/precos"
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-smooth py-2"
                  onClick={closeMobileMenu}
                >
                  Preços
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-smooth py-2 flex items-center gap-2"
                    onClick={closeMobileMenu}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {/* Auth section */}
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAuthAction}
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="w-full justify-start"
                      >
                        <Link to="/auth" onClick={closeMobileMenu}>
                          <User className="w-4 h-4 mr-2" />
                          Entrar
                        </Link>
                      </Button>
                      <Button 
                        variant="cta" 
                        size="sm" 
                        asChild
                        className="w-full"
                      >
                        <Link to="/auth" onClick={closeMobileMenu}>
                          Começar Grátis
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;