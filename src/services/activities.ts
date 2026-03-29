import { supabase } from './supabase';
import type { Activity, EntityType } from '@/types';

export async function getActivities(entityType: EntityType, entityId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*, assigned_user:profiles!activities_assigned_to_fkey(id, full_name, avatar_url), creator:profiles!activities_created_by_fkey(id, full_name, avatar_url)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar atividades: ${error.message}`);
  return data as Activity[];
}

export async function createActivity(activity: Partial<Activity>) {
  const { data, error } = await supabase.from('activities').insert(activity).select().single();
  if (error) throw new Error(`Erro ao criar atividade: ${error.message}`);
  return data as Activity;
}

export async function updateActivity(id: string, updates: Partial<Activity>) {
  const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar atividade: ${error.message}`);
  return data as Activity;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar atividade: ${error.message}`);
}

export async function markActivityDone(id: string) {
  const { data, error } = await supabase
    .from('activities')
    .update({ is_done: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Erro ao concluir atividade: ${error.message}`);
  return data as Activity;
}

export async function getUpcomingActivities(userId?: string) {
  let query = supabase
    .from('activities')
    .select('*, assigned_user:profiles!activities_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('is_done', false)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20);

  if (userId) query = query.eq('assigned_to', userId);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar atividades: ${error.message}`);
  return data as Activity[];
}
