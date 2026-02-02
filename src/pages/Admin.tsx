import { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";
import { ProductAccessManagement } from "@/components/admin/ProductAccessManagement";
import { TasksManagement } from "@/components/admin/TasksManagement";
import { WorkflowsManagement } from "@/components/admin/WorkflowsManagement";
import { Loader2, MessageCircle } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "products";

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                Administração
              </h1>
              <p className="text-muted-foreground">
                Gerencie produtos, usuários e configurações da plataforma
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/comments">
                <MessageCircle className="h-4 w-4" />
                Moderar Comentários
              </Link>
            </Button>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
              <TabsTrigger value="access">Acessos</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
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

            <TabsContent value="tasks" className="space-y-6">
              <TasksManagement />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <WorkflowsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
