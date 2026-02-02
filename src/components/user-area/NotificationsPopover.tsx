import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  Check, 
  MessageSquare, 
  Heart, 
  Package, 
  Settings, 
  ClipboardList,
  AlertCircle,
  Megaphone,
  Unlock,
  PartyPopper,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const getIcon = (type: string) => {
  switch (type) {
    case "comment_on_post":
    case "comment_reply":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "like_on_post":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "task_assigned":
    case "task_completed":
      return <ClipboardList className="h-4 w-4 text-purple-500" />;
    case "task_due_soon":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "product_access_granted":
      return <Unlock className="h-4 w-4 text-green-500" />;
    case "product_usage_limit":
      return <Package className="h-4 w-4 text-yellow-500" />;
    case "system_announcement":
      return <Megaphone className="h-4 w-4 text-cyan-500" />;
    case "welcome":
      return <PartyPopper className="h-4 w-4 text-pink-500" />;
    default:
      return <Settings className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR");
};

export const NotificationsPopover = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative group",
                    !notification.is_read && "bg-muted/30"
                  )}
                >
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors pr-10"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(notification.notification_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium truncate",
                              !notification.is_read && "text-foreground",
                              notification.is_read && "text-muted-foreground"
                            )}
                          >
                            {notification.title}
                          </span>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        {notification.body && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
