import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ProductAccess {
  product_id: string;
  access_type: string;
  usage_limit: number | null;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSave: () => void;
}

export const UserEditDialog = ({ open, onOpenChange, user, onSave }: UserEditDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productAccess, setProductAccess] = useState<Record<string, ProductAccess>>({});
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      setFormData({
        full_name: user.full_name || "",
        username: user.username || "",
        bio: user.bio || "",
      });
      fetchProducts();
      fetchUserAccess(user.id);
    }
  }, [open, user]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("is_public", true)
      .order("name");

    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchUserAccess = async (userId: string) => {
    const { data, error } = await supabase
      .from("product_access")
      .select("product_id, access_type, usage_limit, is_active")
      .eq("user_id", userId);

    if (!error && data) {
      const accessMap: Record<string, ProductAccess> = {};
      data.forEach((access) => {
        accessMap[access.product_id] = access;
      });
      setProductAccess(accessMap);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          username: formData.username || null,
          bio: formData.bio || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Atualizar acessos aos produtos
      for (const [productId, access] of Object.entries(productAccess)) {
        const existingAccess = await supabase
          .from("product_access")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .maybeSingle();

        if (existingAccess.data) {
          // Atualizar existente
          await supabase
            .from("product_access")
            .update({
              access_type: access.access_type,
              usage_limit: access.usage_limit,
              is_active: access.is_active,
            })
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else if (access.access_type !== "gratuito") {
          // Criar novo acesso
          await supabase.from("product_access").insert({
            user_id: user.id,
            product_id: productId,
            access_type: access.access_type,
            usage_limit: access.usage_limit,
            is_active: access.is_active,
          });
        }
      }

      toast({
        title: "Usuário atualizado",
        description: "As informações foram salvas com sucesso.",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductAccess = (productId: string, field: string, value: string | number | boolean | null) => {
    setProductAccess((prev) => ({
      ...prev,
      [productId]: {
        product_id: productId,
        access_type: prev[productId]?.access_type || "gratuito",
        usage_limit: prev[productId]?.usage_limit ?? null,
        is_active: prev[productId]?.is_active ?? true,
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações do perfil e configure os acessos aos produtos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Perfil */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informações do Perfil</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Uma breve descrição sobre o usuário"
                rows={3}
              />
            </div>
          </div>

          {/* Acessos aos Produtos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Acessos aos Produtos</h3>
            
            <div className="space-y-3">
              {products.map((product) => {
                const access = productAccess[product.id] || {
                  product_id: product.id,
                  access_type: "gratuito",
                  usage_limit: null,
                  is_active: false,
                };

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="min-w-[120px]">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>

                      <Select
                        value={access.access_type}
                        onValueChange={(value) => updateProductAccess(product.id, "access_type", value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gratuito">Gratuito</SelectItem>
                          <SelectItem value="limitado">Limitado</SelectItem>
                          <SelectItem value="ilimitado">Ilimitado</SelectItem>
                        </SelectContent>
                      </Select>

                      {access.access_type === "limitado" && (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">Limite:</Label>
                          <Input
                            type="number"
                            value={access.usage_limit ?? ""}
                            onChange={(e) =>
                              updateProductAccess(
                                product.id,
                                "usage_limit",
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-20"
                            placeholder="∞"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Ativo</Label>
                      <Switch
                        checked={access.is_active}
                        onCheckedChange={(checked) => updateProductAccess(product.id, "is_active", checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
