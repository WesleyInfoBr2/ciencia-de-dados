import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ListTodo, Bell } from "lucide-react";
import {
  useWorkflows,
  TRIGGER_EVENTS,
  ACTION_TYPES,
  NOTIFICATION_TARGETS,
  type Workflow,
  type WorkflowAction,
} from "@/hooks/useWorkflows";

const actionSchema = z.object({
  type: z.enum(["create_task", "notify_user"]),
  task_type: z.string().optional(),
  assigned_to_role: z.string().optional(),
  title_template: z.string().optional(),
  due_days: z.number().optional(),
  target: z.enum(["post_author", "user", "all_admins"]).optional(),
  notification_type: z.string().optional(),
});

const workflowSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  trigger_event: z.string().min(1, "Selecione um gatilho"),
  is_active: z.boolean(),
  priority: z.number().min(0).max(100),
  actions: z.array(actionSchema).min(1, "Adicione pelo menos uma ação"),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow | null;
  taskTypes: { id: string; label: string }[];
  notificationTypes: { id: string; label: string }[];
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  taskTypes,
  notificationTypes,
}: WorkflowDialogProps) {
  const { createWorkflow, updateWorkflow } = useWorkflows();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      trigger_event: "",
      is_active: true,
      priority: 10,
      actions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description || "",
        trigger_event: workflow.trigger_event,
        is_active: workflow.is_active,
        priority: workflow.priority,
        actions: workflow.actions.map(a => ({
          ...a,
          due_days: a.due_days || undefined,
        })),
      });
    } else {
      form.reset({
        name: "",
        description: "",
        trigger_event: "",
        is_active: true,
        priority: 10,
        actions: [],
      });
    }
  }, [workflow, open, form]);

  const onSubmit = async (data: WorkflowFormData) => {
    try {
      setIsSubmitting(true);
      
      const workflowData = {
        name: data.name,
        description: data.description || null,
        trigger_event: data.trigger_event,
        is_active: data.is_active,
        priority: data.priority,
        conditions: null,
        actions: data.actions as WorkflowAction[],
      };

      if (workflow) {
        await updateWorkflow(workflow.id, workflowData);
      } else {
        await createWorkflow(workflowData);
      }

      onOpenChange(false);
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAction = (type: "create_task" | "notify_user") => {
    if (type === "create_task") {
      append({
        type: "create_task",
        task_type: taskTypes[0]?.id || "contact_request",
        assigned_to_role: "admin",
        title_template: "",
        due_days: 3,
      });
    } else {
      append({
        type: "notify_user",
        target: "all_admins",
        notification_type: notificationTypes[0]?.id || "system_announcement",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflow ? "Editar Workflow" : "Novo Workflow"}
          </DialogTitle>
          <DialogDescription>
            Configure o gatilho e as ações que serão executadas automaticamente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome do Workflow</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Notificar autor sobre comentário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o objetivo deste workflow" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger_event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gatilho</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRIGGER_EVENTS.map((event) => (
                          <SelectItem key={event.value} value={event.value}>
                            {event.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maior = executa primeiro
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Workflow Ativo</FormLabel>
                      <FormDescription>
                        Desative para pausar a execução deste workflow
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ações</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAction("create_task")}
                    className="gap-2"
                  >
                    <ListTodo className="h-4 w-4" />
                    Criar Tarefa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAction("notify_user")}
                    className="gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Notificar
                  </Button>
                </div>
              </div>

              {fields.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nenhuma ação configurada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use os botões acima para adicionar ações
                    </p>
                  </CardContent>
                </Card>
              )}

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {form.watch(`actions.${index}.type`) === "create_task" ? (
                          <>
                            <ListTodo className="h-4 w-4" />
                            Criar Tarefa
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4" />
                            Enviar Notificação
                          </>
                        )}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.watch(`actions.${index}.type`) === "create_task" ? (
                      <>
                        <FormField
                          control={form.control}
                          name={`actions.${index}.task_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Tarefa</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {taskTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`actions.${index}.assigned_to_role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Atribuir para</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Admins</SelectItem>
                                  <SelectItem value="member">Membros</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`actions.${index}.title_template`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título da Tarefa</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Use {{campo}} para variáveis" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Ex: Revisar comentário de {"{{user_name}}"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`actions.${index}.due_days`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prazo (dias)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name={`actions.${index}.target`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destinatário</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o destinatário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {NOTIFICATION_TARGETS.map((target) => (
                                    <SelectItem key={target.value} value={target.value}>
                                      {target.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`actions.${index}.notification_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Notificação</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {notificationTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}

              {form.formState.errors.actions?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.actions.root.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : workflow ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
