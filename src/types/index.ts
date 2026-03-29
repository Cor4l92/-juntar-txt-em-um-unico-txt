// =============================================================================
// CRM System - Definicoes de tipos TypeScript
// Todas as interfaces e tipos para o sistema CRM (estilo Bitrix24)
// Datas sao strings ISO 8601 (formato retornado pelo Supabase) ou null
// IDs de referencia (UUID) sao string ou null
// =============================================================================

// -----------------------------------------------------------------------------
// Tipos utilitarios
// -----------------------------------------------------------------------------

/** Tipo de entidade do CRM */
export type EntityType = 'lead' | 'deal' | 'contact' | 'company' | 'ticket';

/** Tipo de pipeline */
export type PipelineType = 'leads' | 'deals' | 'support' | 'post_sales';

/** Direcao de ordenacao */
export type SortDirection = 'asc' | 'desc';

/** Parametros de paginacao para listagens */
export interface PaginationParams {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_direction?: SortDirection;
}

/** Resposta paginada generica */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/** Operadores de filtro para consultas dinamicas */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'is_null'
  | 'not_null';

/** Condicao de filtro individual */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

// -----------------------------------------------------------------------------
// 1. Profile - Perfil do usuario no sistema
// -----------------------------------------------------------------------------
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'manager' | 'agent';
  job_title: string | null;
  phone: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 2. Pipeline - Funil de vendas/atendimento
// -----------------------------------------------------------------------------
export interface Pipeline {
  id: string;
  name: string;
  type: PipelineType;
  is_default: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 3. Stage - Estagio dentro de um pipeline
// -----------------------------------------------------------------------------
export interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string | null;
  sort_order: number;
  semantics: 'initial' | 'in_progress' | 'success' | 'failure';
  is_system: boolean;
  created_at: string | null;
}

// -----------------------------------------------------------------------------
// 4. Contact - Contato (pessoa fisica)
// -----------------------------------------------------------------------------
export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  job_title: string | null;
  birthdate: string | null;
  source: string | null;
  type: 'client' | 'supplier' | 'partner' | 'other';
  company_id: string | null;
  company?: Company;
  assigned_to: string | null;
  assigned_user?: Profile;
  avatar_url: string | null;
  // Campos de endereco
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  tags: string[] | null;
  // Campos UTM para rastreamento de origem
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity_at: string | null;
  deleted_at: string | null;
}

// -----------------------------------------------------------------------------
// 5. Company - Empresa
// -----------------------------------------------------------------------------
export interface Company {
  id: string;
  name: string;
  trade_name: string | null;
  cnpj: string | null;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  employee_count: number | null;
  annual_revenue: number | null;
  revenue_currency: string | null;
  type: string | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  logo_url: string | null;
  // Campos de endereco
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  tags: string[] | null;
  banking_details: Record<string, any> | null;
  source: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity_at: string | null;
  deleted_at: string | null;
}

// -----------------------------------------------------------------------------
// 6. Lead - Lead / Oportunidade inicial
// -----------------------------------------------------------------------------
export interface Lead {
  id: string;
  title: string;
  contact_id: string | null;
  contact?: Contact;
  company_id: string | null;
  company?: Company;
  pipeline_id: string | null;
  stage_id: string | null;
  stage?: Stage;
  value: number | null;
  currency: string | null;
  source: string | null;
  source_description: string | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  probability: number | null;
  temperature: 'hot' | 'warm' | 'cold' | null;
  notes: string | null;
  tags: string[] | null;
  // Campos UTM para rastreamento de origem
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  converted_at: string | null;
  converted_to_deal_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity_at: string | null;
  deleted_at: string | null;
}

// -----------------------------------------------------------------------------
// 7. Deal - Negocio / Oportunidade de venda
// -----------------------------------------------------------------------------
export interface Deal {
  id: string;
  title: string;
  contact_id: string | null;
  contact?: Contact;
  company_id: string | null;
  company?: Company;
  pipeline_id: string | null;
  stage_id: string | null;
  stage?: Stage;
  value: number | null;
  currency: string | null;
  probability: number | null;
  temperature: 'hot' | 'warm' | 'cold' | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  source: string | null;
  deal_type: 'new_business' | 'renewal' | 'upsell' | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  notes: string | null;
  tags: string[] | null;
  won_reason: string | null;
  lost_reason: string | null;
  is_recurring: boolean;
  recurrence_interval: string | null;
  lead_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity_at: string | null;
  deleted_at: string | null;
  products?: DealProduct[];
}

// -----------------------------------------------------------------------------
// 8. Product - Produto / Servico do catalogo
// -----------------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  currency: string | null;
  tax_rate: number | null;
  unit: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 9. DealProduct - Produto vinculado a um negocio
