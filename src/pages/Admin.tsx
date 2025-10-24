import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";
import { ProductAccessManagement } from "@/components/admin/ProductAccessManagement";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
              Administração
            </h1>
            <p className="text-muted-foreground">
              Gerencie produtos, usuários e configurações da plataforma
            </p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
              <TabsTrigger value="access">Acessos</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersManagement />
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionsManagement />
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              <ProductAccessManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
