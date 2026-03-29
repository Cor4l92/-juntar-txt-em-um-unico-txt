-- ============================================================================
-- SCHEMA COMPLETO DO CRM - Estilo Bitrix24
-- Banco: PostgreSQL (Supabase)
-- Criado em: 2026-03-28
-- ============================================================================

-- ============================================================================
-- 1. EXTENSOES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TIPOS ENUMERADOS (ENUMs)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent');

CREATE TYPE pipeline_type AS ENUM ('leads', 'deals', 'support', 'post_sales');

CREATE TYPE stage_semantics AS ENUM ('initial', 'in_progress', 'success', 'failure');

CREATE TYPE contact_type AS ENUM ('client', 'supplier', 'partner', 'other');

CREATE TYPE temperature_level AS ENUM ('hot', 'warm', 'cold');

CREATE TYPE deal_type AS ENUM ('new_business', 'renewal', 'upsell');

CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

CREATE TYPE activity_type AS ENUM (
  'call', 'email', 'meeting', 'note', 'task',
  'stage_change', 'field_change', 'system'
);

CREATE TYPE task_status AS ENUM (
  'pending', 'in_progress', 'waiting_review', 'completed', 'deferred'
);

CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'critical');

CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'critical');

-- ============================================================================
-- 3. FUNCAO AUXILIAR: auto-update de updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABELAS
-- ============================================================================

-- --------------------------------------------------------------------------
-- 4.1 PROFILES (estende auth.users do Supabase)
-- --------------------------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'agent',
  job_title   TEXT,
  phone       TEXT,
  department  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.2 PIPELINES
