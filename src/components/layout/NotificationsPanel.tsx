import { useAppStore } from '@/stores/appStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, MessageSquare, AlertCircle, Calendar, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, typeof Bell> = {
  activity_reminder: Calendar,
  task_deadline: AlertCircle,
  deal_update: Info,
  mention: MessageSquare,
  system: Bell,
};

export function NotificationsPanel() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useAppStore();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Sheet open={notificationsPanelOpen} onOpenChange={setNotificationsPanelOpen}>
      <SheetContent className="w-96 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Notificações</SheetTitle>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-muted-foreground">
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Marcar todas como lidas
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type || 'system'] || Bell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={cn(
                      'flex w-full gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                      !notification.is_read && 'bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      !notification.is_read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !notification.is_read && 'font-medium')}>{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.created_at && formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
