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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ProductAccessConfig {
  access_type: string;
  usage_limit: number | null;
  is_active: boolean;
}

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const UserCreateDialog = ({ open, onOpenChange, onSave }: UserCreateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productAccess, setProductAccess] = useState<Record<string, ProductAccessConfig>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProducts();
      // Reset form
      setFormData({ email: "", password: "", full_name: "", username: "" });
      setProductAccess({});
      setIsAdmin(false);
    }
  }, [open]);

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

  const handleSave = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Nota: A criação de usuários via admin requer configuração específica
      // No Supabase, isso normalmente é feito via Admin API ou invites
      // Para este exemplo, vamos criar via signUp normal
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não foi criado");

      const userId = authData.user.id;

      // Aguardar um pouco para o trigger criar o perfil
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Atualizar perfil com informações adicionais
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          username: formData.username || null,
        })
        .eq("id", userId);

      if (profileError) {
        console.warn("Erro ao atualizar perfil:", profileError);
      }

      // Adicionar role admin se selecionado
      if (isAdmin) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (roleError) {
          console.warn("Erro ao adicionar role admin:", roleError);
        }
      }

      // Criar acessos aos produtos
      const accessEntries = Object.entries(productAccess)
        .filter(([_, access]) => access.access_type !== "gratuito" && access.is_active)
        .map(([productId, access]) => ({
          user_id: userId,
          product_id: productId,
          access_type: access.access_type,
          usage_limit: access.usage_limit,
          is_active: access.is_active,
        }));

      if (accessEntries.length > 0) {
        const { error: accessError } = await supabase
          .from("product_access")
          .insert(accessEntries);

        if (accessError) {
          console.warn("Erro ao criar acessos:", accessError);
        }
      }

      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso. Um email de confirmação foi enviado.",
      });

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível criar o usuário.",
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
        access_type: prev[productId]?.access_type || "gratuito",
        usage_limit: prev[productId]?.usage_limit ?? null,
        is_active: prev[productId]?.is_active ?? false,
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário e configure seus acessos aos produtos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O usuário receberá um email de confirmação e precisará confirmar o cadastro.
            </AlertDescription>
          </Alert>

          {/* Informações de Acesso */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informações de Acesso</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informações do Perfil</h3>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div>
                <p className="font-medium text-foreground">Administrador</p>
                <p className="text-sm text-muted-foreground">
                  Concede acesso total ao painel administrativo
                </p>
              </div>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
          </div>

          {/* Acessos aos Produtos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Acessos aos Produtos</h3>
            <p className="text-sm text-muted-foreground">
              Configure os acessos iniciais. Por padrão, todos os usuários têm acesso gratuito.
            </p>
            
            <div className="space-y-3">
              {products.map((product) => {
                const access = productAccess[product.id] || {
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
                        onValueChange={(value) => {
                          updateProductAccess(product.id, "access_type", value);
                          if (value !== "gratuito") {
                            updateProductAccess(product.id, "is_active", true);
                          }
                        }}
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

                    {access.access_type !== "gratuito" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Ativo</Label>
                        <Switch
                          checked={access.is_active}
                          onCheckedChange={(checked) => updateProductAccess(product.id, "is_active", checked)}
                        />
                      </div>
                    )}
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
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
