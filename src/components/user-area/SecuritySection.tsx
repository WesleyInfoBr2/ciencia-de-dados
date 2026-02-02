import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Smartphone, 
  Monitor, 
  LogOut, 
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecuritySectionProps {
  sessions: Session[];
  isLoading: boolean;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
}

export const SecuritySection = ({
  sessions,
  isLoading,
  onChangePassword,
  onRevokeSession,
  onRevokeAllSessions,
}: SecuritySectionProps) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Verifique sua senha atual e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) {
      return Smartphone;
    }
    return Monitor;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha regularmente para manter sua conta segura.
                </CardDescription>
              </div>
            </div>
            {!showPasswordForm && (
              <Button onClick={() => setShowPasswordForm(true)}>
                Alterar Senha
              </Button>
            )}
          </div>
        </CardHeader>

        {showPasswordForm && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Digite sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Confirme sua nova senha"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Nova Senha
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sessions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>
                Gerencie os dispositivos conectados à sua conta.
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button variant="destructive" size="sm" onClick={onRevokeAllSessions}>
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar Todas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session, index) => {
            const DeviceIcon = getDeviceIcon(session.device);

            return (
              <div key={session.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Sessão atual
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • Última atividade: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRevokeSession(session.id)}
                    >
                      Encerrar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Não foi possível carregar as sessões ativas.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
