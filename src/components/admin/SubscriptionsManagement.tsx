import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar } from "lucide-react";

interface UserSubscription {
  id: string;
  user_id: string;
  plan: 'gratuito' | 'limitado' | 'ilimitado';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at: string | null;
  profiles: {
    email: string;
    full_name: string;
  };
}

export const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar perfis separadamente
      if (data) {
        const userIds = data.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]));
        
        const subscriptionsWithProfiles = data.map((sub) => ({
          ...sub,
          profiles: profileMap.get(sub.user_id) || { email: "", full_name: "" },
        }));

        setSubscriptions(subscriptionsWithProfiles as any);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Erro ao carregar assinaturas",
        description: "Não foi possível carregar a lista de assinaturas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const updateSubscription = async (
    subscriptionId: string,
    updates: { 
      plan?: 'gratuito' | 'limitado' | 'ilimitado'; 
      status?: 'active' | 'expired' | 'cancelled' | 'pending'; 
      expires_at?: string | null 
    }
  ) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({
        title: "Assinatura atualizada",
        description: "A assinatura foi atualizada com sucesso.",
      });

      fetchSubscriptions();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Erro ao atualizar assinatura",
        description: "Não foi possível atualizar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      gratuito: { variant: "secondary", label: "Gratuito" },
      limitado: { variant: "default", label: "Limitado" },
      ilimitado: { variant: "destructive", label: "Ilimitado" },
    };
    const config = variants[plan] || variants.gratuito;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Ativo" },
      expired: { variant: "destructive", label: "Expirado" },
      cancelled: { variant: "outline", label: "Cancelado" },
      pending: { variant: "secondary", label: "Pendente" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const email = sub.profiles?.email || "";
    const name = sub.profiles?.full_name || "";
    return (
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {subscription.profiles?.full_name || "Sem nome"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {subscription.profiles?.email}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {getPlanBadge(subscription.plan)}
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plano</label>
                <Select
                  value={subscription.plan}
                  onValueChange={(value: 'gratuito' | 'limitado' | 'ilimitado') =>
                    updateSubscription(subscription.id, { plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuito">Gratuito</SelectItem>
                    <SelectItem value="limitado">Limitado</SelectItem>
                    <SelectItem value="ilimitado">Ilimitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={subscription.status}
                  onValueChange={(value: 'active' | 'expired' | 'cancelled' | 'pending') =>
                    updateSubscription(subscription.id, { status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subscription.expires_at && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Expira: {new Date(subscription.expires_at).toLocaleDateString("pt-BR")}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Iniciado em: {new Date(subscription.started_at).toLocaleDateString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma assinatura encontrada.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
