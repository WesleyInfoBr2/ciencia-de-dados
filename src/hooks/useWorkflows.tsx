import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface WorkflowAction {
  type: "create_task" | "notify_user";
  task_type?: string;
  assigned_to_role?: string;
  title_template?: string;
  due_days?: number;
  target?: "post_author" | "user" | "all_admins";
  notification_type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: Record<string, unknown> | null;
  actions: WorkflowAction[];
  is_active: boolean;
  priority: number;
  created_at: string;
  created_by: string | null;
}

export const TRIGGER_EVENTS = [
  { value: "contact_form_submitted", label: "Formulário de contato enviado" },
  { value: "comment_created", label: "Novo comentário criado" },
  { value: "post_published", label: "Post publicado" },
  { value: "post_liked", label: "Post curtido" },
  { value: "user_registered", label: "Novo usuário registrado" },
  { value: "product_access_requested", label: "Acesso a produto solicitado" },
] as const;

export const ACTION_TYPES = [
  { value: "create_task", label: "Criar tarefa" },
  { value: "notify_user", label: "Enviar notificação" },
] as const;

export const NOTIFICATION_TARGETS = [
  { value: "post_author", label: "Autor do post" },
  { value: "user", label: "Usuário específico (via data.user_id)" },
  { value: "all_admins", label: "Todos os admins" },
] as const;

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskTypes, setTaskTypes] = useState<{ id: string; label: string }[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<{ id: string; label: string }[]>([]);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData: Workflow[] = (data || []).map(w => ({
        ...w,
        conditions: w.conditions as Record<string, unknown> | null,
        actions: (w.actions as unknown as WorkflowAction[]) || [],
      }));
      
      setWorkflows(transformedData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao carregar workflows",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [taskTypesRes, notifTypesRes] = await Promise.all([
        supabase.from("task_types").select("id, label"),
        supabase.from("notification_types").select("id, label"),
      ]);

      if (taskTypesRes.data) setTaskTypes(taskTypesRes.data);
      if (notifTypesRes.data) setNotificationTypes(notifTypesRes.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchMetadata();
  }, []);

  const createWorkflow = async (workflow: Omit<Workflow, "id" | "created_at" | "created_by">) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("workflows")
        .insert({
          name: workflow.name,
          description: workflow.description,
          trigger_event: workflow.trigger_event,
          conditions: workflow.conditions as Json,
          actions: workflow.actions as unknown as Json,
          is_active: workflow.is_active,
          priority: workflow.priority,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow criado",
        description: `"${workflow.name}" foi criado com sucesso.`,
      });

      await fetchWorkflows();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar workflow",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.trigger_event !== undefined) updateData.trigger_event = updates.trigger_event;
      if (updates.conditions !== undefined) updateData.conditions = updates.conditions as Json;
      if (updates.actions !== undefined) updateData.actions = updates.actions as unknown as Json;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.priority !== undefined) updateData.priority = updates.priority;

      const { error } = await supabase
        .from("workflows")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Workflow atualizado",
        description: "As alterações foram salvas.",
      });

      await fetchWorkflows();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atualizar workflow",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workflows")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Workflow excluído",
        description: "O workflow foi removido.",
      });

      await fetchWorkflows();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir workflow",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    await updateWorkflow(id, { is_active: isActive });
  };

  return {
    workflows,
    loading,
    taskTypes,
    notificationTypes,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    refetch: fetchWorkflows,
  };
}
