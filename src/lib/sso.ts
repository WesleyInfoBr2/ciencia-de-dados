/**
 * SSO (Single Sign-On) Utilities
 * 
 * Funções para gerenciar autenticação entre o projeto Central
 * e os produtos em subdomínios separados.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Gera URL de redirecionamento com tokens de autenticação
 * para permitir SSO entre domínios
 */
export const generateSSORedirectUrl = async (
  productBaseUrl: string
): Promise<string | null> => {
  try {
    // Obtém a sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error("Erro ao obter sessão para SSO:", error);
      return null;
    }

    // Constrói URL com tokens
    const url = new URL(`https://${productBaseUrl}`);
    url.searchParams.set("access_token", session.access_token);
    url.searchParams.set("refresh_token", session.refresh_token);

    return url.toString();
  } catch (error) {
    console.error("Erro ao gerar URL de SSO:", error);
    return null;
  }
};

/**
 * Verifica se um produto está disponível para acesso público
 */
export const isProductAvailable = async (
  productSlug: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("is_available, is_public")
      .eq("slug", productSlug)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_available && data.is_public;
  } catch (error) {
    console.error("Erro ao verificar disponibilidade do produto:", error);
    return false;
  }
};

/**
 * Verifica se o usuário tem acesso a um produto específico
 */
export const checkProductAccess = async (
  userId: string | undefined,
  productSlug: string
): Promise<{
  hasAccess: boolean;
  accessType: string | null;
  reason?: string;
}> => {
  // Se não há usuário logado
  if (!userId) {
    return { hasAccess: false, accessType: null, reason: "not_authenticated" };
  }

  try {
    // Busca o produto
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, is_available, is_public")
      .eq("slug", productSlug)
      .single();

    if (productError || !product) {
      return { hasAccess: false, accessType: null, reason: "product_not_found" };
    }

    // Verifica se o produto está disponível
    if (!product.is_available) {
      return { hasAccess: false, accessType: null, reason: "product_unavailable" };
    }

    // Busca o acesso do usuário ao produto
    const { data: access, error: accessError } = await supabase
      .from("product_access")
      .select("access_type, is_active, expires_at")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .eq("is_active", true)
      .maybeSingle();

    if (accessError) {
      console.error("Erro ao verificar acesso:", accessError);
      return { hasAccess: false, accessType: null, reason: "error" };
    }

    // Se não tem registro de acesso, verifica se é público
    if (!access) {
      if (product.is_public) {
        return { hasAccess: true, accessType: "free", reason: "public_product" };
      }
      return { hasAccess: false, accessType: null, reason: "no_access_granted" };
    }

    // Verifica se o acesso expirou
    if (access.expires_at) {
      const now = new Date();
      const expiresAt = new Date(access.expires_at);
      if (expiresAt < now) {
        return { hasAccess: false, accessType: null, reason: "access_expired" };
      }
    }

    return {
      hasAccess: true,
      accessType: access.access_type,
      reason: "access_granted",
    };
  } catch (error) {
    console.error("Erro ao verificar acesso ao produto:", error);
    return { hasAccess: false, accessType: null, reason: "error" };
  }
};

/**
 * Obtém mensagem amigável para o motivo de falta de acesso
 */
export const getAccessDeniedMessage = (reason?: string): string => {
  switch (reason) {
    case "not_authenticated":
      return "Você precisa fazer login para acessar este produto.";
    case "product_not_found":
      return "Produto não encontrado.";
    case "product_unavailable":
      return "Este produto ainda não está disponível.";
    case "no_access_granted":
      return "Você não tem acesso a este produto. Entre em contato para solicitar acesso.";
    case "access_expired":
      return "Seu acesso a este produto expirou. Renove sua assinatura.";
    default:
      return "Não foi possível verificar seu acesso. Tente novamente.";
  }
};

/**
 * Redireciona o usuário para um produto com SSO
 */
export const redirectToProduct = async (
  productSlug: string,
  productBaseUrl: string,
  userId: string | undefined
): Promise<boolean> => {
  // Verifica acesso
  const { hasAccess, reason } = await checkProductAccess(userId, productSlug);

  if (!hasAccess) {
    console.warn(`Acesso negado ao produto ${productSlug}:`, reason);
    return false;
  }

  // Gera URL com SSO
  const ssoUrl = await generateSSORedirectUrl(productBaseUrl);

  if (!ssoUrl) {
    console.error("Não foi possível gerar URL de SSO");
    return false;
  }

  // Redireciona
  window.location.href = ssoUrl;
  return true;
};
