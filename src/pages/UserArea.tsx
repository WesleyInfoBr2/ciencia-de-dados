import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { UserSidebar } from "@/components/user-area/UserSidebar";
import { UserHeader } from "@/components/user-area/UserHeader";
import { ProfileSection } from "@/components/user-area/ProfileSection";
import { SubscriptionsSection } from "@/components/user-area/SubscriptionsSection";
import { ProductsQuickAccess } from "@/components/user-area/ProductsQuickAccess";
import { SecuritySection } from "@/components/user-area/SecuritySection";
import { SettingsSection } from "@/components/user-area/SettingsSection";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { generateSSORedirectUrl } from "@/lib/sso";

// Types
interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  username: string;
  institution: string;
  bio: string;
  avatarUrl: string;
}

interface ProductAccess {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasAccess: boolean;
  accessType: string;
  usageCount: number;
  usageLimit: number | null;
  expiresAt: string | null;
  status: "available" | "coming_soon" | "beta";
  baseUrl: string;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface Settings {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

const sectionTitles: Record<string, string> = {
  profile: "Meu Perfil",
  subscriptions: "Assinaturas e Permissões",
  products: "Meus Produtos",
  security: "Segurança",
  settings: "Configurações",
};

const UserArea = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  // UI State
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data State
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [products, setProducts] = useState<ProductAccess[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"gratuito" | "limitado" | "ilimitado">("gratuito");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    language: "pt-BR",
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/minha-conta");
    }
  }, [user, loading, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          id: data.id,
          fullName: data.full_name || "",
          email: data.email,
          username: data.username || "",
          institution: "", // Add to DB if needed
          bio: data.bio || "",
          avatarUrl: data.avatar_url || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  // Fetch products and access data
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      try {
        // Fetch all products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("is_public", true)
          .order("name");

        if (productsError) throw productsError;

        // Fetch user's product access
        const { data: accessData, error: accessError } = await supabase
          .from("product_access")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (accessError) throw accessError;

        // Map products with access info
        const productsWithAccess: ProductAccess[] = (productsData || []).map((product) => {
          const access = accessData?.find((a) => a.product_id === product.id);
          
          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            hasAccess: !!access || true, // All authenticated users have at least "gratuito" access
            accessType: access?.access_type || "gratuito",
            usageCount: access?.usage_count || 0,
            usageLimit: access?.usage_limit || 100,
            expiresAt: access?.expires_at || null,
            status: product.is_available ? "available" : "coming_soon",
            baseUrl: product.base_url || "",
          };
        });

        setProducts(productsWithAccess);

        // Calculate subscription status
        const hasLimitedAccess = accessData?.some((a) => a.access_type === "limitado");
        const allProductsUnlimited = productsData?.every((p) =>
          accessData?.some((a) => a.product_id === p.id && a.access_type === "ilimitado")
        );

        if (allProductsUnlimited) {
          setSubscriptionStatus("ilimitado");
        } else if (hasLimitedAccess) {
          setSubscriptionStatus("limitado");
        } else {
          setSubscriptionStatus("gratuito");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Fetch sessions (mock data for now)
  useEffect(() => {
    setSessions([
      {
        id: "1",
        device: "Chrome no Windows",
        location: "São Paulo, Brasil",
        lastActive: "Agora",
        isCurrent: true,
      },
    ]);
  }, []);

  // Handlers
  const handleUpdateProfile = async (data: Partial<ProfileData>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        username: data.username,
        bio: data.bio,
      })
      .eq("id", user.id);

    if (error) throw error;

    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const handleAccessProduct = async (product: ProductAccess) => {
    if (!product.baseUrl) {
      toast({
        title: "Produto não disponível",
        description: "Este produto ainda não possui URL configurada.",
        variant: "destructive",
      });
      return;
    }

    const ssoUrl = await generateSSORedirectUrl(product.baseUrl);
    if (ssoUrl) {
      window.location.href = ssoUrl;
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  const handleRevokeSession = async (sessionId: string) => {
    // Implement session revocation
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast({
      title: "Sessão encerrada",
      description: "A sessão foi encerrada com sucesso.",
    });
  };

  const handleRevokeAllSessions = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    // TODO: Persist settings to database
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Render section content
  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            profile={profile}
            isLoading={isLoadingProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case "subscriptions":
        return (
          <SubscriptionsSection
            subscriptionStatus={subscriptionStatus}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              hasAccess: p.hasAccess,
              accessType: p.accessType,
              usageCount: p.usageCount,
              usageLimit: p.usageLimit,
              expiresAt: p.expiresAt,
            }))}
            isLoading={isLoadingProducts}
          />
        );
      case "products":
        return (
          <ProductsQuickAccess
            products={products}
            isLoading={isLoadingProducts}
            onAccessProduct={handleAccessProduct}
          />
        );
      case "security":
        return (
          <SecuritySection
            sessions={sessions}
            isLoading={false}
            onChangePassword={handleChangePassword}
            onRevokeSession={handleRevokeSession}
            onRevokeAllSessions={handleRevokeAllSessions}
          />
        );
      case "settings":
        return (
          <SettingsSection
            settings={settings}
            isLoading={false}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <UserSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={
            profile
              ? {
                  name: profile.fullName || profile.email,
                  email: profile.email,
                  avatarUrl: profile.avatarUrl,
                }
              : null
          }
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <UserSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setIsMobileSidebarOpen(false);
            }}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            user={
              profile
                ? {
                    name: profile.fullName || profile.email,
                    email: profile.email,
                    avatarUrl: profile.avatarUrl,
                  }
                : null
            }
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <UserHeader
          title={sectionTitles[activeSection]}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          showMenuButton
        />

        <main className={cn("flex-1 p-4 lg:p-6 overflow-auto")}>
          <div className="max-w-4xl mx-auto">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default UserArea;
