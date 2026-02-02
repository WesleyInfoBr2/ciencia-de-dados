-- =============================================
-- SWTN: Sistema de Workflow, Tarefas e Notificações
-- =============================================

-- ENUMS
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.notification_channel AS ENUM ('email', 'push', 'in_app');
CREATE TYPE public.notification_frequency AS ENUM ('each', 'daily', 'weekly', 'monthly', 'never');

-- =============================================
-- TASK TYPES - Tipos de tarefas disponíveis
-- =============================================
CREATE TABLE public.task_types (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    default_assignee_role app_role DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir tipos padrão
INSERT INTO public.task_types (id, label, description, icon, color, default_assignee_role) VALUES
    ('contact_request', 'Solicitação de Contato', 'Usuário solicitou contato via formulário', 'MessageSquare', 'blue', 'admin'),
    ('purchase_review', 'Revisão de Compra', 'Pedido de compra aguardando aprovação', 'ShoppingCart', 'green', 'admin'),
    ('content_moderation', 'Moderação de Conteúdo', 'Conteúdo pendente de revisão', 'FileSearch', 'orange', 'admin'),
    ('comment_review', 'Revisão de Comentário', 'Comentário aguardando aprovação', 'MessageCircle', 'purple', 'admin'),
    ('support_ticket', 'Ticket de Suporte', 'Solicitação de suporte técnico', 'HelpCircle', 'red', 'admin'),
    ('user_verification', 'Verificação de Usuário', 'Verificação de dados de usuário', 'UserCheck', 'cyan', 'admin');

-- =============================================
-- NOTIFICATION TYPES - Tipos de notificações
-- =============================================
CREATE TABLE public.notification_types (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'social', 'task', 'system', 'product'
    icon TEXT,
    default_channels notification_channel[] DEFAULT ARRAY['in_app']::notification_channel[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir tipos padrão
INSERT INTO public.notification_types (id, label, description, category, icon, default_channels) VALUES
    ('comment_on_post', 'Comentário no Post', 'Alguém comentou em seu post', 'social', 'MessageSquare', ARRAY['in_app', 'email']::notification_channel[]),
    ('like_on_post', 'Curtida no Post', 'Alguém curtiu seu post', 'social', 'Heart', ARRAY['in_app']::notification_channel[]),
    ('comment_reply', 'Resposta ao Comentário', 'Alguém respondeu seu comentário', 'social', 'Reply', ARRAY['in_app', 'email']::notification_channel[]),
    ('task_assigned', 'Tarefa Atribuída', 'Uma nova tarefa foi atribuída a você', 'task', 'ClipboardList', ARRAY['in_app', 'email']::notification_channel[]),
    ('task_completed', 'Tarefa Concluída', 'Uma tarefa foi marcada como concluída', 'task', 'CheckCircle', ARRAY['in_app']::notification_channel[]),
    ('task_due_soon', 'Tarefa Vencendo', 'Uma tarefa está próxima do prazo', 'task', 'AlertCircle', ARRAY['in_app', 'email']::notification_channel[]),
    ('product_access_granted', 'Acesso Liberado', 'Seu acesso a um produto foi liberado', 'product', 'Unlock', ARRAY['in_app', 'email']::notification_channel[]),
    ('product_usage_limit', 'Limite de Uso', 'Você atingiu o limite de uso do produto', 'product', 'AlertTriangle', ARRAY['in_app', 'email']::notification_channel[]),
    ('system_announcement', 'Anúncio do Sistema', 'Novidades e atualizações da plataforma', 'system', 'Megaphone', ARRAY['in_app']::notification_channel[]),
    ('welcome', 'Boas-vindas', 'Bem-vindo à plataforma', 'system', 'PartyPopper', ARRAY['in_app', 'email']::notification_channel[]);

-- =============================================
-- WORKFLOWS - Definição dos fluxos automatizados
-- =============================================
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL, -- 'comment_created', 'form_submitted', 'purchase_requested', 'like_created', etc.
    conditions JSONB DEFAULT '{}', -- Filtros adicionais (ex: { "post_type": "wiki" })
    actions JSONB NOT NULL DEFAULT '[]', -- Array de ações: [{ type: 'create_task', ... }, { type: 'notify_user', ... }]
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Ordem de execução
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir workflows padrão
INSERT INTO public.workflows (name, description, trigger_event, actions, is_active) VALUES
    (
        'Notificar autor sobre comentário',
        'Quando alguém comenta em um post, notifica o autor',
        'comment_created',
        '[{"type": "notify_user", "target": "post_author", "notification_type": "comment_on_post"}]',
        true
    ),
    (
        'Notificar autor sobre curtida',
        'Quando alguém curte um post, notifica o autor',
        'like_created',
        '[{"type": "notify_user", "target": "post_author", "notification_type": "like_on_post"}]',
        true
    ),
    (
        'Tarefa para moderação de comentário',
        'Comentário de visitante aguarda aprovação',
        'guest_comment_created',
        '[{"type": "create_task", "task_type": "comment_review", "assigned_to_role": "admin", "title_template": "Moderar comentário de {{guest_name}}"}]',
        true
    ),
    (
        'Formulário de contato',
        'Cria tarefa quando formulário de contato é enviado',
        'contact_form_submitted',
        '[{"type": "create_task", "task_type": "contact_request", "assigned_to_role": "admin", "title_template": "Contato de {{user_name}}: {{subject}}"}]',
        true
    );

-- =============================================
-- TASKS - Tarefas criadas pelos workflows
-- =============================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
    task_type TEXT REFERENCES public.task_types(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    status task_status DEFAULT 'pending',
    priority INTEGER DEFAULT 0, -- 0 = normal, 1 = alta, 2 = urgente
    due_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}', -- Dados contextuais (ID do post, usuário, etc.)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.profiles(id)
);

-- Índices para performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_task_type ON public.tasks(task_type);

-- =============================================
-- NOTIFICATIONS - Notificações dos usuários
-- =============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT REFERENCES public.notification_types(id) NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT, -- URL para navegar ao clicar
    metadata JSONB DEFAULT '{}', -- Dados adicionais (actor_id, post_id, etc.)
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    channels_sent notification_channel[] DEFAULT ARRAY[]::notification_channel[],
    created_at TIMESTAMPTZ DEFAULT now(),
    scheduled_for TIMESTAMPTZ, -- Para notificações agendadas (batch)
    sent_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- =============================================
-- NOTIFICATION PREFERENCES - Preferências do usuário
-- =============================================
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT REFERENCES public.notification_types(id) NOT NULL,
    channel notification_channel NOT NULL,
    frequency notification_frequency DEFAULT 'each',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, notification_type, channel)
);

CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Task Types (público para leitura)
ALTER TABLE public.task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view task types" ON public.task_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage task types" ON public.task_types FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Notification Types (público para leitura)
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notification types" ON public.notification_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage notification types" ON public.notification_types FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Workflows (apenas admin)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view workflows" ON public.workflows FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage workflows" ON public.workflows FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view assigned tasks" ON public.tasks FOR SELECT 
    USING (assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE 
    USING (assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all tasks" ON public.tasks FOR ALL 
    USING (has_role(auth.uid(), 'admin'));

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT 
    USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE 
    USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT 
    WITH CHECK (true); -- Inserção via service_role nas Edge Functions
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE 
    USING (user_id = auth.uid());

-- Notification Preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT 
    USING (user_id = auth.uid());
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences FOR ALL 
    USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS para updated_at
-- =============================================
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÃO: Marcar notificação como lida
-- =============================================
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = now()
    WHERE id = notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- =============================================
-- FUNÇÃO: Marcar todas notificações como lidas
-- =============================================
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = now()
    WHERE user_id = auth.uid() AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- =============================================
-- FUNÇÃO: Contagem de notificações não lidas
-- =============================================
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = auth.uid() AND is_read = false;
$$;