-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('gratuito', 'limitado', 'ilimitado');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'gratuito',
  status public.subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add usage limits to product_access
ALTER TABLE public.product_access
ADD COLUMN usage_limit INTEGER,
ADD COLUMN usage_count INTEGER DEFAULT 0,
ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;

-- Create usage_tracking table
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
ON public.usage_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.usage_tracking FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can log usage"
ON public.usage_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to get user subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(_user_id UUID)
RETURNS TABLE (
  plan public.subscription_plan,
  status public.subscription_status,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan, status, expires_at
  FROM public.subscriptions
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Create function to check product access based on subscription
CREATE OR REPLACE FUNCTION public.check_product_access(_user_id UUID, _product_slug TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  access_level TEXT,
  usage_limit INTEGER,
  usage_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_product_access RECORD;
  v_product_id UUID;
BEGIN
  -- Get product ID
  SELECT id INTO v_product_id
  FROM public.products
  WHERE slug = _product_slug;

  -- Get user subscription
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = _user_id
  AND status = 'active'
  AND (expires_at IS NULL OR expires_at > now());

  -- If no subscription, default to gratuito
  IF v_subscription IS NULL THEN
    v_subscription.plan := 'gratuito';
  END IF;

  -- Check specific product access
  SELECT * INTO v_product_access
  FROM public.product_access
  WHERE user_id = _user_id
  AND product_id = v_product_id
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());

  -- Determine access based on subscription plan
  IF v_subscription.plan = 'ilimitado' THEN
    -- Unlimited plan: full access to all products
    RETURN QUERY SELECT 
      true,
      'limitado'::TEXT,
      NULL::INTEGER,
      COALESCE(v_product_access.usage_count, 0);
  ELSIF v_subscription.plan = 'limitado' AND v_product_access IS NOT NULL THEN
    -- Limited plan with specific product access
    RETURN QUERY SELECT 
      true,
      'limitado'::TEXT,
      v_product_access.usage_limit,
      v_product_access.usage_count;
  ELSE
    -- Free plan: basic access
    RETURN QUERY SELECT 
      true,
      'gratuito'::TEXT,
      100::INTEGER,
      COALESCE(v_product_access.usage_count, 0);
  END IF;
END;
$$;

-- Create trigger to auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'gratuito', 'active');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();

-- Update timestamp trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();