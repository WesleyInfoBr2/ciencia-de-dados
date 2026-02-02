import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "./AvatarUpload";
import { useAuth } from "@/hooks/useAuth";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  username: string;
  institution: string;
  bio: string;
  avatarUrl: string;
}

interface ProfileSectionProps {
  profile: ProfileData | null;
  isLoading: boolean;
  onUpdateProfile: (data: Partial<ProfileData>) => Promise<void>;
}

export const ProfileSection = ({
  profile,
  isLoading,
  onUpdateProfile,
}: ProfileSectionProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const { toast } = useToast();

  const handleEdit = () => {
    setFormData({
      fullName: profile?.fullName || "",
      username: profile?.username || "",
      institution: profile?.institution || "",
      bio: profile?.bio || "",
    });
    setAvatarUrl(profile?.avatarUrl || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setAvatarUrl(profile?.avatarUrl || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Gerencie suas informações de perfil público.
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit}>Editar Perfil</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <AvatarUpload
              userId={user?.id || ""}
              currentAvatarUrl={isEditing ? avatarUrl : profile?.avatarUrl}
              fullName={profile?.fullName}
              onAvatarUpdate={(newUrl) => setAvatarUrl(newUrl)}
              isEditing={isEditing}
            />
            <div>
              <h3 className="text-lg font-semibold">{profile?.fullName || "Nome não definido"}</h3>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-sm py-2">{profile?.fullName || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="@usuario"
                />
              ) : (
                <p className="text-sm py-2">
                  {profile?.username ? `@${profile.username}` : "-"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <p className="text-sm py-2 text-muted-foreground">
                {profile?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado diretamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Instituição</Label>
              {isEditing ? (
                <Input
                  id="institution"
                  value={formData.institution || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  placeholder="Sua instituição ou empresa"
                />
              ) : (
                <p className="text-sm py-2">{profile?.institution || "-"}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biografia</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
              ) : (
                <p className="text-sm py-2">{profile?.bio || "-"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
