/**
 * Product Access Utilities
 * 
 * Funções reutilizáveis para verificação de acesso a produtos.
 * Pode ser usado tanto na Central quanto nos subdomínios.
 */

import { supabase } from "@/integrations/supabase/client";

export type AccessLevel = 'none' | 'gratuito' | 'limitado' | 'ilimitado';

export interface ProductAccessResult {
  hasAccess: boolean;
  accessLevel: AccessLevel;
  usageLimit: number | null;
  usageCount: number;
  isAuthenticated: boolean;
}

/**
 * Verifica o acesso do usuário a um produto específico
 * 
 * @param productSlug - Slug do produto (ex: "estatisticafacil")
 * @returns Resultado da verificação de acesso
 */
export async function checkProductAccess(productSlug: string): Promise<ProductAccessResult> {
  // Verifica se usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      hasAccess: false,
      accessLevel: 'none',
      usageLimit: null,
      usageCount: 0,
      isAuthenticated: false,
    };
  }
  
  try {
    const { data, error } = await supabase.rpc('check_product_access', {
      _user_id: user.id,
      _product_slug: productSlug,
    });
    
    if (error) {
      console.error('Erro ao verificar acesso:', error);
      // Fallback para acesso gratuito em caso de erro
      return {
        hasAccess: true,
        accessLevel: 'gratuito',
        usageLimit: 100,
        usageCount: 0,
        isAuthenticated: true,
      };
    }
    
    const access = data?.[0];
    
    if (!access) {
      return {
        hasAccess: true,
        accessLevel: 'gratuito',
        usageLimit: 100,
        usageCount: 0,
        isAuthenticated: true,
      };
    }
    
    return {
      hasAccess: access.has_access,
      accessLevel: access.access_level as AccessLevel,
      usageLimit: access.usage_limit,
      usageCount: access.usage_count,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return {
      hasAccess: true,
      accessLevel: 'gratuito',
      usageLimit: 100,
      usageCount: 0,
      isAuthenticated: true,
    };
  }
}

/**
 * Verifica se o usuário tem acesso completo (limitado ou ilimitado) ao produto
 */
export function hasFullAccess(accessLevel: AccessLevel): boolean {
  return accessLevel === 'limitado' || accessLevel === 'ilimitado';
}

/**
 * Verifica se o usuário atingiu o limite de uso
 */
export function isUsageLimitReached(usageCount: number, usageLimit: number | null): boolean {
  if (usageLimit === null) return false;
  return usageCount >= usageLimit;
}

/**
 * Retorna a porcentagem de uso do limite
 */
export function getUsagePercentage(usageCount: number, usageLimit: number | null): number {
  if (usageLimit === null || usageLimit === 0) return 0;
  return Math.min(100, (usageCount / usageLimit) * 100);
}

/**
 * Incrementa o contador de uso para um produto
 */
export async function incrementUsage(productSlug: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  try {
    // Primeiro, busca o product_id
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productSlug)
      .single();
    
    if (!product) return false;
    
    // Registra o uso
    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        product_id: product.id,
        action_type: 'feature_use',
      });
    
    if (error) {
      console.error('Erro ao registrar uso:', error);
      return false;
    }
    
    // Busca o registro atual de product_access para incrementar
    const { data: currentAccess } = await supabase
      .from('product_access')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    
    // Atualiza o contador em product_access
    const { error: updateError } = await supabase
      .from('product_access')
      .update({ 
        usage_count: (currentAccess?.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('product_id', product.id);
    
    return !updateError;
  } catch (error) {
    console.error('Erro ao incrementar uso:', error);
    return false;
  }
}

/**
 * Código para ser usado nos SUBDOMÍNIOS para receber SSO
 * 
 * Chame esta função no useEffect do App.tsx dos produtos
 */
export async function handleSSOLogin(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error) {
      // Remove tokens da URL por segurança
      window.history.replaceState({}, '', window.location.pathname);
      return true;
    }
    
    console.error('Erro ao estabelecer sessão SSO:', error);
  }
  
  return false;
}

/**
 * Redireciona para a Central para autenticação
 */
export function redirectToCentralAuth(returnUrl?: string): void {
  const centralAuthUrl = new URL('https://www.cienciadedados.org/auth');
  
  if (returnUrl) {
    centralAuthUrl.searchParams.set('redirect', returnUrl);
  }
  
  window.location.href = centralAuthUrl.toString();
}
