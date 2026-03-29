import { supabase } from './supabase';
import type { Task, PaginationParams, PaginatedResponse } from '@/types';

export async function getTasks(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Task>> {
  const { page, per_page, sort_by = 'due_date', sort_direction = 'asc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('tasks')
    .select('*, assigned_user:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.priority) query = query.eq('priority', filters.priority);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar tarefas: ${error.message}`);
  const total = count || 0;
  return { data: data as Task[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase.from('tasks').select('*, assigned_user:profiles!tasks_assigned_to_fkey(*)').eq('id', id).single();
  if (error) throw new Error(`Erro ao buscar tarefa: ${error.message}`);
  return data as Task;
}

export async function createTask(task: Partial<Task>) {
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw new Error(`Erro ao criar tarefa: ${error.message}`);
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar tarefa: ${error.message}`);
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar tarefa: ${error.message}`);
}

export async function updateTaskStatus(id: string, status: string) {
  const updates: Partial<Task> = { status: status as Task['status'] };
  if (status === 'completed') updates.completed_at = new Date().toISOString();
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
  return data as Task;
}

export async function getMyTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', userId)
    .is('deleted_at', null)
    .neq('status', 'completed')
    .order('due_date', { ascending: true });
  if (error) throw new Error(`Erro ao buscar tarefas: ${error.message}`);
  return data as Task[];
}

export async function getOverdueTasks(userId?: string) {
  let query = supabase
    .from('tasks')
    .select('*, assigned_user:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url)')
    .is('deleted_at', null)
    .neq('status', 'completed')
    .lt('due_date', new Date().toISOString());

  if (userId) query = query.eq('assigned_to', userId);

  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) throw new Error(`Erro ao buscar tarefas atrasadas: ${error.message}`);
  return data as Task[];
}
