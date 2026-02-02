import { useState } from "react";
import { useWorkflows, TRIGGER_EVENTS, type Workflow } from "@/hooks/useWorkflows";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Zap, ListTodo, Bell, ArrowUpDown } from "lucide-react";
import { WorkflowDialog } from "./WorkflowDialog";

export function WorkflowsManagement() {
  const { workflows, loading, toggleWorkflow, deleteWorkflow, taskTypes, notificationTypes } = useWorkflows();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingWorkflow(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteWorkflow(deleteId);
      setDeleteId(null);
    }
  };

  const getTriggerLabel = (triggerEvent: string) => {
    return TRIGGER_EVENTS.find(t => t.value === triggerEvent)?.label || triggerEvent;
  };

  const getActionsSummary = (actions: Workflow["actions"]) => {
    const taskCount = actions.filter(a => a.type === "create_task").length;
    const notifCount = actions.filter(a => a.type === "notify_user").length;
    
    const parts = [];
    if (taskCount > 0) parts.push(`${taskCount} tarefa${taskCount > 1 ? "s" : ""}`);
    if (notifCount > 0) parts.push(`${notifCount} notificação${notifCount > 1 ? "ões" : ""}`);
    
    return parts.join(", ") || "Sem ações";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Workflows</h2>
          <p className="text-muted-foreground">
            Automatize tarefas e notificações baseadas em eventos
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum workflow criado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro workflow para automatizar ações da plataforma
            </p>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className={!workflow.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <ArrowUpDown className="h-3 w-3" />
                        {workflow.priority}
                      </Badge>
                    </div>
                    {workflow.description && (
                      <CardDescription>{workflow.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(workflow)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Gatilho:</span>
                    <span className="font-medium">{getTriggerLabel(workflow.trigger_event)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Ações:</span>
                    <span className="font-medium">{getActionsSummary(workflow.actions)}</span>
                  </div>
                  {workflow.conditions && Object.keys(workflow.conditions).length > 0 && (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Condições:</span>
                      <span className="font-medium">
                        {Object.keys(workflow.conditions).length} condição(ões)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workflow={editingWorkflow}
        taskTypes={taskTypes}
        notificationTypes={notificationTypes}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O workflow será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
