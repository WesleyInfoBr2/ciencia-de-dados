import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ProductAccess {
  id: string;
  user_id: string;
  product_id: string;
  access_type: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  profiles: {
    email: string;
    full_name: string;
  };
  products: {
    name: string;
    slug: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export const ProductAccessManagement = () => {
  const [accesses, setAccesses] = useState<ProductAccess[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [accessType, setAccessType] = useState("limitado");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchData = async () => {
    try {
      const [accessesRes, productsRes, usersRes] = await Promise.all([
        supabase
          .from("product_access")
          .select("*")
          .order("granted_at", { ascending: false }),
        supabase.from("products").select("id, name, slug"),
        supabase.from("profiles").select("id, email, full_name"),
      ]);

      if (accessesRes.error) throw accessesRes.error;
      if (productsRes.error) throw productsRes.error;
      if (usersRes.error) throw usersRes.error;

      // Buscar profiles e products separadamente
      if (accessesRes.data) {
        const userIds = [...new Set(accessesRes.data.map((a) => a.user_id))];
        const productIds = [...new Set(accessesRes.data.map((a) => a.product_id))];

        const [profilesRes, productsDataRes] = await Promise.all([
          supabase.from("profiles").select("id, email, full_name").in("id", userIds),
          supabase.from("products").select("id, name, slug").in("id", productIds),
        ]);

        const profileMap = new Map(profilesRes.data?.map((p) => [p.id, p]));
        const productMap = new Map(productsDataRes.data?.map((p) => [p.id, p]));

        const accessesWithRelations = accessesRes.data.map((access) => ({
          ...access,
          profiles: profileMap.get(access.user_id) || { email: "", full_name: "" },
          products: productMap.get(access.product_id) || { name: "", slug: "" },
        }));

        setAccesses(accessesWithRelations as any);
      }

      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de acesso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAccess = async () => {
    if (!selectedUser || !selectedProduct) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um usuário e um produto.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("product_access").insert({
        user_id: selectedUser,
        product_id: selectedProduct,
        access_type: accessType,
        is_active: true,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        expires_at: expiresAt || null,
      });

      if (error) throw error;

      toast({
        title: "Acesso concedido",
        description: "O acesso ao produto foi concedido com sucesso.",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating access:", error);
      toast({
        title: "Erro ao conceder acesso",
        description: "Não foi possível conceder o acesso ao produto.",
        variant: "destructive",
      });
    }
  };

  const deleteAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from("product_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;

      toast({
        title: "Acesso removido",
        description: "O acesso ao produto foi removido com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting access:", error);
      toast({
        title: "Erro ao remover acesso",
        description: "Não foi possível remover o acesso ao produto.",
        variant: "destructive",
      });
    }
  };

  const updateAccessLimit = async (accessId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from("product_access")
        .update({ usage_limit: newLimit })
        .eq("id", accessId);

      if (error) throw error;

      toast({
        title: "Limite atualizado",
        description: "O limite de uso foi atualizado com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error updating limit:", error);
      toast({
        title: "Erro ao atualizar limite",
        description: "Não foi possível atualizar o limite de uso.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setSelectedProduct("");
    setAccessType("limitado");
    setUsageLimit("");
    setExpiresAt("");
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Acessos a Produtos</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Conceder Acesso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conceder Acesso a Produto</DialogTitle>
              <DialogDescription>
                Configure o acesso de um usuário a um produto específico.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">Usuário</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessType">Tipo de Acesso</Label>
                <Select value={accessType} onValueChange={setAccessType}>
                  <SelectTrigger id="accessType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuito">Gratuito</SelectItem>
                    <SelectItem value="limitado">Limitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Limite de Uso (opcional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="Ex: 1000"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createAccess}>Conceder Acesso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accesses.map((access) => (
          <Card key={access.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {access.profiles?.full_name || access.profiles?.email}
                  </CardTitle>
                  <CardDescription>{access.products?.name}</CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAccess(access.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {access.access_type}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {access.is_active ? "Ativo" : "Inativo"}
                </div>
                <div>
                  <span className="font-medium">Uso:</span> {access.usage_count}
                  {access.usage_limit ? ` / ${access.usage_limit}` : " (ilimitado)"}
                </div>
                {access.expires_at && (
                  <div>
                    <span className="font-medium">Expira:</span>{" "}
                    {new Date(access.expires_at).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
              {access.usage_limit && (
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Novo limite"
                    className="w-32"
                    onBlur={(e) => {
                      const newLimit = parseInt(e.target.value);
                      if (newLimit && newLimit !== access.usage_limit) {
                        updateAccessLimit(access.id, newLimit);
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    Alterar limite de uso
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {accesses.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum acesso configurado.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
