import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { checkProductAccess, getAccessDeniedMessage } from "@/lib/sso";

interface ProductAccessState {
  hasAccess: boolean;
  accessType: string | null;
  usageLimit?: number | null;
  usageCount?: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para verificar e gerenciar acesso do usuário a produtos
 * 
 * @param productSlug - Slug do produto (ex: "dadosbrasil", "revprisma")
 * @returns Estado do acesso do usuário ao produto
 */
export const useProductAccess = (productSlug: string): ProductAccessState => {
  const { user } = useAuth();
  const [state, setState] = useState<ProductAccessState>({
    hasAccess: false,
    accessType: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAccess = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await checkProductAccess(user?.id, productSlug);

        setState({
          hasAccess: result.hasAccess,
          accessType: result.accessType,
          usageLimit: result.usageLimit,
          usageCount: result.usageCount,
          isLoading: false,
          error: result.hasAccess ? null : getAccessDeniedMessage(result.reason),
        });
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        setState({
          hasAccess: false,
          accessType: null,
          isLoading: false,
          error: "Erro ao verificar acesso ao produto.",
        });
      }
    };

    if (productSlug) {
      checkAccess();
    }
  }, [user?.id, productSlug]);

  return state;
};