-- --------------------------------------------------------------------------
CREATE TABLE pipelines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        pipeline_type NOT NULL DEFAULT 'deals',
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE TRIGGER trg_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.3 STAGES (estagios do pipeline)
-- --------------------------------------------------------------------------
CREATE TABLE stages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#6B7280',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  semantics   stage_semantics NOT NULL DEFAULT 'in_progress',
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.4 COMPANIES
-- --------------------------------------------------------------------------
CREATE TABLE companies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  trade_name       TEXT,
  cnpj             TEXT,
  industry         TEXT,
  website          TEXT,
  phone            TEXT,
  email            TEXT,
  employee_count   INTEGER,
  annual_revenue   NUMERIC(15, 2),
  revenue_currency TEXT DEFAULT 'BRL',
  type             TEXT,
  assigned_to      UUID REFERENCES profiles(id),
  logo_url         TEXT,
  -- Endereco
  address_street   TEXT,
  address_number   TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city     TEXT,
  address_state    TEXT,
  address_zip      TEXT,
  address_country  TEXT DEFAULT 'Brasil',
  -- Extras
  notes            TEXT,
  tags             TEXT[],
  banking_details  JSONB,
  source           TEXT,
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ
);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.5 CONTACTS
-- --------------------------------------------------------------------------
CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    TEXT NOT NULL,
  last_name     TEXT,
  email         TEXT,
  phone         TEXT,
  mobile        TEXT,
  whatsapp      TEXT,
  job_title     TEXT,
  birthdate     DATE,
  source        TEXT,
  type          contact_type NOT NULL DEFAULT 'client',
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES profiles(id),
  avatar_url    TEXT,
  -- Endereco
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city   TEXT,
  address_state  TEXT,
  address_zip    TEXT,
  address_country TEXT DEFAULT 'Brasil',
  -- Extras
  notes          TEXT,
  tags           TEXT[],
  -- UTM
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  utm_term       TEXT,
  utm_content    TEXT,
  -- Status
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  deleted_at     TIMESTAMPTZ
);

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.6 LEADS
-- --------------------------------------------------------------------------
CREATE TABLE leads (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                TEXT NOT NULL,
  contact_id           UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id          UUID NOT NULL REFERENCES pipelines(id),
  stage_id             UUID NOT NULL REFERENCES stages(id),
  value                NUMERIC(15, 2) DEFAULT 0,
  currency             TEXT DEFAULT 'BRL',
  source               TEXT,
  source_description   TEXT,
  assigned_to          UUID REFERENCES profiles(id),
  probability          SMALLINT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  temperature          temperature_level DEFAULT 'cold',
  notes                TEXT,
  tags                 TEXT[],
  -- UTM
  utm_source           TEXT,
  utm_medium           TEXT,
  utm_campaign         TEXT,
  utm_term             TEXT,
  utm_content          TEXT,
  -- Conversao
  converted_at         TIMESTAMPTZ,
  converted_to_deal_id UUID, -- FK adicionada depois para evitar dependencia circular
  created_by           UUID REFERENCES profiles(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at     TIMESTAMPTZ,
  deleted_at           TIMESTAMPTZ
);

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.7 DEALS (negocios)
-- --------------------------------------------------------------------------
CREATE TABLE deals (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                TEXT NOT NULL,
  contact_id           UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id          UUID NOT NULL REFERENCES pipelines(id),
  stage_id             UUID NOT NULL REFERENCES stages(id),
  value                NUMERIC(15, 2) DEFAULT 0,
  currency             TEXT DEFAULT 'BRL',
  probability          SMALLINT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  temperature          temperature_level DEFAULT 'warm',
  expected_close_date  DATE,
  actual_close_date    DATE,
  source               TEXT,
  deal_type            deal_type DEFAULT 'new_business',
  assigned_to          UUID REFERENCES profiles(id),
  notes                TEXT,
  tags                 TEXT[],
  won_reason           TEXT,
  lost_reason          TEXT,
  is_recurring         BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_interval  TEXT, -- ex: '30 days', '1 month'
  lead_id              UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_by           UUID REFERENCES profiles(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at     TIMESTAMPTZ,
  deleted_at           TIMESTAMPTZ
);

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FK circular: leads.converted_to_deal_id -> deals.id
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_converted_to_deal
  FOREIGN KEY (converted_to_deal_id) REFERENCES deals(id) ON DELETE SET NULL;

-- --------------------------------------------------------------------------
-- 4.8 PRODUCTS (catalogo de produtos)
-- --------------------------------------------------------------------------
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  sku         TEXT UNIQUE,
  price       NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency    TEXT DEFAULT 'BRL',
  tax_rate    NUMERIC(5, 2) DEFAULT 0,
  unit        TEXT DEFAULT 'un',
  category    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.9 DEAL_PRODUCTS (produtos vinculados ao negocio)
-- --------------------------------------------------------------------------
CREATE TABLE deal_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id        UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name   TEXT NOT NULL,
  quantity       NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price     NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount_type  discount_type DEFAULT 'percentage',
  discount_value NUMERIC(15, 2) DEFAULT 0,
  tax_rate       NUMERIC(5, 2) DEFAULT 0,
  total          NUMERIC(15, 2) NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_deal_products_updated_at
  BEFORE UPDATE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.10 ACTIVITIES (historico de atividades)
-- --------------------------------------------------------------------------
CREATE TABLE activities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type      TEXT NOT NULL, -- 'lead', 'deal', 'contact', 'company', 'ticket'
  entity_id        UUID NOT NULL,
  type             activity_type NOT NULL DEFAULT 'note',
  title            TEXT,
  description      TEXT,
  scheduled_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  is_done          BOOLEAN NOT NULL DEFAULT FALSE,
  priority         task_priority DEFAULT 'normal',
  duration_minutes INTEGER,
  result           TEXT,
  metadata         JSONB DEFAULT '{}',
  assigned_to      UUID REFERENCES profiles(id),
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.11 TASKS
-- --------------------------------------------------------------------------
CREATE TABLE tasks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  status           task_status NOT NULL DEFAULT 'pending',
  priority         task_priority NOT NULL DEFAULT 'normal',
  task_type        TEXT,
  assigned_to      UUID REFERENCES profiles(id),
  created_by       UUID REFERENCES profiles(id),
  due_date         TIMESTAMPTZ,
  start_date       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  estimated_hours  NUMERIC(6, 2),
  actual_hours     NUMERIC(6, 2),
  entity_type      TEXT,  -- 'lead', 'deal', 'contact', 'company', 'ticket'
  entity_id        UUID,
  parent_task_id   UUID REFERENCES tasks(id) ON DELETE SET NULL,
  tags             TEXT[],
  checklist        JSONB DEFAULT '[]',
  is_recurring     BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule  TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.12 TICKETS (suporte / pos-venda)
-- --------------------------------------------------------------------------

-- Sequencia para numero do ticket legivel (ex: #00001)
CREATE SEQUENCE ticket_number_seq START 1;

CREATE TABLE tickets (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number         INTEGER NOT NULL DEFAULT nextval('ticket_number_seq'),
  title                 TEXT NOT NULL,
  description           TEXT,
  contact_id            UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id            UUID REFERENCES companies(id) ON DELETE SET NULL,
  deal_id               UUID REFERENCES deals(id) ON DELETE SET NULL,
  pipeline_id           UUID REFERENCES pipelines(id),
  stage_id              UUID REFERENCES stages(id),
  priority              ticket_priority NOT NULL DEFAULT 'normal',
  category              TEXT,
  assigned_to           UUID REFERENCES profiles(id),
  source                TEXT,
  first_response_at     TIMESTAMPTZ,
  resolved_at           TIMESTAMPTZ,
  satisfaction_score    SMALLINT CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  satisfaction_comment  TEXT,
  sla_deadline          TIMESTAMPTZ,
  tags                  TEXT[],
  created_by            UUID REFERENCES profiles(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

ALTER SEQUENCE ticket_number_seq OWNED BY tickets.ticket_number;

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.13 CUSTOM FIELD DEFINITIONS
-- --------------------------------------------------------------------------
CREATE TABLE custom_field_definitions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type       TEXT NOT NULL,  -- 'lead', 'deal', 'contact', 'company', 'ticket'
  field_name        TEXT NOT NULL,
  field_label       TEXT NOT NULL,
  field_type        TEXT NOT NULL,  -- 'text', 'number', 'date', 'select', 'multiselect', 'boolean', 'url', 'email', 'phone'
  options           JSONB,          -- para select/multiselect
  is_required       BOOLEAN NOT NULL DEFAULT FALSE,
  required_at_stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
  is_multiple       BOOLEAN NOT NULL DEFAULT FALSE,
  show_in_kanban    BOOLEAN NOT NULL DEFAULT FALSE,
  show_in_filter    BOOLEAN NOT NULL DEFAULT TRUE,
  show_in_list      BOOLEAN NOT NULL DEFAULT TRUE,
  default_value     TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  tooltip           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (entity_type, field_name)
);

CREATE TRIGGER trg_custom_field_definitions_updated_at
  BEFORE UPDATE ON custom_field_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.14 CUSTOM FIELD VALUES
-- --------------------------------------------------------------------------
CREATE TABLE custom_field_values (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id    UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  value       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (field_id, entity_type, entity_id)
);

CREATE TRIGGER trg_custom_field_values_updated_at
  BEFORE UPDATE ON custom_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.15 AUTOMATION RULES
-- --------------------------------------------------------------------------
CREATE TABLE automation_rules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id     UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES stages(id) ON DELETE SET NULL,
  trigger_type    TEXT NOT NULL, -- 'stage_enter', 'stage_leave', 'field_change', 'time_elapsed', 'entity_created'
  trigger_config  JSONB DEFAULT '{}',
  action_type     TEXT NOT NULL, -- 'move_stage', 'assign_user', 'send_email', 'create_task', 'webhook', 'notification'
  action_config   JSONB DEFAULT '{}',
  conditions      JSONB DEFAULT '[]',
  delay_minutes   INTEGER DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  name            TEXT NOT NULL,
  description     TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.16 AUTOMATION LOGS
-- --------------------------------------------------------------------------
CREATE TABLE automation_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id     UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'executed', -- 'executed', 'failed', 'skipped'
  result      JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- 4.17 NOTIFICATIONS
-- --------------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT,
  type        TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'task', 'deal', 'mention'
  entity_type TEXT,
  entity_id   UUID,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.18 ATTACHMENTS
-- --------------------------------------------------------------------------
CREATE TABLE attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   BIGINT,
  file_type   TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_attachments_updated_at
  BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4.19 SAVED FILTERS
-- --------------------------------------------------------------------------
CREATE TABLE saved_filters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. FUNCAO: calculo automatico do total em deal_products
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_deal_product_total()
RETURNS TRIGGER AS $$
DECLARE
  subtotal NUMERIC(15, 2);
  discount NUMERIC(15, 2);
BEGIN
  -- Subtotal = quantidade * preco unitario
  subtotal := NEW.quantity * NEW.unit_price;

  -- Calcula desconto baseado no tipo
  IF NEW.discount_type = 'percentage' THEN
    discount := subtotal * (COALESCE(NEW.discount_value, 0) / 100);
  ELSE
    discount := COALESCE(NEW.discount_value, 0);
  END IF;

  -- Total = subtotal - desconto + imposto sobre (subtotal - desconto)
  NEW.total := (subtotal - discount) * (1 + COALESCE(NEW.tax_rate, 0) / 100);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deal_products_calc_total
  BEFORE INSERT OR UPDATE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION calculate_deal_product_total();

-- ============================================================================
-- 6. TRIGGER: atualizar last_activity_at quando atividade eh criada
-- ============================================================================

CREATE OR REPLACE FUNCTION update_entity_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza last_activity_at na entidade correspondente
  IF NEW.entity_type = 'lead' THEN
    UPDATE leads SET last_activity_at = NOW() WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'deal' THEN
    UPDATE deals SET last_activity_at = NOW() WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'contact' THEN
    UPDATE contacts SET last_activity_at = NOW() WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'company' THEN
    UPDATE companies SET last_activity_at = NOW() WHERE id = NEW.entity_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_activities_update_entity
  AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION update_entity_last_activity();

-- ============================================================================
-- 7. INDICES
-- ============================================================================

-- Contatos
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_deleted_at ON contacts(deleted_at);

-- Empresas
CREATE INDEX idx_companies_assigned_to ON companies(assigned_to);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_phone ON companies(phone);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at);

-- Leads
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_pipeline_id ON leads(pipeline_id);
CREATE INDEX idx_leads_stage_id ON leads(stage_id);
CREATE INDEX idx_leads_contact_id ON leads(contact_id);
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_deleted_at ON leads(deleted_at);

-- Deals
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_deleted_at ON deals(deleted_at);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);

-- Activities
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_type ON activities(type);

-- Tasks
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- Tickets
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_pipeline_id ON tickets(pipeline_id);
CREATE INDEX idx_tickets_stage_id ON tickets(stage_id);
CREATE INDEX idx_tickets_contact_id ON tickets(contact_id);
CREATE INDEX idx_tickets_company_id ON tickets(company_id);
CREATE INDEX idx_tickets_deleted_at ON tickets(deleted_at);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);

-- Custom Fields
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_field_id ON custom_field_values(field_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- Attachments
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- Automation Logs
CREATE INDEX idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX idx_automation_logs_entity ON automation_logs(entity_type, entity_id);

-- Saved Filters
CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);

-- Deal Products
CREATE INDEX idx_deal_products_deal_id ON deal_products(deal_id);
CREATE INDEX idx_deal_products_product_id ON deal_products(product_id);

-- Pipelines / Stages
CREATE INDEX idx_pipelines_deleted_at ON pipelines(deleted_at);
CREATE INDEX idx_stages_pipeline_id ON stages(pipeline_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Funcao auxiliar: retorna o role do usuario autenticado
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Funcao auxiliar: retorna o departamento do usuario autenticado
CREATE OR REPLACE FUNCTION auth_user_department()
RETURNS TEXT AS $$
  SELECT department FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------------
-- Habilitar RLS em TODAS as tabelas
-- --------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- PROFILES: todos podem ver, apenas o proprio pode editar
-- --------------------------------------------------------------------------
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------------
-- PIPELINES / STAGES: leitura para todos, escrita para admin/manager
-- --------------------------------------------------------------------------
CREATE POLICY pipelines_select ON pipelines
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY pipelines_insert ON pipelines
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'manager'));

