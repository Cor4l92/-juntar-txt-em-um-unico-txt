import { supabase } from './supabase';
import type { Company, PaginationParams, PaginatedResponse } from '@/types';

export async function getCompanies(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Company>> {
  const { page, per_page, sort_by = 'created_at', sort_direction = 'desc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('companies')
    .select('*, assigned_user:profiles!companies_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,trade_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`);
  }
  if (filters?.industry) query = query.eq('industry', filters.industry);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar empresas: ${error.message}`);
  const total = count || 0;
  return { data: data as Company[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
  if (error) throw new Error(`Erro ao buscar empresa: ${error.message}`);
  return data as Company;
}

export async function createCompany(company: Partial<Company>) {
  const { data, error } = await supabase.from('companies').insert(company).select().single();
  if (error) throw new Error(`Erro ao criar empresa: ${error.message}`);
  return data as Company;
}

export async function updateCompany(id: string, updates: Partial<Company>) {
  const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar empresa: ${error.message}`);
  return data as Company;
}

export async function deleteCompany(id: string) {
  const { error } = await supabase.from('companies').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar empresa: ${error.message}`);
}

export async function searchCompanies(query: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, trade_name, cnpj')
    .is('deleted_at', null)
    .or(`name.ilike.%${query}%,trade_name.ilike.%${query}%,cnpj.ilike.%${query}%`)
    .limit(20);
  if (error) throw new Error(`Erro ao buscar empresas: ${error.message}`);
  return data as Company[];
}
