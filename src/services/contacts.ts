import { supabase } from './supabase';
import type { Contact, PaginationParams, PaginatedResponse } from '@/types';

export async function getContacts(
  params: PaginationParams,
  filters?: Record<string, string>
): Promise<PaginatedResponse<Contact>> {
  const { page, per_page, sort_by = 'created_at', sort_direction = 'desc' } = params;
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let query = supabase
    .from('contacts')
    .select('*, company:companies(id, name), assigned_user:profiles!contacts_assigned_to_fkey(id, full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }
  if (filters?.company_id) query = query.eq('company_id', filters.company_id);
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.source) query = query.eq('source', filters.source);

  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_direction === 'asc' })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar contatos: ${error.message}`);
  const total = count || 0;
  return { data: data as Contact[], count: total, page, per_page, total_pages: Math.ceil(total / per_page) };
}

export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, company:companies(id, name), assigned_user:profiles!contacts_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao buscar contato: ${error.message}`);
  return data as Contact;
}

export async function createContact(contact: Partial<Contact>) {
  const { data, error } = await supabase.from('contacts').insert(contact).select().single();
  if (error) throw new Error(`Erro ao criar contato: ${error.message}`);
  return data as Contact;
}

export async function updateContact(id: string, updates: Partial<Contact>) {
  const { data, error } = await supabase.from('contacts').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar contato: ${error.message}`);
  return data as Contact;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from('contacts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Erro ao deletar contato: ${error.message}`);
}

export async function searchContacts(query: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, company:companies(id, name)')
    .is('deleted_at', null)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(20);
  if (error) throw new Error(`Erro ao buscar contatos: ${error.message}`);
  return data as unknown as Contact[];
}
