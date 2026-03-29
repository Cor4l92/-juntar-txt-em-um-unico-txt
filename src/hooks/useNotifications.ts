import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import * as notificationsService from '@/services/notifications';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [data, count] = await Promise.all([
        notificationsService.getNotifications(user.id),
        notificationsService.getUnreadCount(user.id),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch {
      // Silencioso - notificações não são críticas
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = notificationsService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
