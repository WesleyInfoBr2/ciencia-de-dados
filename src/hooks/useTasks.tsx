import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: number;
  due_date: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

export interface TaskType {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch task types
  const fetchTaskTypes = useCallback(async () => {
    const { data, error } = await supabase
      .from("task_types")
      .select("*")
      .order("label");

    if (error) {
      console.error("Error fetching task types:", error);
      return;
    }

    setTaskTypes(data || []);
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update task status
  const updateTaskStatus = useCallback(async (
    taskId: string, 
    status: Task["status"]
  ) => {
    if (!user) return;

    try {
      const updateData: { 
        status: Task["status"]; 
        completed_at?: string; 
        completed_by?: string;
      } = { status };
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      }

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, ...updateData } : t
        )
      );

      toast({
        title: "Tarefa atualizada",
        description: `Status alterado para ${getStatusLabel(status)}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      toast({
        title: "Tarefa removida",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro ao remover tarefa",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTaskTypes();
    fetchTasks();
  }, [fetchTaskTypes, fetchTasks]);

  return {
    tasks,
    taskTypes,
    isLoading,
    updateTaskStatus,
    deleteTask,
    refetch: fetchTasks,
  };
};

export function getStatusLabel(status: Task["status"]): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "in_progress":
      return "Em andamento";
    case "completed":
      return "Concluída";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export function getStatusColor(status: Task["status"]): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-muted";
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 2:
      return "Urgente";
    case 1:
      return "Alta";
    default:
      return "Normal";
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 2:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case 1:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}
