import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Search } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  roles: string[];
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: roles?.filter(r => r.user_id === profile.id).map(r => r.role) || [],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (userId: string, hasAdminRole: boolean) => {
    try {
      if (hasAdminRole) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;

        toast({
          title: "Permissão removida",
          description: "O usuário não é mais administrador.",
        });
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;

        toast({
          title: "Permissão concedida",
          description: "O usuário agora é administrador.",
        });
      }

      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin role:", error);
      toast({
        title: "Erro ao atualizar permissão",
        description: "Não foi possível atualizar as permissões do usuário.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários por email ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => {
          const isAdmin = user.roles.includes("admin");
          
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {user.full_name || "Sem nome"}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Usuário
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Cadastrado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  <Button
                    size="sm"
                    variant={isAdmin ? "destructive" : "default"}
                    onClick={() => toggleAdminRole(user.id, isAdmin)}
                  >
                    {isAdmin ? "Remover Admin" : "Tornar Admin"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum usuário encontrado.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
