import { supabase } from './supabase';

export async function getDashboardKPIs(filters?: { pipeline_id?: string; assigned_to?: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let dealsQuery = supabase.from('deals').select('id, value, stage:stages(semantics)', { count: 'exact' }).is('deleted_at', null);
  if (filters?.pipeline_id) dealsQuery = dealsQuery.eq('pipeline_id', filters.pipeline_id);
  if (filters?.assigned_to) dealsQuery = dealsQuery.eq('assigned_to', filters.assigned_to);

  const [openDeals, wonDeals, lostDeals, openTickets] = await Promise.all([
    dealsQuery,
    supabase.from('deals').select('id, value').is('deleted_at', null).gte('actual_close_date', startOfMonth).not('actual_close_date', 'is', null),
    supabase.from('deals').select('id, value, stage:stages!inner(semantics)').is('deleted_at', null).eq('stages.semantics', 'failure'),
    supabase.from('tickets').select('id', { count: 'exact' }).is('deleted_at', null).is('resolved_at', null),
  ]);

  const openValue = (openDeals.data || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const wonValue = (wonDeals.data || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return {
    openDeals: { count: openDeals.count || 0, value: openValue },
    wonDealsMonth: { count: wonDeals.data?.length || 0, value: wonValue },
    lostDeals: { count: lostDeals.data?.length || 0 },
    openTickets: { count: openTickets.count || 0 },
  };
}

export async function getFunnelReport(pipelineId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('stage_id, value, stage:stages(name, color, sort_order, semantics)')
    .eq('pipeline_id', pipelineId)
    .is('deleted_at', null);

  if (error) throw new Error(`Erro ao gerar funil: ${error.message}`);

  const stages: Record<string, { name: string; color: string; sort_order: number; count: number; value: number }> = {};
  for (const deal of data || []) {
    const stage = deal.stage as unknown as { name: string; color: string; sort_order: number };
    if (!stage) continue;
    if (!stages[deal.stage_id]) {
      stages[deal.stage_id] = { name: stage.name, color: stage.color, sort_order: stage.sort_order, count: 0, value: 0 };
    }
    stages[deal.stage_id].count++;
    stages[deal.stage_id].value += Number(deal.value) || 0;
  }

  return Object.values(stages).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getTeamPerformance(dateRange?: { start: string; end: string }) {
  let query = supabase
    .from('deals')
    .select('assigned_to, value, assigned_user:profiles!deals_assigned_to_fkey(full_name, avatar_url), stage:stages!inner(semantics)')
    .eq('stages.semantics', 'success')
    .is('deleted_at', null);

  if (dateRange) {
    query = query.gte('actual_close_date', dateRange.start).lte('actual_close_date', dateRange.end);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao gerar performance: ${error.message}`);

  const performance: Record<string, { name: string; avatar_url: string | null; deals_won: number; total_value: number }> = {};
  for (const deal of data || []) {
    const user = deal.assigned_user as unknown as { full_name: string; avatar_url: string | null };
    if (!deal.assigned_to || !user) continue;
    if (!performance[deal.assigned_to]) {
      performance[deal.assigned_to] = { name: user.full_name, avatar_url: user.avatar_url, deals_won: 0, total_value: 0 };
    }
    performance[deal.assigned_to].deals_won++;
    performance[deal.assigned_to].total_value += Number(deal.value) || 0;
  }

  return Object.values(performance).sort((a, b) => b.total_value - a.total_value);
}
