import { supabase } from './supabase';
import type { Ticket, PaginationParams, PaginatedResponse } from '@/types';

export async function getTickets(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Ticket>> {
  const { page, per_page, sort_by = 'created_at', sort_direction = 'desc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('tickets')
    .select('*, contact:contacts(id, first_name, last_name), company:companies(id, name), stage:stages(id, name, color), assigned_user:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.pipeline_id) query = query.eq('pipeline_id', filters.pipeline_id);
  if (filters?.priority) query = query.eq('priority', filters.priority);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar tickets: ${error.message}`);
  const total = count || 0;
  return { data: data as Ticket[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getTicketsByPipeline(pipelineId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, contact:contacts(id, first_name, last_name), company:companies(id, name), stage:stages(id, name, color), assigned_user:profiles!tickets_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('pipeline_id', pipelineId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar tickets: ${error.message}`);
  return data as Ticket[];
}

export async function getTicketById(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, contact:contacts(*), company:companies(*), stage:stages(*), assigned_user:profiles!tickets_assigned_to_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao buscar ticket: ${error.message}`);
  return data as Ticket;
}

export async function createTicket(ticket: Partial<Ticket>) {
  const { data, error } = await supabase.from('tickets').insert(ticket).select().single();
  if (error) throw new Error(`Erro ao criar ticket: ${error.message}`);
  return data as Ticket;
}

export async function updateTicket(id: string, updates: Partial<Ticket>) {
  const { data, error } = await supabase.from('tickets').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar ticket: ${error.message}`);
  return data as Ticket;
}

export async function deleteTicket(id: string) {
  const { error } = await supabase.from('tickets').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar ticket: ${error.message}`);
}

export async function moveTicketToStage(ticketId: string, stageId: string, userId: string) {
  const { data, error } = await supabase.from('tickets').update({ stage_id: stageId }).eq('id', ticketId).select().single();
  if (error) throw new Error(`Erro ao mover ticket: ${error.message}`);

  await supabase.from('activities').insert({
    entity_type: 'ticket',
    entity_id: ticketId,
    type: 'stage_change',
    title: 'Estágio do ticket alterado',
    metadata: { new_stage_id: stageId },
    created_by: userId,
  });

  return data as Ticket;
}
