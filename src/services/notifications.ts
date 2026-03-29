import { supabase } from './supabase';
import type { Notification } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar notificações: ${error.message}`);
  return data as Notification[];
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Erro ao marcar notificação: ${error.message}`);
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(`Erro ao marcar notificações: ${error.message}`);
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(`Erro ao contar notificações: ${error.message}`);
  return count || 0;
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): RealtimeChannel {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new as Notification)
    )
    .subscribe();
}