// -----------------------------------------------------------------------------
export interface DealProduct {
  id: string;
  deal_id: string;
  product_id: string | null;
  product?: Product;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_type: 'percent' | 'absolute' | null;
  discount_value: number | null;
  tax_rate: number | null;
  total: number;
  sort_order: number;
  created_at: string | null;
}

// -----------------------------------------------------------------------------
// 10. Activity - Atividade / Historico de interacoes
// -----------------------------------------------------------------------------
export interface Activity {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  type:
    | 'call'
    | 'email'
    | 'meeting'
    | 'note'
    | 'task'
    | 'stage_change'
    | 'field_change'
    | 'system';
  title: string;
  description: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  is_done: boolean;
  priority: 'low' | 'normal' | 'high';
  duration_minutes: number | null;
  result: string | null;
  metadata: Record<string, any> | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  created_by: string | null;
  creator?: Profile;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 12. ChecklistItem - Item de checklist dentro de uma tarefa
// -----------------------------------------------------------------------------
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  assigned_to?: string;
}

// -----------------------------------------------------------------------------
// 11. Task - Tarefa
// -----------------------------------------------------------------------------
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'waiting_review' | 'completed' | 'deferred';
  priority: 'low' | 'normal' | 'high' | 'critical';
  task_type: string | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  created_by: string | null;
  due_date: string | null;
  start_date: string | null;
  completed_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  entity_type: EntityType | null;
  entity_id: string | null;
  parent_task_id: string | null;
  tags: string[] | null;
  checklist: ChecklistItem[] | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// -----------------------------------------------------------------------------
// 13. Ticket - Ticket de suporte / pos-venda
// -----------------------------------------------------------------------------
export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  contact_id: string | null;
  contact?: Contact;
  company_id: string | null;
  company?: Company;
  deal_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  stage?: Stage;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string | null;
  assigned_to: string | null;
  assigned_user?: Profile;
  source: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  satisfaction_score: number | null;
  satisfaction_comment: string | null;
  sla_deadline: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

// -----------------------------------------------------------------------------
// 15. FieldOption - Opcao para campos do tipo select/multiselect
// -----------------------------------------------------------------------------
export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

// -----------------------------------------------------------------------------
// 14. CustomFieldDefinition - Definicao de campo personalizado
// -----------------------------------------------------------------------------
export interface CustomFieldDefinition {
  id: string;
  entity_type: EntityType;
  field_name: string;
  field_label: string;
  field_type: string;
  options: FieldOption[] | null;
  is_required: boolean;
  required_at_stage_id: string | null;
  is_multiple: boolean;
  show_in_kanban: boolean;
  show_in_filter: boolean;
  show_in_list: boolean;
  default_value: any;
  sort_order: number;
  tooltip: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 16. CustomFieldValue - Valor de campo personalizado para uma entidade
// -----------------------------------------------------------------------------
export interface CustomFieldValue {
  id: string;
  field_id: string;
  entity_type: EntityType;
  entity_id: string;
  value: any;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 17. AutomationRule - Regra de automacao (trigger -> action)
// -----------------------------------------------------------------------------
export interface AutomationRule {
  id: string;
  pipeline_id: string | null;
  stage_id: string | null;
  trigger_type: string;
  trigger_config: Record<string, any> | null;
  action_type: string;
  action_config: Record<string, any> | null;
  conditions: Record<string, any> | null;
  delay_minutes: number | null;
  is_active: boolean;
  sort_order: number;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// -----------------------------------------------------------------------------
// 18. AutomationLog - Log de execucao de automacao
// -----------------------------------------------------------------------------
export interface AutomationLog {
  id: string;
  rule_id: string;
  entity_type: EntityType;
  entity_id: string;
  status: 'success' | 'failed' | 'skipped';
  result: Record<string, any> | null;
  executed_at: string | null;
}

// -----------------------------------------------------------------------------
// 19. Notification - Notificacao do sistema para o usuario
// -----------------------------------------------------------------------------
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  entity_type: EntityType | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string | null;
}

// -----------------------------------------------------------------------------
// 20. Attachment - Arquivo anexado a uma entidade
// -----------------------------------------------------------------------------
export interface Attachment {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string | null;
}

// -----------------------------------------------------------------------------
// 21. SavedFilter - Filtro salvo pelo usuario
// -----------------------------------------------------------------------------
export interface SavedFilter {
  id: string;
  user_id: string;
  entity_type: EntityType;
  name: string;
  filters: Record<string, any>;
  is_default: boolean;
  is_shared: boolean;
  created_at: string | null;
}
