-- =============================================
-- MULTI-PRODUCT ARCHITECTURE: Clean & Setup
-- =============================================

-- Remove produtos duplicados (manter apenas os com custom_domain preenchido)
DELETE FROM products WHERE custom_domain IS NULL;

-- Atualizar slugs para padrão consistente (sem hífens)
UPDATE products SET slug = 'estatisticafacil' WHERE slug IN ('estatistica-facil', 'estatisticafacil');
UPDATE products SET slug = 'revprisma' WHERE slug IN ('rev-prisma', 'revprisma');
UPDATE products SET slug = 'dadosbrasil' WHERE slug IN ('dados-brasil', 'dadosbrasil');

-- Adicionar produtos faltantes: pnfacil e gestorllm
INSERT INTO products (name, slug, description, base_url, custom_domain, status, is_public, is_available, launch_date)
VALUES 
  ('PnFácil', 'pnfacil', 'Ferramenta para criação e gestão de planos de negócios simplificados', '/produtos/pnfacil', 'pnfacil.cienciadedados.org', 'development', true, false, '2026-03-31 00:00:00+00'),
  ('GestorLLM', 'gestorllm', 'Plataforma de gestão e otimização de Large Language Models para empresas', '/produtos/gestorllm', 'gestorllm.cienciadedados.org', 'development', true, false, '2026-06-30 00:00:00+00')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Atualizar função check_product_access
-- Modelo: Gratuito -> Limitado (por produto) -> Ilimitado (todos)
-- =============================================
CREATE OR REPLACE FUNCTION public.check_product_access(_user_id uuid, _product_slug text)
RETURNS TABLE(has_access boolean, access_level text, usage_limit integer, usage_count integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_subscription RECORD;
  v_product_access RECORD;
  v_product_id UUID;
  v_total_products INTEGER;
  v_user_products INTEGER;
BEGIN
  -- Get product ID from slug
  SELECT id INTO v_product_id
  FROM public.products
  WHERE slug = _product_slug;

  -- If product not found, deny access
  IF v_product_id IS NULL THEN
    RETURN QUERY SELECT false, 'none'::TEXT, 0, 0;
    RETURN;
  END IF;

  -- Get user subscription
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = _user_id
  AND status = 'active'
  AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check specific product access in product_access table
  SELECT * INTO v_product_access
  FROM public.product_access
  WHERE user_id = _user_id
  AND product_id = v_product_id
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());

  -- Count total available products and user's subscribed products
  SELECT COUNT(*) INTO v_total_products FROM public.products WHERE is_public = true;
  SELECT COUNT(DISTINCT pa.product_id) INTO v_user_products 
  FROM public.product_access pa
  JOIN public.products p ON p.id = pa.product_id
  WHERE pa.user_id = _user_id 
  AND pa.is_active = true 
  AND p.is_public = true
  AND (pa.expires_at IS NULL OR pa.expires_at > now());

  -- ILIMITADO: User has access to ALL products (calculated condition)
  IF v_user_products >= v_total_products AND v_total_products > 0 THEN
    RETURN QUERY SELECT 
      true,
      'ilimitado'::TEXT,
      NULL::INTEGER,
      COALESCE(v_product_access.usage_count, 0);
    RETURN;
  END IF;

  -- LIMITADO: User has specific access to THIS product
  IF v_product_access IS NOT NULL THEN
    RETURN QUERY SELECT 
      true,
      'limitado'::TEXT,
      v_product_access.usage_limit,
      v_product_access.usage_count;
    RETURN;
  END IF;

  -- GRATUITO: Default access (authenticated user without subscription)
  -- All authenticated users get basic/free access to all products
  RETURN QUERY SELECT 
    true,
    'gratuito'::TEXT,
    100::INTEGER,  -- Default free tier usage limit
    0;
END;
$function$;