CREATE POLICY pipelines_update ON pipelines
  FOR UPDATE USING (auth_user_role() IN ('admin', 'manager'));

CREATE POLICY pipelines_delete ON pipelines
  FOR DELETE USING (auth_user_role() = 'admin');

CREATE POLICY stages_select ON stages
  FOR SELECT USING (TRUE);

CREATE POLICY stages_insert ON stages
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'manager'));

CREATE POLICY stages_update ON stages
  FOR UPDATE USING (auth_user_role() IN ('admin', 'manager'));

CREATE POLICY stages_delete ON stages
  FOR DELETE USING (auth_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- MACRO: politicas padrao para entidades com assigned_to
-- Regra: admin ve tudo, manager ve itens do departamento, agent ve seus itens
-- --------------------------------------------------------------------------

-- CONTACTS
CREATE POLICY contacts_select ON contacts FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (TRUE);

CREATE POLICY contacts_update ON contacts FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY contacts_delete ON contacts FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- COMPANIES
CREATE POLICY companies_select ON companies FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (TRUE);

CREATE POLICY companies_update ON companies FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY companies_delete ON companies FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- LEADS
CREATE POLICY leads_select ON leads FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (TRUE);

CREATE POLICY leads_update ON leads FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY leads_delete ON leads FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- DEALS
CREATE POLICY deals_select ON deals FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY deals_insert ON deals FOR INSERT WITH CHECK (TRUE);

CREATE POLICY deals_update ON deals FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY deals_delete ON deals FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- PRODUCTS (todos podem ver, admin/manager editam)
CREATE POLICY products_select ON products FOR SELECT USING (TRUE);

CREATE POLICY products_insert ON products FOR INSERT WITH CHECK (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY products_update ON products FOR UPDATE USING (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY products_delete ON products FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- DEAL_PRODUCTS (herda acesso do deal)
CREATE POLICY deal_products_select ON deal_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_products.deal_id AND deleted_at IS NULL)
);

CREATE POLICY deal_products_insert ON deal_products FOR INSERT WITH CHECK (TRUE);

CREATE POLICY deal_products_update ON deal_products FOR UPDATE USING (TRUE);

CREATE POLICY deal_products_delete ON deal_products FOR DELETE USING (
  auth_user_role() IN ('admin', 'manager')
);

-- ACTIVITIES
CREATE POLICY activities_select ON activities FOR SELECT USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND (
    assigned_to IN (SELECT id FROM profiles WHERE department = auth_user_department())
    OR created_by IN (SELECT id FROM profiles WHERE department = auth_user_department())
  ))
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

