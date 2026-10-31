import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { notificationService, type AppNotification } from '@/services/notification';
import Seo from '@/components/Seo';

/** "just now", "5m ago", "3h ago", "2d ago", then a short date. */
const formatNotificationDate = (iso: string, now = Date.now()) => {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const markRead = useMutation({ mutationFn: notificationService.markRead, onSettled: refresh });
  const markAllRead = useMutation({ mutationFn: notificationService.markAllRead, onSettled: refresh });

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n._id);
    if (n.route) navigate(n.route);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Seo title="Notifications" noindex />
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <h2 className="font-serif text-xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-sm text-muted-foreground">Order, payment and savings updates will appear here.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => open(n)}
                className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-muted/40 ${n.read ? '' : 'bg-primary/5'}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-primary'}`}
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-start justify-between gap-3">
                    <span className={`text-sm ${n.read ? 'text-foreground' : 'font-semibold text-foreground'}`}>
                      {n.title}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatNotificationDate(n.createdAt)}</span>
                  </span>
                  <span className="block text-sm text-muted-foreground mt-0.5">{n.body}</span>
                </span>
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
