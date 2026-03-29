import { supabase } from './supabase';
import type { Deal, DealProduct, PaginationParams, PaginatedResponse } from '@/types';

export async function getDeals(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Deal>> {
  const { page, per_page, sort_by = 'created_at', sort_direction = 'desc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('deals')
    .select('*, contact:contacts(id, first_name, last_name, email, phone), company:companies(id, name), stage:stages(id, name, color, semantics), assigned_user:profiles!deals_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.pipeline_id) query = query.eq('pipeline_id', filters.pipeline_id);
  if (filters?.stage_id) query = query.eq('stage_id', filters.stage_id);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters?.temperature) query = query.eq('temperature', filters.temperature);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar negócios: ${error.message}`);
  const total = count || 0;
  return { data: data as Deal[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getDealsByPipeline(pipelineId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(id, first_name, last_name, email, phone), company:companies(id, name), stage:stages(id, name, color, semantics), assigned_user:profiles!deals_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('pipeline_id', pipelineId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar negócios do pipeline: ${error.message}`);
  return data as Deal[];
}

export async function getDealById(id: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(*), company:companies(*), stage:stages(*), assigned_user:profiles!deals_assigned_to_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao buscar negócio: ${error.message}`);
  return data as Deal;
}

export async function createDeal(deal: Partial<Deal>) {
  const { data, error } = await supabase.from('deals').insert(deal).select().single();
  if (error) throw new Error(`Erro ao criar negócio: ${error.message}`);
  return data as Deal;
}

export async function updateDeal(id: string, updates: Partial<Deal>) {
  const { data, error } = await supabase.from('deals').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar negócio: ${error.message}`);
  return data as Deal;
}

export async function deleteDeal(id: string) {
  const { error } = await supabase.from('deals').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar negócio: ${error.message}`);
}

export async function moveDealToStage(dealId: string, stageId: string, userId: string) {
  const { data, error } = await supabase.from('deals').update({ stage_id: stageId }).eq('id', dealId).select('*, stage:stages(*)').single();
  if (error) throw new Error(`Erro ao mover negócio: ${error.message}`);

  await supabase.from('activities').insert({
    entity_type: 'deal',
    entity_id: dealId,
    type: 'stage_change',
    title: `Movido para estágio: ${(data as Deal & { stage: { name: string } }).stage?.name}`,
    metadata: { new_stage_id: stageId },
    created_by: userId,
  });

  return data as Deal;
}

export async function getDealProducts(dealId: string) {
  const { data, error } = await supabase
    .from('deal_products')
    .select('*, product:products(*)')
    .eq('deal_id', dealId)
    .order('sort_order');
  if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`);
  return data as DealProduct[];
}

export async function addDealProduct(dealId: string, product: Partial<DealProduct>) {
  const { data, error } = await supabase.from('deal_products').insert({ ...product, deal_id: dealId }).select().single();
  if (error) throw new Error(`Erro ao adicionar produto: ${error.message}`);
  return data as DealProduct;
}

export async function removeDealProduct(id: string) {
  const { error } = await supabase.from('deal_products').delete().eq('id', id);
  if (error) throw new Error(`Erro ao remover produto: ${error.message}`);
}
