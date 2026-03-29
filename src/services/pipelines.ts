import { supabase } from './supabase';
import type { Pipeline, Stage, PipelineType } from '@/types';

export async function getPipelines(type?: PipelineType) {
  let query = supabase.from('pipelines').select('*').order('sort_order');
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar pipelines: ${error.message}`);
  return data as Pipeline[];
}

export async function getPipelineById(id: string) {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*, stages(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Erro ao buscar pipeline: ${error.message}`);
  return data as Pipeline & { stages: Stage[] };
}

export async function createPipeline(pipeline: Partial<Pipeline>) {
  const { data, error } = await supabase.from('pipelines').insert(pipeline).select().single();
  if (error) throw new Error(`Erro ao criar pipeline: ${error.message}`);
  return data as Pipeline;
}

export async function updatePipeline(id: string, updates: Partial<Pipeline>) {
  const { data, error } = await supabase.from('pipelines').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar pipeline: ${error.message}`);
  return data as Pipeline;
}

export async function deletePipeline(id: string) {
  const { error } = await supabase.from('pipelines').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar pipeline: ${error.message}`);
}

export async function getStages(pipelineId: string) {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('sort_order');
  if (error) throw new Error(`Erro ao buscar estágios: ${error.message}`);
  return data as Stage[];
}

export async function createStage(stage: Partial<Stage>) {
  const { data, error } = await supabase.from('stages').insert(stage).select().single();
  if (error) throw new Error(`Erro ao criar estágio: ${error.message}`);
  return data as Stage;
}

export async function updateStage(id: string, updates: Partial<Stage>) {
  const { data, error } = await supabase.from('stages').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`Erro ao atualizar estágio: ${error.message}`);
  return data as Stage;
}

export async function deleteStage(id: string) {
  const { error } = await supabase.from('stages').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar estágio: ${error.message}`);
}

export async function reorderStages(pipelineId: string, stageIds: string[]) {
  const updates = stageIds.map((id, index) => ({ id, sort_order: index, pipeline_id: pipelineId }));
  const { error } = await supabase.from('stages').upsert(updates);
  if (error) throw new Error(`Erro ao reordenar estágios: ${error.message}`);
}
