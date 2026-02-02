import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface WorkflowAction {
  type: "create_task" | "notify_user";
  task_type?: string;
  assigned_to_role?: string;
  title_template?: string;
  due_days?: number;
  target?: "post_author" | "user" | "all_admins";
  notification_type?: string;
}

interface Workflow {
  id: string;
  name: string;
  trigger_event: string;
  conditions: Record<string, unknown>;
  actions: WorkflowAction[];
  is_active: boolean;
}

interface EventPayload {
  event: string;
  data: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event, data }: EventPayload = await req.json();

    console.log(`[trigger-workflow] Received event: ${event}`, data);

    // Busca workflows ativos para este evento
    const { data: workflows, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("trigger_event", event)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (workflowError) {
      console.error("[trigger-workflow] Error fetching workflows:", workflowError);
      throw workflowError;
    }

    if (!workflows || workflows.length === 0) {
      console.log(`[trigger-workflow] No active workflows for event: ${event}`);
      return new Response(
        JSON.stringify({ success: true, message: "No workflows found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ workflow: string; actions: string[] }> = [];

    for (const workflow of workflows as Workflow[]) {
      console.log(`[trigger-workflow] Processing workflow: ${workflow.name}`);
      const actionResults: string[] = [];

      // Verificar condições (se existirem)
      if (workflow.conditions && Object.keys(workflow.conditions).length > 0) {
        const conditionsMet = Object.entries(workflow.conditions).every(
          ([key, value]) => data[key] === value
        );
        if (!conditionsMet) {
          console.log(`[trigger-workflow] Conditions not met for: ${workflow.name}`);
          continue;
        }
      }

      for (const action of workflow.actions) {
        try {
          if (action.type === "create_task") {
            const result = await createTask(supabase, action, data);
            actionResults.push(`task_created: ${result.id}`);
          } else if (action.type === "notify_user") {
            const result = await notifyUser(supabase, action, data);
            actionResults.push(`notification_sent: ${result.count}`);
          }
        } catch (actionError) {
          console.error(`[trigger-workflow] Action error:`, actionError);
          actionResults.push(`error: ${actionError.message}`);
        }
      }

      results.push({ workflow: workflow.name, actions: actionResults });
    }

    console.log("[trigger-workflow] Completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[trigger-workflow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createTask(
  supabase: ReturnType<typeof createClient>,
  action: WorkflowAction,
  data: Record<string, unknown>
) {
  // Buscar usuários com a role especificada
  const { data: usersWithRole, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", action.assigned_to_role || "admin");

  if (roleError) throw roleError;

  // Processar template do título
  let title = action.title_template || "Nova tarefa";
  Object.entries(data).forEach(([key, value]) => {
    title = title.replace(`{{${key}}}`, String(value || ""));
  });

  // Calcular data de vencimento
  const dueDate = action.due_days
    ? new Date(Date.now() + action.due_days * 86400000).toISOString()
    : null;

  // Criar tarefa para cada admin/moderador
  const tasksToInsert = (usersWithRole || []).map((u) => ({
    task_type: action.task_type || "contact_request",
    title,
    assigned_to: u.user_id,
    due_date: dueDate,
    metadata: data,
    status: "pending",
  }));

  if (tasksToInsert.length === 0) {
    console.log("[createTask] No users with role found, skipping task creation");
    return { id: null, count: 0 };
  }

  const { data: insertedTasks, error: insertError } = await supabase
    .from("tasks")
    .insert(tasksToInsert)
    .select("id");

  if (insertError) throw insertError;

  // Criar notificação para cada usuário que recebeu a tarefa
  const notificationsToInsert = (usersWithRole || []).map((u) => ({
    user_id: u.user_id,
    notification_type: "task_assigned",
    title: "Nova tarefa atribuída",
    body: title,
    link: "/admin?tab=tasks",
    metadata: { task_title: title },
  }));

  await supabase.from("notifications").insert(notificationsToInsert);

  return { id: insertedTasks?.[0]?.id, count: tasksToInsert.length };
}

async function notifyUser(
  supabase: ReturnType<typeof createClient>,
  action: WorkflowAction,
  data: Record<string, unknown>
) {
  let targetUserIds: string[] = [];

  // Determinar o destinatário da notificação
  if (action.target === "post_author" && data.post_author_id) {
    targetUserIds = [data.post_author_id as string];
  } else if (action.target === "user" && data.user_id) {
    targetUserIds = [data.user_id as string];
  } else if (action.target === "all_admins") {
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    targetUserIds = (admins || []).map((a) => a.user_id);
  }

  if (targetUserIds.length === 0) {
    console.log("[notifyUser] No target users found");
    return { count: 0 };
  }

  // Filtrar: não notificar o próprio usuário que fez a ação
  const actorId = data.actor_id as string;
  targetUserIds = targetUserIds.filter((id) => id !== actorId);

  if (targetUserIds.length === 0) {
    console.log("[notifyUser] Skipping self-notification");
    return { count: 0 };
  }

  // Buscar detalhes do tipo de notificação
  const { data: notifType } = await supabase
    .from("notification_types")
    .select("label, category")
    .eq("id", action.notification_type)
    .single();

  // Criar notificações
  const notificationsToInsert = targetUserIds.map((userId) => ({
    user_id: userId,
    notification_type: action.notification_type || "system_announcement",
    title: notifType?.label || "Notificação",
    body: generateNotificationBody(action.notification_type!, data),
    link: generateNotificationLink(action.notification_type!, data),
    metadata: {
      actor_id: actorId,
      actor_name: data.actor_name,
      ...data,
    },
  }));

  const { error } = await supabase.from("notifications").insert(notificationsToInsert);

  if (error) throw error;

  // Verificar preferências e enviar email se necessário
  for (const userId of targetUserIds) {
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("notification_type", action.notification_type)
      .eq("channel", "email")
      .eq("is_enabled", true)
      .single();

    if (prefs && prefs.frequency === "each") {
      // Chamar função de envio de email (implementar depois)
      console.log(`[notifyUser] Should send email to user ${userId}`);
    }
  }

  return { count: notificationsToInsert.length };
}

function generateNotificationBody(
  notificationType: string,
  data: Record<string, unknown>
): string {
  const actorName = data.actor_name || "Alguém";
  const postTitle = data.post_title || "seu post";

  switch (notificationType) {
    case "comment_on_post":
      return `${actorName} comentou em "${postTitle}"`;
    case "like_on_post":
      return `${actorName} curtiu "${postTitle}"`;
    case "comment_reply":
      return `${actorName} respondeu ao seu comentário`;
    case "task_assigned":
      return data.task_title as string || "Uma nova tarefa foi atribuída a você";
    case "product_access_granted":
      return `Seu acesso ao ${data.product_name || "produto"} foi liberado`;
    default:
      return "Você tem uma nova notificação";
  }
}

function generateNotificationLink(
  notificationType: string,
  data: Record<string, unknown>
): string {
  switch (notificationType) {
    case "comment_on_post":
    case "like_on_post":
    case "comment_reply":
      return data.post_slug ? `/wiki/${data.post_slug}` : "/wiki";
    case "task_assigned":
      return "/admin?tab=tasks";
    case "product_access_granted":
      return "/minha-conta";
    default:
      return "/";
  }
}