CREATE POLICY activities_insert ON activities FOR INSERT WITH CHECK (TRUE);

CREATE POLICY activities_update ON activities FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

CREATE POLICY activities_delete ON activities FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- TASKS
CREATE POLICY tasks_select ON tasks FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tasks_update ON tasks FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY tasks_delete ON tasks FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- TICKETS
CREATE POLICY tickets_select ON tickets FOR SELECT USING (
  deleted_at IS NULL AND (
    auth_user_role() = 'admin'
    OR (auth_user_role() = 'manager' AND assigned_to IN (
      SELECT id FROM profiles WHERE department = auth_user_department()
    ))
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY tickets_insert ON tickets FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tickets_update ON tickets FOR UPDATE USING (
  auth_user_role() = 'admin'
  OR (auth_user_role() = 'manager' AND assigned_to IN (
    SELECT id FROM profiles WHERE department = auth_user_department()
  ))
  OR assigned_to = auth.uid()
);

CREATE POLICY tickets_delete ON tickets FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- CUSTOM FIELD DEFINITIONS (todos leem, admin/manager editam)
CREATE POLICY cfd_select ON custom_field_definitions FOR SELECT USING (TRUE);

CREATE POLICY cfd_insert ON custom_field_definitions FOR INSERT WITH CHECK (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY cfd_update ON custom_field_definitions FOR UPDATE USING (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY cfd_delete ON custom_field_definitions FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- CUSTOM FIELD VALUES (todos podem ler/escrever valores de campos que tem acesso)
CREATE POLICY cfv_select ON custom_field_values FOR SELECT USING (TRUE);
CREATE POLICY cfv_insert ON custom_field_values FOR INSERT WITH CHECK (TRUE);
CREATE POLICY cfv_update ON custom_field_values FOR UPDATE USING (TRUE);
CREATE POLICY cfv_delete ON custom_field_values FOR DELETE USING (
  auth_user_role() IN ('admin', 'manager')
);

-- AUTOMATION RULES (admin/manager)
CREATE POLICY automation_rules_select ON automation_rules FOR SELECT USING (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY automation_rules_insert ON automation_rules FOR INSERT WITH CHECK (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY automation_rules_update ON automation_rules FOR UPDATE USING (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY automation_rules_delete ON automation_rules FOR DELETE USING (
  auth_user_role() = 'admin'
);

-- AUTOMATION LOGS (admin/manager podem ver)
CREATE POLICY automation_logs_select ON automation_logs FOR SELECT USING (
  auth_user_role() IN ('admin', 'manager')
);

CREATE POLICY automation_logs_insert ON automation_logs FOR INSERT WITH CHECK (TRUE);

-- NOTIFICATIONS (usuario ve apenas as suas)
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (TRUE);

CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY notifications_delete ON notifications FOR DELETE USING (
  user_id = auth.uid()
);

-- ATTACHMENTS
CREATE POLICY attachments_select ON attachments FOR SELECT USING (TRUE);
CREATE POLICY attachments_insert ON attachments FOR INSERT WITH CHECK (TRUE);

CREATE POLICY attachments_delete ON attachments FOR DELETE USING (
  auth_user_role() = 'admin'
  OR uploaded_by = auth.uid()
);

-- SAVED FILTERS (usuario ve as suas + as compartilhadas)
CREATE POLICY saved_filters_select ON saved_filters FOR SELECT USING (
  user_id = auth.uid() OR is_shared = TRUE
);

CREATE POLICY saved_filters_insert ON saved_filters FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY saved_filters_update ON saved_filters FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY saved_filters_delete ON saved_filters FOR DELETE USING (
  user_id = auth.uid() OR auth_user_role() = 'admin'
);

-- ============================================================================
-- 9. VIEWS
-- ============================================================================

-- --------------------------------------------------------------------------
-- 9.1 v_deal_pipeline_summary
-- Resumo de deals agrupados por pipeline e estagio, com totais
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_deal_pipeline_summary AS
SELECT
  p.id          AS pipeline_id,
  p.name        AS pipeline_name,
  s.id          AS stage_id,
  s.name        AS stage_name,
  s.sort_order  AS stage_order,
  s.semantics,
  COUNT(d.id)   AS deal_count,
  COALESCE(SUM(d.value), 0)           AS total_value,
  COALESCE(AVG(d.value), 0)           AS avg_value,
  COALESCE(AVG(d.probability), 0)     AS avg_probability,
  -- Valor ponderado = soma(valor * probabilidade / 100)
  COALESCE(SUM(d.value * d.probability / 100.0), 0) AS weighted_value
FROM pipelines p
  JOIN stages s ON s.pipeline_id = p.id
  LEFT JOIN deals d ON d.stage_id = s.id
    AND d.deleted_at IS NULL
WHERE p.deleted_at IS NULL
  AND p.type = 'deals'
GROUP BY p.id, p.name, s.id, s.name, s.sort_order, s.semantics
ORDER BY p.name, s.sort_order;

-- --------------------------------------------------------------------------
-- 9.2 v_activity_feed
-- Feed unificado de atividades com dados do criador
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_activity_feed AS
SELECT
  a.id,
  a.entity_type,
  a.entity_id,
  a.type         AS activity_type,
  a.title,
  a.description,
  a.scheduled_at,
  a.completed_at,
  a.is_done,
  a.priority,
  a.duration_minutes,
  a.result,
  a.metadata,
  a.created_at,
  -- Dados do criador
  a.created_by,
  pc.full_name   AS created_by_name,
  pc.avatar_url  AS created_by_avatar,
  -- Dados do responsavel
  a.assigned_to,
  pa.full_name   AS assigned_to_name,
  pa.avatar_url  AS assigned_to_avatar,
  -- Nome da entidade relacionada (deal ou lead)
  COALESCE(d.title, l.title, ct.first_name || ' ' || COALESCE(ct.last_name, ''), co.name)
    AS entity_name
FROM activities a
  LEFT JOIN profiles pc ON pc.id = a.created_by
  LEFT JOIN profiles pa ON pa.id = a.assigned_to
  LEFT JOIN deals d ON a.entity_type = 'deal' AND d.id = a.entity_id
  LEFT JOIN leads l ON a.entity_type = 'lead' AND l.id = a.entity_id
  LEFT JOIN contacts ct ON a.entity_type = 'contact' AND ct.id = a.entity_id
  LEFT JOIN companies co ON a.entity_type = 'company' AND co.id = a.entity_id
ORDER BY a.created_at DESC;

-- --------------------------------------------------------------------------
-- 9.3 v_overdue_items
-- Itens atrasados: deals, tasks e tickets com prazos expirados
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_overdue_items AS

-- Deals com expected_close_date ultrapassada e sem fechamento
SELECT
  'deal'::TEXT   AS item_type,
  d.id           AS item_id,
  d.title        AS item_title,
  d.expected_close_date::TIMESTAMPTZ AS deadline,
  NOW() - d.expected_close_date::TIMESTAMPTZ AS overdue_by,
  d.assigned_to,
  p.full_name    AS assigned_to_name,
  d.value,
  s.name         AS stage_name
FROM deals d
  JOIN stages s ON s.id = d.stage_id
  LEFT JOIN profiles p ON p.id = d.assigned_to
WHERE d.deleted_at IS NULL
  AND d.actual_close_date IS NULL
  AND d.expected_close_date < CURRENT_DATE
  AND s.semantics NOT IN ('success', 'failure')

UNION ALL

-- Tasks com due_date ultrapassada e nao concluidas
SELECT
  'task'::TEXT   AS item_type,
  t.id           AS item_id,
  t.title        AS item_title,
  t.due_date     AS deadline,
  NOW() - t.due_date AS overdue_by,
  t.assigned_to,
  p.full_name    AS assigned_to_name,
  NULL::NUMERIC  AS value,
  t.status::TEXT AS stage_name
FROM tasks t
  LEFT JOIN profiles p ON p.id = t.assigned_to
WHERE t.deleted_at IS NULL
  AND t.status NOT IN ('completed', 'deferred')
  AND t.due_date < NOW()

UNION ALL

-- Tickets com sla_deadline ultrapassado e nao resolvidos
SELECT
  'ticket'::TEXT AS item_type,
  tk.id          AS item_id,
  tk.title       AS item_title,
  tk.sla_deadline AS deadline,
  NOW() - tk.sla_deadline AS overdue_by,
  tk.assigned_to,
  p.full_name    AS assigned_to_name,
  NULL::NUMERIC  AS value,
  s.name         AS stage_name
FROM tickets tk
  LEFT JOIN stages s ON s.id = tk.stage_id
  LEFT JOIN profiles p ON p.id = tk.assigned_to
WHERE tk.deleted_at IS NULL
  AND tk.resolved_at IS NULL
  AND tk.sla_deadline < NOW()

ORDER BY deadline ASC;

-- --------------------------------------------------------------------------
-- 9.4 v_conversion_funnel
-- Taxa de conversao por estagio do pipeline
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_conversion_funnel AS
WITH stage_counts AS (
  SELECT
    p.id          AS pipeline_id,
    p.name        AS pipeline_name,
    p.type        AS pipeline_type,
    s.id          AS stage_id,
    s.name        AS stage_name,
    s.sort_order,
    s.semantics,
    -- Conta leads ou deals dependendo do tipo de pipeline
    CASE
      WHEN p.type = 'leads' THEN
        (SELECT COUNT(*) FROM leads l WHERE l.stage_id = s.id AND l.deleted_at IS NULL)
      ELSE
        (SELECT COUNT(*) FROM deals d WHERE d.stage_id = s.id AND d.deleted_at IS NULL)
    END AS current_count,
    -- Total que ja passou por este estagio (estao neste ou em estagios posteriores)
    CASE
      WHEN p.type = 'leads' THEN
        (SELECT COUNT(*) FROM leads l
         JOIN stages s2 ON s2.id = l.stage_id AND s2.pipeline_id = p.id
         WHERE l.pipeline_id = p.id AND l.deleted_at IS NULL AND s2.sort_order >= s.sort_order)
      ELSE
        (SELECT COUNT(*) FROM deals d
         JOIN stages s2 ON s2.id = d.stage_id AND s2.pipeline_id = p.id
         WHERE d.pipeline_id = p.id AND d.deleted_at IS NULL AND s2.sort_order >= s.sort_order)
    END AS passed_through_count
  FROM pipelines p
    JOIN stages s ON s.pipeline_id = p.id
  WHERE p.deleted_at IS NULL
),
first_stage_total AS (
  SELECT
    pipeline_id,
    SUM(current_count) AS total_entities
  FROM stage_counts
  GROUP BY pipeline_id
)
SELECT
  sc.pipeline_id,
  sc.pipeline_name,
  sc.pipeline_type,
  sc.stage_id,
  sc.stage_name,
  sc.sort_order,
  sc.semantics,
  sc.current_count,
  sc.passed_through_count,
  fst.total_entities,
  -- Taxa de conversao: quantos chegaram ate aqui / total
  CASE
    WHEN fst.total_entities > 0
    THEN ROUND((sc.passed_through_count::NUMERIC / fst.total_entities) * 100, 2)
    ELSE 0
  END AS conversion_rate_pct
FROM stage_counts sc
  JOIN first_stage_total fst ON fst.pipeline_id = sc.pipeline_id
ORDER BY sc.pipeline_name, sc.sort_order;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
