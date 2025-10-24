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
 * Verifica o acesso do usuário a um produto específico usando a função do banco
 */
export const checkProductAccess = async (
  userId: string | undefined,
  productSlug: string
): Promise<{
  hasAccess: boolean;
  accessType: string | null;
  usageLimit?: number | null;
  usageCount?: number;
  reason?: string;
}> => {
  // Se não estiver autenticado, retorna acesso básico gratuito
  if (!userId) {
    return { 
      hasAccess: true, 
      accessType: "gratuito",
      usageLimit: 100,
      usageCount: 0,
      reason: "not_authenticated" 
    };
  }

  try {
    // Usa a função do banco para verificar acesso baseado em assinatura
    const { data, error } = await supabase.rpc("check_product_access", {
      _user_id: userId,
      _product_slug: productSlug,
    });

    if (error) {
      console.error("Error checking product access:", error);
      return { 
        hasAccess: true, 
        accessType: "gratuito",
        usageLimit: 100,
        usageCount: 0,
        reason: "error" 
      };
    }

    if (data && data.length > 0) {
      const access = data[0];
      return {
        hasAccess: access.has_access,
        accessType: access.access_level,
        usageLimit: access.usage_limit,
        usageCount: access.usage_count,
      };
    }

    // Se não houver dados, retorna acesso gratuito
    return { 
      hasAccess: true, 
      accessType: "gratuito",
      usageLimit: 100,
      usageCount: 0,
    };
  } catch (error) {
    console.error("Error in checkProductAccess:", error);
    return { 
      hasAccess: true, 
      accessType: "gratuito",
      usageLimit: 100,
      usageCount: 0,
      reason: "error" 
    };
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
