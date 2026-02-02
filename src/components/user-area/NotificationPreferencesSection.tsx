import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  MessageSquare,
  Heart,
  ClipboardList,
  Package,
  Megaphone,
  Mail,
  Smartphone,
} from "lucide-react";

interface NotificationType {
  id: string;
  label: string;
  description: string | null;
  category: string;
  icon: string | null;
}

interface NotificationPreference {
  notification_type: string;
  channel: "email" | "in_app" | "push";
  frequency: "each" | "daily" | "weekly" | "monthly" | "never";
  is_enabled: boolean;
}

const categoryLabels: Record<string, string> = {
  social: "Social",
  task: "Tarefas",
  product: "Produtos",
  system: "Sistema",
};

const categoryIcons: Record<string, typeof Bell> = {
  social: MessageSquare,
  task: ClipboardList,
  product: Package,
  system: Megaphone,
};

const frequencyLabels: Record<string, string> = {
  each: "Imediato",
  daily: "Resumo diário",
  weekly: "Resumo semanal",
  monthly: "Resumo mensal",
  never: "Nunca",
};

export const NotificationPreferencesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notification types and user preferences
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch notification types
      const { data: types, error: typesError } = await supabase
        .from("notification_types")
        .select("*")
        .order("category", { ascending: true });

      if (typesError) throw typesError;

      // Fetch user preferences
      const { data: prefs, error: prefsError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (prefsError) throw prefsError;

      setNotificationTypes(types || []);
      setPreferences(prefs || []);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get preference for a specific type and channel
  const getPreference = (typeId: string, channel: "email" | "in_app") => {
    return preferences.find(
      (p) => p.notification_type === typeId && p.channel === channel
    );
  };

  // Update or create preference
  const updatePreference = async (
    typeId: string,
    channel: "email" | "in_app",
    updates: Partial<NotificationPreference>
  ) => {
    if (!user) return;

    try {
      const existingPref = getPreference(typeId, channel);

      if (existingPref) {
        // Update existing
        const { error } = await supabase
          .from("notification_preferences")
          .update(updates)
          .eq("user_id", user.id)
          .eq("notification_type", typeId)
          .eq("channel", channel);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            notification_type: typeId,
            channel,
            is_enabled: updates.is_enabled ?? true,
            frequency: updates.frequency ?? "each",
          });

        if (error) throw error;
      }

      // Update local state
      setPreferences((prev) => {
        const existing = prev.find(
          (p) => p.notification_type === typeId && p.channel === channel
        );

        if (existing) {
          return prev.map((p) =>
            p.notification_type === typeId && p.channel === channel
              ? { ...p, ...updates }
              : p
          );
        } else {
          return [
            ...prev,
            {
              notification_type: typeId,
              channel,
              is_enabled: updates.is_enabled ?? true,
              frequency: updates.frequency ?? "each",
            },
          ];
        }
      });

      toast({
        title: "Preferência atualizada",
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      toast({
        title: "Erro ao atualizar preferência",
        variant: "destructive",
      });
    }
  };

  // Group notification types by category
  const groupedTypes = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, NotificationType[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferências de Notificação
        </CardTitle>
        <CardDescription>
          Configure como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel legend */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground pb-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>In-App</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>E-mail</span>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <Smartphone className="h-4 w-4" />
            <span>Push (em breve)</span>
          </div>
        </div>

        {Object.entries(groupedTypes).map(([category, types]) => {
          const CategoryIcon = categoryIcons[category] || Bell;

          return (
            <div key={category}>
              <h3 className="flex items-center gap-2 font-medium mb-4">
                <CategoryIcon className="h-4 w-4" />
                {categoryLabels[category] || category}
              </h3>

              <div className="space-y-4">
                {types.map((type) => {
                  const inAppPref = getPreference(type.id, "in_app");
                  const emailPref = getPreference(type.id, "email");

                  return (
                    <div
                      key={type.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <Label className="font-medium">{type.label}</Label>
                        {type.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {type.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        {/* In-App toggle */}
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={inAppPref?.is_enabled ?? true}
                            onCheckedChange={(checked) =>
                              updatePreference(type.id, "in_app", { is_enabled: checked })
                            }
                          />
                        </div>

                        {/* Email toggle and frequency */}
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            checked={emailPref?.is_enabled ?? false}
                            onCheckedChange={(checked) =>
                              updatePreference(type.id, "email", { is_enabled: checked })
                            }
                          />
                          {emailPref?.is_enabled && (
                            <Select
                              value={emailPref?.frequency || "each"}
                              onValueChange={(value) =>
                                updatePreference(type.id, "email", {
                                  frequency: value as NotificationPreference["frequency"],
                                })
                              }
                            >
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(frequencyLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="mt-6" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
