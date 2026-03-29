import { supabase } from './supabase';
import type { Lead, PaginationParams, PaginatedResponse } from '@/types';

export async function getLeads(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Lead>> {
  const { page, per_page, sort_by = 'created_at', sort_direction = 'desc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('leads')
    .select('*, contact:contacts(id, first_name, last_name, email, phone), company:companies(id, name), stage:stages(id, name, color, semantics), assigned_user:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.pipeline_id) query = query.eq('pipeline_id', filters.pipeline_id);
  if (filters?.stage_id) query = query.eq('stage_id', filters.stage_id);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters?.temperature) query = query.eq('temperature', filters.temperature);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar leads: ${error.message}`);
  const total = count || 0;
  return { data: data as Lead[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getLeadsByPipeline(pipelineId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, contact:contacts(id, first_name, last_name, email, phone), company:companies(id, name), stage:stages(id, name, color, semantics), assigned_user:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('pipeline_id', pipelineId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar leads do pipeline: ${error.message}`);
  return data as Lead[];
}

export async function getLeadById(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, contact:contacts(*), company:companies(*), stage:stages(*), assigned_user:profiles!leads_assigned_to_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao buscar lead: ${error.message}`);
  return data as Lead;
}

export async function createLead(lead: Partial<Lead>) {
  const { data, error } = await supabase.from('leads').insert(lead).select().single();
  if (error) throw new Error(`Erro ao criar lead: ${error.message}`);
  return data as Lead;
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar lead: ${error.message}`);
  return data as Lead;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar lead: ${error.message}`);
}

export async function moveLeadToStage(leadId: string, stageId: string, userId: string) {
  const { data, error } = await supabase.from('leads').update({ stage_id: stageId }).eq('id', leadId).select('*, stage:stages(*)').single();
  if (error) throw new Error(`Erro ao mover lead: ${error.message}`);

  await supabase.from('activities').insert({
    entity_type: 'lead',
    entity_id: leadId,
    type: 'stage_change',
    title: `Movido para estágio: ${(data as Lead & { stage: { name: string } }).stage?.name}`,
    metadata: { new_stage_id: stageId },
    created_by: userId,
  });

  return data as Lead;
}

export async function convertLead(leadId: string, userId: string) {
  const lead = await getLeadById(leadId);

  // Criar contato se não existir
  let contactId = lead.contact_id;
  if (!contactId && lead.contact) {
    const { data: newContact } = await supabase.from('contacts').insert({
      first_name: lead.contact.first_name,
      last_name: lead.contact.last_name,
      email: lead.contact.email,
      phone: lead.contact.phone,
      source: lead.source,
      created_by: userId,
    }).select().single();
    contactId = newContact?.id || null;
  }

  // Criar deal
  const { data: deal, error } = await supabase.from('deals').insert({
    title: lead.title,
    contact_id: contactId,
    company_id: lead.company_id,
    value: lead.value,
    currency: lead.currency,
    source: lead.source,
    temperature: lead.temperature,
    assigned_to: lead.assigned_to,
    lead_id: leadId,
    created_by: userId,
  }).select().single();

  if (error) throw new Error(`Erro ao converter lead: ${error.message}`);

  // Marcar lead como convertido
  await supabase.from('leads').update({
    converted_at: new Date().toISOString(),
    converted_to_deal_id: deal.id,
  }).eq('id', leadId);

  return deal;
}
