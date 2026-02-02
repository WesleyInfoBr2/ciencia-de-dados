-- Corrigir policy de inserção de notificações para ser mais restritiva
-- Apenas service_role (via Edge Functions) pode inserir, ou o próprio usuário
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Insert notifications via authenticated or service" ON public.notifications 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');