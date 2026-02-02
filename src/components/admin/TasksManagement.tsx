import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardList,
  Search,
  MoreVertical,
  CheckCircle,
  Play,
  XCircle,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTasks,
  type Task,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
} from "@/hooks/useTasks";

export const TasksManagement = () => {
  const { tasks, taskTypes, isLoading, updateTaskStatus, deleteTask, refetch } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.task_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Group tasks by status for kanban-style view
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  const getTaskTypeLabel = (typeId: string) => {
    return taskTypes.find((t) => t.id === typeId)?.label || typeId;
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleDelete = (taskId: string) => {
    setDeleteConfirmId(taskId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteTask(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

    return (
      <Card className={cn("mb-3", isOverdue && "border-destructive")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getTaskTypeLabel(task.task_type)}
                </Badge>
                {task.priority > 0 && (
                  <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                )}
              </div>
              <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(task.created_at), "dd/MM", { locale: ptBR })}
                </span>
                {task.due_date && (
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-destructive"
                  )}>
                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.status !== "in_progress" && task.status !== "completed" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </DropdownMenuItem>
                )}
                {task.status !== "completed" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir
                  </DropdownMenuItem>
                )}
                {task.status !== "cancelled" && task.status !== "completed" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "cancelled")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TaskColumn = ({ 
    title, 
    tasks, 
    status,
    icon: Icon 
  }: { 
    title: string; 
    tasks: Task[]; 
    status: Task["status"];
    icon: typeof ClipboardList;
  }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={cn(
        "flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg",
        getStatusColor(status)
      )}>
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <ScrollArea className="h-[calc(100vh-380px)]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma tarefa
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Gerenciador de Tarefas
            </CardTitle>
            <CardDescription>
              Gerencie tarefas criadas automaticamente pelos workflows
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {taskTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <TaskColumn 
            title="Pendentes" 
            tasks={pendingTasks} 
            status="pending"
            icon={Clock}
          />
          <TaskColumn 
            title="Em Andamento" 
            tasks={inProgressTasks} 
            status="in_progress"
            icon={Play}
          />
          <TaskColumn 
            title="Concluídas" 
            tasks={completedTasks} 
            status="completed"
            icon={CheckCircle}
          />
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>Total: {filteredTasks.length} tarefas</span>
          <span>
            {pendingTasks.length} pendentes • {inProgressTasks.length} em andamento • {completedTasks.length} concluídas
          </span>
        </div>
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
