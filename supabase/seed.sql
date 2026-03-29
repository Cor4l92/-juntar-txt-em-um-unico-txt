-- ============================================================================
-- SEED DATA - CRM Estilo Bitrix24
-- Dados realistas em Portugues (BR)
-- ============================================================================

-- ============================================================================
-- BLOCO PRINCIPAL: insere todos os dados com UUIDs definidos como variaveis
-- ============================================================================
DO $$
DECLARE
  -- ========== PROFILES (UUIDs fixos - referenciam auth.users) ==========
  v_joao    UUID := 'a1b2c3d4-e5f6-7890-abcd-100000000001';
  v_maria   UUID := 'a1b2c3d4-e5f6-7890-abcd-100000000002';
  v_pedro   UUID := 'a1b2c3d4-e5f6-7890-abcd-100000000003';

  -- ========== PIPELINES ==========
  v_pipe_leads      UUID := 'b1000000-0000-0000-0000-000000000001';
  v_pipe_comercial  UUID := 'b1000000-0000-0000-0000-000000000002';
  v_pipe_suporte    UUID := 'b1000000-0000-0000-0000-000000000003';
  v_pipe_posvenda   UUID := 'b1000000-0000-0000-0000-000000000004';

  -- ========== STAGES - Pipeline Leads ==========
  v_stg_novo_lead       UUID := 'c1000000-0000-0000-0001-000000000001';
  v_stg_qualificacao    UUID := 'c1000000-0000-0000-0001-000000000002';
  v_stg_proposta_env    UUID := 'c1000000-0000-0000-0001-000000000003';
  v_stg_negociacao_l    UUID := 'c1000000-0000-0000-0001-000000000004';
  v_stg_descartado      UUID := 'c1000000-0000-0000-0001-000000000005';
  v_stg_convertido      UUID := 'c1000000-0000-0000-0001-000000000006';

  -- ========== STAGES - Pipeline Comercial ==========
  v_stg_primeiro_cont   UUID := 'c2000000-0000-0000-0002-000000000001';
  v_stg_apresentacao    UUID := 'c2000000-0000-0000-0002-000000000002';
  v_stg_proposta_c      UUID := 'c2000000-0000-0000-0002-000000000003';
  v_stg_negociacao_c    UUID := 'c2000000-0000-0000-0002-000000000004';
  v_stg_fechamento      UUID := 'c2000000-0000-0000-0002-000000000005';
  v_stg_ganho           UUID := 'c2000000-0000-0000-0002-000000000006';
  v_stg_perdido         UUID := 'c2000000-0000-0000-0002-000000000007';

  -- ========== STAGES - Pipeline Suporte ==========
  v_stg_novo_ticket     UUID := 'c3000000-0000-0000-0003-000000000001';
  v_stg_em_atendimento  UUID := 'c3000000-0000-0000-0003-000000000002';
  v_stg_aguard_cliente  UUID := 'c3000000-0000-0000-0003-000000000003';
  v_stg_resolvido       UUID := 'c3000000-0000-0000-0003-000000000004';
  v_stg_fechado_sup     UUID := 'c3000000-0000-0000-0003-000000000005';

  -- ========== STAGES - Pipeline Pos-Venda ==========
  v_stg_onboarding      UUID := 'c4000000-0000-0000-0004-000000000001';
  v_stg_acompanhamento  UUID := 'c4000000-0000-0000-0004-000000000002';
  v_stg_renovacao       UUID := 'c4000000-0000-0000-0004-000000000003';
  v_stg_churn           UUID := 'c4000000-0000-0000-0004-000000000004';
  v_stg_retido          UUID := 'c4000000-0000-0000-0004-000000000005';

  -- ========== COMPANIES ==========
  v_comp01 UUID := 'd1000000-0000-0000-0000-000000000001';
  v_comp02 UUID := 'd1000000-0000-0000-0000-000000000002';
  v_comp03 UUID := 'd1000000-0000-0000-0000-000000000003';
  v_comp04 UUID := 'd1000000-0000-0000-0000-000000000004';
  v_comp05 UUID := 'd1000000-0000-0000-0000-000000000005';
  v_comp06 UUID := 'd1000000-0000-0000-0000-000000000006';
  v_comp07 UUID := 'd1000000-0000-0000-0000-000000000007';
  v_comp08 UUID := 'd1000000-0000-0000-0000-000000000008';
  v_comp09 UUID := 'd1000000-0000-0000-0000-000000000009';
  v_comp10 UUID := 'd1000000-0000-0000-0000-000000000010';
  v_comp11 UUID := 'd1000000-0000-0000-0000-000000000011';
  v_comp12 UUID := 'd1000000-0000-0000-0000-000000000012';
  v_comp13 UUID := 'd1000000-0000-0000-0000-000000000013';
  v_comp14 UUID := 'd1000000-0000-0000-0000-000000000014';
  v_comp15 UUID := 'd1000000-0000-0000-0000-000000000015';

  -- ========== CONTACTS ==========
  v_cont01 UUID := 'e1000000-0000-0000-0000-000000000001';
  v_cont02 UUID := 'e1000000-0000-0000-0000-000000000002';
  v_cont03 UUID := 'e1000000-0000-0000-0000-000000000003';
  v_cont04 UUID := 'e1000000-0000-0000-0000-000000000004';
  v_cont05 UUID := 'e1000000-0000-0000-0000-000000000005';
  v_cont06 UUID := 'e1000000-0000-0000-0000-000000000006';
  v_cont07 UUID := 'e1000000-0000-0000-0000-000000000007';
  v_cont08 UUID := 'e1000000-0000-0000-0000-000000000008';
  v_cont09 UUID := 'e1000000-0000-0000-0000-000000000009';
  v_cont10 UUID := 'e1000000-0000-0000-0000-000000000010';
  v_cont11 UUID := 'e1000000-0000-0000-0000-000000000011';
  v_cont12 UUID := 'e1000000-0000-0000-0000-000000000012';
  v_cont13 UUID := 'e1000000-0000-0000-0000-000000000013';
  v_cont14 UUID := 'e1000000-0000-0000-0000-000000000014';
  v_cont15 UUID := 'e1000000-0000-0000-0000-000000000015';
  v_cont16 UUID := 'e1000000-0000-0000-0000-000000000016';
  v_cont17 UUID := 'e1000000-0000-0000-0000-000000000017';
  v_cont18 UUID := 'e1000000-0000-0000-0000-000000000018';
  v_cont19 UUID := 'e1000000-0000-0000-0000-000000000019';
  v_cont20 UUID := 'e1000000-0000-0000-0000-000000000020';
  v_cont21 UUID := 'e1000000-0000-0000-0000-000000000021';
  v_cont22 UUID := 'e1000000-0000-0000-0000-000000000022';
  v_cont23 UUID := 'e1000000-0000-0000-0000-000000000023';
  v_cont24 UUID := 'e1000000-0000-0000-0000-000000000024';
  v_cont25 UUID := 'e1000000-0000-0000-0000-000000000025';
  v_cont26 UUID := 'e1000000-0000-0000-0000-000000000026';
  v_cont27 UUID := 'e1000000-0000-0000-0000-000000000027';
  v_cont28 UUID := 'e1000000-0000-0000-0000-000000000028';
  v_cont29 UUID := 'e1000000-0000-0000-0000-000000000029';
  v_cont30 UUID := 'e1000000-0000-0000-0000-000000000030';

  -- ========== LEADS ==========
  v_lead01 UUID := 'f1000000-0000-0000-0000-000000000001';
  v_lead02 UUID := 'f1000000-0000-0000-0000-000000000002';
  v_lead03 UUID := 'f1000000-0000-0000-0000-000000000003';
  v_lead04 UUID := 'f1000000-0000-0000-0000-000000000004';
  v_lead05 UUID := 'f1000000-0000-0000-0000-000000000005';
  v_lead06 UUID := 'f1000000-0000-0000-0000-000000000006';
  v_lead07 UUID := 'f1000000-0000-0000-0000-000000000007';
  v_lead08 UUID := 'f1000000-0000-0000-0000-000000000008';
  v_lead09 UUID := 'f1000000-0000-0000-0000-000000000009';
  v_lead10 UUID := 'f1000000-0000-0000-0000-000000000010';
  v_lead11 UUID := 'f1000000-0000-0000-0000-000000000011';
  v_lead12 UUID := 'f1000000-0000-0000-0000-000000000012';
  v_lead13 UUID := 'f1000000-0000-0000-0000-000000000013';
  v_lead14 UUID := 'f1000000-0000-0000-0000-000000000014';
  v_lead15 UUID := 'f1000000-0000-0000-0000-000000000015';
  v_lead16 UUID := 'f1000000-0000-0000-0000-000000000016';
  v_lead17 UUID := 'f1000000-0000-0000-0000-000000000017';
  v_lead18 UUID := 'f1000000-0000-0000-0000-000000000018';
  v_lead19 UUID := 'f1000000-0000-0000-0000-000000000019';
  v_lead20 UUID := 'f1000000-0000-0000-0000-000000000020';

  -- ========== DEALS ==========
  v_deal01 UUID := 'a2000000-0000-0000-0000-000000000001';
  v_deal02 UUID := 'a2000000-0000-0000-0000-000000000002';
  v_deal03 UUID := 'a2000000-0000-0000-0000-000000000003';
  v_deal04 UUID := 'a2000000-0000-0000-0000-000000000004';
  v_deal05 UUID := 'a2000000-0000-0000-0000-000000000005';
  v_deal06 UUID := 'a2000000-0000-0000-0000-000000000006';
  v_deal07 UUID := 'a2000000-0000-0000-0000-000000000007';
  v_deal08 UUID := 'a2000000-0000-0000-0000-000000000008';
  v_deal09 UUID := 'a2000000-0000-0000-0000-000000000009';
  v_deal10 UUID := 'a2000000-0000-0000-0000-000000000010';
  v_deal11 UUID := 'a2000000-0000-0000-0000-000000000011';
  v_deal12 UUID := 'a2000000-0000-0000-0000-000000000012';
  v_deal13 UUID := 'a2000000-0000-0000-0000-000000000013';
  v_deal14 UUID := 'a2000000-0000-0000-0000-000000000014';
  v_deal15 UUID := 'a2000000-0000-0000-0000-000000000015';
  v_deal16 UUID := 'a2000000-0000-0000-0000-000000000016';
  v_deal17 UUID := 'a2000000-0000-0000-0000-000000000017';
  v_deal18 UUID := 'a2000000-0000-0000-0000-000000000018';
  v_deal19 UUID := 'a2000000-0000-0000-0000-000000000019';
  v_deal20 UUID := 'a2000000-0000-0000-0000-000000000020';
  v_deal21 UUID := 'a2000000-0000-0000-0000-000000000021';
  v_deal22 UUID := 'a2000000-0000-0000-0000-000000000022';
  v_deal23 UUID := 'a2000000-0000-0000-0000-000000000023';
  v_deal24 UUID := 'a2000000-0000-0000-0000-000000000024';
  v_deal25 UUID := 'a2000000-0000-0000-0000-000000000025';

  -- ========== PRODUCTS ==========
  v_prod01 UUID := 'b2000000-0000-0000-0000-000000000001';
  v_prod02 UUID := 'b2000000-0000-0000-0000-000000000002';
  v_prod03 UUID := 'b2000000-0000-0000-0000-000000000003';
  v_prod04 UUID := 'b2000000-0000-0000-0000-000000000004';
  v_prod05 UUID := 'b2000000-0000-0000-0000-000000000005';
  v_prod06 UUID := 'b2000000-0000-0000-0000-000000000006';
  v_prod07 UUID := 'b2000000-0000-0000-0000-000000000007';
  v_prod08 UUID := 'b2000000-0000-0000-0000-000000000008';
  v_prod09 UUID := 'b2000000-0000-0000-0000-000000000009';
  v_prod10 UUID := 'b2000000-0000-0000-0000-000000000010';

  -- ========== TICKETS ==========
  v_tkt01 UUID := 'c5000000-0000-0000-0000-000000000001';
  v_tkt02 UUID := 'c5000000-0000-0000-0000-000000000002';
  v_tkt03 UUID := 'c5000000-0000-0000-0000-000000000003';
  v_tkt04 UUID := 'c5000000-0000-0000-0000-000000000004';
  v_tkt05 UUID := 'c5000000-0000-0000-0000-000000000005';
  v_tkt06 UUID := 'c5000000-0000-0000-0000-000000000006';
  v_tkt07 UUID := 'c5000000-0000-0000-0000-000000000007';
  v_tkt08 UUID := 'c5000000-0000-0000-0000-000000000008';
  v_tkt09 UUID := 'c5000000-0000-0000-0000-000000000009';
  v_tkt10 UUID := 'c5000000-0000-0000-0000-000000000010';

  -- ========== CUSTOM FIELD DEFINITIONS ==========
  v_cfd01 UUID := 'd2000000-0000-0000-0000-000000000001';
  v_cfd02 UUID := 'd2000000-0000-0000-0000-000000000002';
  v_cfd03 UUID := 'd2000000-0000-0000-0000-000000000003';
  v_cfd04 UUID := 'd2000000-0000-0000-0000-000000000004';
  v_cfd05 UUID := 'd2000000-0000-0000-0000-000000000005';

  -- ========== AUTOMATION RULES ==========
  v_auto01 UUID := 'e2000000-0000-0000-0000-000000000001';
  v_auto02 UUID := 'e2000000-0000-0000-0000-000000000002';
  v_auto03 UUID := 'e2000000-0000-0000-0000-000000000003';

  -- ========== TASKS ==========
  v_task01 UUID := 'f2000000-0000-0000-0000-000000000001';
  v_task02 UUID := 'f2000000-0000-0000-0000-000000000002';
  v_task03 UUID := 'f2000000-0000-0000-0000-000000000003';
  v_task04 UUID := 'f2000000-0000-0000-0000-000000000004';
  v_task05 UUID := 'f2000000-0000-0000-0000-000000000005';
  v_task06 UUID := 'f2000000-0000-0000-0000-000000000006';
  v_task07 UUID := 'f2000000-0000-0000-0000-000000000007';
  v_task08 UUID := 'f2000000-0000-0000-0000-000000000008';
  v_task09 UUID := 'f2000000-0000-0000-0000-000000000009';
  v_task10 UUID := 'f2000000-0000-0000-0000-000000000010';
  v_task11 UUID := 'f2000000-0000-0000-0000-000000000011';
  v_task12 UUID := 'f2000000-0000-0000-0000-000000000012';
  v_task13 UUID := 'f2000000-0000-0000-0000-000000000013';
  v_task14 UUID := 'f2000000-0000-0000-0000-000000000014';
  v_task15 UUID := 'f2000000-0000-0000-0000-000000000015';

BEGIN

  -- ============================================================================
  -- 1. PROFILES (usuarios do sistema)
  -- NOTA: Em producao, esses registros sao criados via trigger em auth.users.
  -- Para seed, inserimos diretamente na tabela profiles.
  -- Os UUIDs precisam existir em auth.users primeiro, ou desabilitar a FK.
  -- ============================================================================

  -- Inserir usuarios falsos em auth.users para que a FK funcione
  INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
  VALUES
    (v_joao, 'joao.silva@empresa.com.br', '{"full_name": "Joao Silva"}'::jsonb, NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    (v_maria, 'maria.santos@empresa.com.br', '{"full_name": "Maria Santos"}'::jsonb, NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    (v_pedro, 'pedro.oliveira@empresa.com.br', '{"full_name": "Pedro Oliveira"}'::jsonb, NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, full_name, role, job_title, phone, department, is_active) VALUES
    (v_joao,  'Joao Silva',       'admin',   'Diretor Comercial',   '+55 11 99900-0001', 'Diretoria',  TRUE),
    (v_maria, 'Maria Santos',     'manager', 'Gerente de Vendas',   '+55 11 99900-0002', 'Comercial',  TRUE),
    (v_pedro, 'Pedro Oliveira',   'agent',   'Vendedor',            '+55 11 99900-0003', 'Comercial',  TRUE);

  -- ============================================================================
  -- 2. PIPELINES
  -- ============================================================================
  INSERT INTO pipelines (id, name, type, is_default, sort_order, created_by) VALUES
    (v_pipe_leads,     'Leads',           'leads',      TRUE,  1, v_joao),
    (v_pipe_comercial, 'Comercial',       'deals',      TRUE,  2, v_joao),
    (v_pipe_suporte,   'Suporte',         'support',    TRUE,  3, v_joao),
    (v_pipe_posvenda,  'Pos-Venda',       'post_sales', TRUE,  4, v_joao);

  -- ============================================================================
  -- 3. STAGES (estagios de cada pipeline)
  -- ============================================================================

  -- Pipeline: Leads
  INSERT INTO stages (id, pipeline_id, name, color, sort_order, semantics, is_system) VALUES
    (v_stg_novo_lead,    v_pipe_leads, 'Novo Lead',         '#3B82F6', 1, 'initial',     TRUE),
    (v_stg_qualificacao, v_pipe_leads, 'Qualificacao',      '#F59E0B', 2, 'in_progress', FALSE),
    (v_stg_proposta_env, v_pipe_leads, 'Proposta Enviada',  '#8B5CF6', 3, 'in_progress', FALSE),
    (v_stg_negociacao_l, v_pipe_leads, 'Negociacao',        '#EC4899', 4, 'in_progress', FALSE),
    (v_stg_descartado,   v_pipe_leads, 'Descartado',        '#EF4444', 5, 'failure',     TRUE),
    (v_stg_convertido,   v_pipe_leads, 'Convertido',        '#10B981', 6, 'success',     TRUE);

  -- Pipeline: Comercial (Deals)
  INSERT INTO stages (id, pipeline_id, name, color, sort_order, semantics, is_system) VALUES
    (v_stg_primeiro_cont, v_pipe_comercial, 'Primeiro Contato', '#3B82F6', 1, 'initial',     TRUE),
    (v_stg_apresentacao,  v_pipe_comercial, 'Apresentacao',     '#06B6D4', 2, 'in_progress', FALSE),
    (v_stg_proposta_c,    v_pipe_comercial, 'Proposta',         '#8B5CF6', 3, 'in_progress', FALSE),
    (v_stg_negociacao_c,  v_pipe_comercial, 'Negociacao',       '#F59E0B', 4, 'in_progress', FALSE),
    (v_stg_fechamento,    v_pipe_comercial, 'Fechamento',       '#EC4899', 5, 'in_progress', FALSE),
    (v_stg_ganho,         v_pipe_comercial, 'Ganho',            '#10B981', 6, 'success',     TRUE),
    (v_stg_perdido,       v_pipe_comercial, 'Perdido',          '#EF4444', 7, 'failure',     TRUE);

  -- Pipeline: Suporte
  INSERT INTO stages (id, pipeline_id, name, color, sort_order, semantics, is_system) VALUES
    (v_stg_novo_ticket,    v_pipe_suporte, 'Novo',               '#3B82F6', 1, 'initial',     TRUE),
    (v_stg_em_atendimento, v_pipe_suporte, 'Em Atendimento',     '#F59E0B', 2, 'in_progress', FALSE),
    (v_stg_aguard_cliente, v_pipe_suporte, 'Aguardando Cliente', '#8B5CF6', 3, 'in_progress', FALSE),
    (v_stg_resolvido,      v_pipe_suporte, 'Resolvido',          '#10B981', 4, 'success',     TRUE),
    (v_stg_fechado_sup,    v_pipe_suporte, 'Fechado',            '#6B7280', 5, 'success',     TRUE);

  -- Pipeline: Pos-Venda
  INSERT INTO stages (id, pipeline_id, name, color, sort_order, semantics, is_system) VALUES
    (v_stg_onboarding,     v_pipe_posvenda, 'Onboarding',      '#3B82F6', 1, 'initial',     TRUE),
    (v_stg_acompanhamento, v_pipe_posvenda, 'Acompanhamento',  '#F59E0B', 2, 'in_progress', FALSE),
    (v_stg_renovacao,      v_pipe_posvenda, 'Renovacao',        '#8B5CF6', 3, 'in_progress', FALSE),
    (v_stg_churn,          v_pipe_posvenda, 'Churn',            '#EF4444', 4, 'failure',     TRUE),
    (v_stg_retido,         v_pipe_posvenda, 'Retido',           '#10B981', 5, 'success',     TRUE);

  -- ============================================================================
  -- 4. COMPANIES (15 empresas brasileiras)
  -- ============================================================================
  INSERT INTO companies (id, name, trade_name, cnpj, industry, website, phone, email, employee_count, annual_revenue, type, assigned_to, address_city, address_state, address_zip, notes, tags, source, created_by) VALUES
    (v_comp01, 'TechSol Solucoes em TI Ltda',           'TechSol',          '12.345.678/0001-01', 'Tecnologia',             'https://techsol.com.br',       '+55 11 3000-1001', 'contato@techsol.com.br',       150,  5200000.00, 'client',   v_pedro, 'Sao Paulo',       'SP', '01310-100', 'Cliente desde 2024. Interesse em CRM.',               ARRAY['tecnologia','enterprise'], 'Site',       v_joao),
    (v_comp02, 'Construtora Horizonte S.A.',             'Horizonte',        '23.456.789/0001-02', 'Construcao Civil',       'https://horizontesa.com.br',   '+55 21 3000-1002', 'comercial@horizontesa.com.br', 320,  18000000.00,'client',   v_maria, 'Rio de Janeiro',   'RJ', '20040-020', 'Grande conta. Projetos de infraestrutura.',            ARRAY['construcao','grande'],     'Indicacao', v_joao),
    (v_comp03, 'Agro Norte Comercio de Graos Ltda',     'Agro Norte',       '34.567.890/0001-03', 'Agronegocio',            'https://agronorte.com.br',     '+55 62 3000-1003', 'vendas@agronorte.com.br',       85,  12000000.00,'client',   v_pedro, 'Goiania',          'GO', '74000-000', 'Exportadora de soja e milho.',                         ARRAY['agro','exportacao'],       'Feira',     v_maria),
    (v_comp04, 'Clinica Saude Integral Ltda',            'Saude Integral',   '45.678.901/0001-04', 'Saude',                  'https://saudeintegral.com.br', '+55 31 3000-1004', 'admin@saudeintegral.com.br',    45,  3800000.00, 'client',   v_pedro, 'Belo Horizonte',   'MG', '30130-000', 'Rede de clinicas em expansao.',                        ARRAY['saude','clinica'],         'Google Ads',v_maria),
    (v_comp05, 'Logistica Expresso Nacional Ltda',       'Expresso Nacional','56.789.012/0001-05', 'Logistica e Transporte', 'https://expressonacional.com.br','+55 41 3000-1005','contato@expressonacional.com.br',200, 9500000.00, 'client',   v_maria, 'Curitiba',         'PR', '80010-000', 'Frota propria de 80 veiculos.',                        ARRAY['logistica','transporte'],  'LinkedIn',  v_joao),
    (v_comp06, 'Escola Digital Educacao Ltda',           'Escola Digital',   '67.890.123/0001-06', 'Educacao',               'https://escoladigital.edu.br', '+55 51 3000-1006', 'contato@escoladigital.edu.br',  35,  1800000.00, 'client',   v_pedro, 'Porto Alegre',     'RS', '90010-000', 'Plataforma EAD para ensino medio.',                    ARRAY['educacao','edtech'],       'Site',      v_maria),
    (v_comp07, 'Alimentos Sabor do Brasil Ltda',         'Sabor do Brasil',  '78.901.234/0001-07', 'Alimentos e Bebidas',    'https://sabordobrasil.com.br', '+55 71 3000-1007', 'vendas@sabordobrasil.com.br',   120, 7200000.00, 'client',   v_maria, 'Salvador',         'BA', '40020-000', 'Fabricante de molhos e condimentos.',                  ARRAY['alimentos','fabricante'],  'Indicacao', v_joao),
    (v_comp08, 'FinControl Servicos Financeiros S.A.',   'FinControl',       '89.012.345/0001-08', 'Financeiro',             'https://fincontrol.com.br',    '+55 11 3000-1008', 'comercial@fincontrol.com.br',   60,  4500000.00, 'client',   v_pedro, 'Sao Paulo',        'SP', '04543-000', 'Consultoria financeira para PMEs.',                    ARRAY['financeiro','consultoria'],'Google Ads',v_joao),
    (v_comp09, 'Energia Solar Nordeste Ltda',            'Solar Nordeste',   '90.123.456/0001-09', 'Energia',                'https://solarnordeste.com.br', '+55 85 3000-1009', 'contato@solarnordeste.com.br',  40,  6000000.00, 'partner', v_maria, 'Fortaleza',        'CE', '60060-000', 'Instaladora de paineis solares.',                      ARRAY['energia','solar'],         'Feira',     v_maria),
    (v_comp10, 'Textil Moda Carioca Ltda',               'Moda Carioca',    '01.234.567/0001-10', 'Moda e Vestuario',       'https://modacarioca.com.br',   '+55 21 3000-1010', 'vendas@modacarioca.com.br',     75,  3200000.00, 'client',   v_pedro, 'Rio de Janeiro',   'RJ', '20040-030', 'Marca propria de roupas femininas.',                   ARRAY['moda','varejo'],           'Instagram', v_pedro),
    (v_comp11, 'Metalurgica Progresso Industria Ltda',   'Metalurgica Progresso','11.223.344/0001-11','Industria Metalurgica','https://metprogresso.com.br', '+55 19 3000-1011', 'comercial@metprogresso.com.br', 180, 14000000.00,'client',   v_maria, 'Campinas',         'SP', '13010-000', 'Pecas para industria automotiva.',                     ARRAY['industria','metalurgia'],  'Indicacao', v_joao),
    (v_comp12, 'Turismo Aventura Brasil Ltda',           'Aventura Brasil',  '22.334.455/0001-12', 'Turismo',                'https://aventurabrasil.tur.br','+55 47 3000-1012', 'reservas@aventurabrasil.tur.br', 25, 1200000.00, 'client',   v_pedro, 'Florianopolis',    'SC', '88010-000', 'Pacotes de ecoturismo e aventura.',                    ARRAY['turismo','aventura'],      'Site',      v_pedro),
    (v_comp13, 'Farmaceutica Vida Plena Ltda',           'Vida Plena',       '33.445.566/0001-13', 'Farmaceutico',           'https://vidaplena.com.br',     '+55 61 3000-1013', 'sac@vidaplena.com.br',          90,  8000000.00, 'client',   v_maria, 'Brasilia',         'DF', '70070-000', 'Distribuidora de medicamentos genericos.',             ARRAY['farma','distribuicao'],    'LinkedIn',  v_joao),
    (v_comp14, 'Seguranca Total Vigilancia Ltda',        'Seguranca Total',  '44.556.677/0001-14', 'Seguranca',              'https://segurancatotal.com.br','+55 81 3000-1014', 'contato@segurancatotal.com.br', 350, 11000000.00,'client',   v_pedro, 'Recife',           'PE', '50030-000', 'Servicos de vigilancia patrimonial e eletronica.',     ARRAY['seguranca','vigilancia'],  'Indicacao', v_maria),
    (v_comp15, 'Contabil Precisao Assessoria Ltda',      'Contabil Precisao','55.667.788/0001-15', 'Contabilidade',          'https://contabilprecisao.com.br','+55 27 3000-1015','contato@contabilprecisao.com.br', 20, 800000.00,  'partner', v_maria, 'Vitoria',          'ES', '29010-000', 'Escritorio contabil com foco em startups.',            ARRAY['contabil','assessoria'],   'Google Ads',v_pedro);

  -- ============================================================================
  -- 5. CONTACTS (30 contatos brasileiros)
  -- ============================================================================
  INSERT INTO contacts (id, first_name, last_name, email, phone, mobile, whatsapp, job_title, source, type, company_id, assigned_to, address_city, address_state, notes, tags, created_by) VALUES
    (v_cont01, 'Ana Carolina',  'Ferreira',      'ana.ferreira@techsol.com.br',        '+55 11 3100-0001', '+55 11 99100-0001', '+55 11 99100-0001', 'Diretora de TI',           'Site',       'client', v_comp01, v_pedro, 'Sao Paulo',       'SP', 'Decisora tecnica.',                    ARRAY['decisor','ti'],       v_maria),
    (v_cont02, 'Lucas',         'Mendes',        'lucas.mendes@techsol.com.br',        '+55 11 3100-0002', '+55 11 99100-0002', '+55 11 99100-0002', 'Gerente de Projetos',      'Site',       'client', v_comp01, v_pedro, 'Sao Paulo',       'SP', 'Contato operacional.',                 ARRAY['operacional'],        v_maria),
    (v_cont03, 'Fernanda',      'Costa',         'fernanda.costa@horizontesa.com.br',  '+55 21 3100-0003', '+55 21 99100-0003', '+55 21 99100-0003', 'Gerente Administrativa',   'Indicacao',  'client', v_comp02, v_maria, 'Rio de Janeiro',  'RJ', 'Responsavel por compras.',             ARRAY['compras'],            v_joao),
    (v_cont04, 'Rafael',        'Souza',         'rafael.souza@horizontesa.com.br',    '+55 21 3100-0004', '+55 21 99100-0004', '+55 21 99100-0004', 'Engenheiro Civil',         'Indicacao',  'client', v_comp02, v_maria, 'Rio de Janeiro',  'RJ', 'Contato tecnico para projetos.',       ARRAY['tecnico'],            v_joao),
    (v_cont05, 'Juliana',       'Almeida',       'juliana.almeida@agronorte.com.br',   '+55 62 3100-0005', '+55 62 99100-0005', '+55 62 99100-0005', 'Diretora Comercial',       'Feira',      'client', v_comp03, v_pedro, 'Goiania',         'GO', 'Interessada em sistema de gestao.',    ARRAY['decisor','comercial'],v_maria),
    (v_cont06, 'Bruno',         'Nascimento',    'bruno.nascimento@saudeintegral.com.br','+55 31 3100-0006','+55 31 99100-0006','+55 31 99100-0006','Administrador',            'Google Ads', 'client', v_comp04, v_pedro, 'Belo Horizonte',  'MG', 'Busca solucao para agendamento.',      ARRAY['saude'],              v_maria),
    (v_cont07, 'Camila',        'Rodrigues',     'camila.rodrigues@expressonacional.com.br','+55 41 3100-0007','+55 41 99100-0007','+55 41 99100-0007','Gerente de Operacoes', 'LinkedIn',   'client', v_comp05, v_maria, 'Curitiba',        'PR', 'Precisa de rastreamento de frotas.',   ARRAY['logistica','decisor'],v_joao),
    (v_cont08, 'Thiago',        'Lima',          'thiago.lima@escoladigital.edu.br',   '+55 51 3100-0008', '+55 51 99100-0008', '+55 51 99100-0008', 'Coordenador Pedagogico',   'Site',       'client', v_comp06, v_pedro, 'Porto Alegre',    'RS', 'Avaliando CRM para gestao de alunos.', ARRAY['educacao'],           v_pedro),
    (v_cont09, 'Patricia',      'Barbosa',       'patricia.barbosa@sabordobrasil.com.br','+55 71 3100-0009','+55 71 99100-0009','+55 71 99100-0009','Diretora Industrial',     'Indicacao',  'client', v_comp07, v_maria, 'Salvador',        'BA', 'Expansao de distribuicao.',            ARRAY['industria','decisor'],v_joao),
    (v_cont10, 'Marcos',        'Teixeira',      'marcos.teixeira@fincontrol.com.br',  '+55 11 3100-0010', '+55 11 99100-0010', '+55 11 99100-0010', 'Socio-Diretor',            'Google Ads', 'client', v_comp08, v_pedro, 'Sao Paulo',       'SP', 'Quer automatizar processos internos.', ARRAY['financeiro','decisor'],v_joao),
    (v_cont11, 'Isabela',       'Gomes',         'isabela.gomes@solarnordeste.com.br', '+55 85 3100-0011', '+55 85 99100-0011', '+55 85 99100-0011', 'Gerente Comercial',        'Feira',      'partner',v_comp09, v_maria, 'Fortaleza',       'CE', 'Parceria para vendas conjuntas.',      ARRAY['parceiro','energia'], v_maria),
    (v_cont12, 'Gabriel',       'Araujo',        'gabriel.araujo@modacarioca.com.br',  '+55 21 3100-0012', '+55 21 99100-0012', '+55 21 99100-0012', 'Gerente de E-commerce',    'Instagram',  'client', v_comp10, v_pedro, 'Rio de Janeiro',  'RJ', 'Interesse em integrar CRM com loja.', ARRAY['ecommerce','moda'],  v_pedro),
    (v_cont13, 'Leticia',       'Oliveira',      'leticia.oliveira@metprogresso.com.br','+55 19 3100-0013','+55 19 99100-0013','+55 19 99100-0013','Diretora Financeira',     'Indicacao',  'client', v_comp11, v_maria, 'Campinas',        'SP', 'Orcamento aprovado para Q2 2026.',    ARRAY['industria','decisor'],v_joao),
    (v_cont14, 'Diego',         'Pereira',       'diego.pereira@aventurabrasil.tur.br','+55 47 3100-0014', '+55 47 99100-0014', '+55 47 99100-0014', 'Proprietario',             'Site',       'client', v_comp12, v_pedro, 'Florianopolis',   'SC', 'Empresa pequena, dono faz tudo.',     ARRAY['turismo','pequeno'],  v_pedro),
    (v_cont15, 'Mariana',       'Castro',        'mariana.castro@vidaplena.com.br',    '+55 61 3100-0015', '+55 61 99100-0015', '+55 61 99100-0015', 'Gerente de Compras',       'LinkedIn',   'client', v_comp13, v_maria, 'Brasilia',        'DF', 'Processo de compras formal.',          ARRAY['farma','compras'],    v_joao),
    (v_cont16, 'Felipe',        'Cardoso',       'felipe.cardoso@segurancatotal.com.br','+55 81 3100-0016','+55 81 99100-0016','+55 81 99100-0016','Diretor de Operacoes',    'Indicacao',  'client', v_comp14, v_pedro, 'Recife',          'PE', 'Alto volume de funcionarios.',         ARRAY['seguranca','grande'], v_maria),
    (v_cont17, 'Aline',         'Santos',        'aline.santos@contabilprecisao.com.br','+55 27 3100-0017','+55 27 99100-0017','+55 27 99100-0017','Contadora Responsavel',   'Google Ads', 'partner',v_comp15, v_maria, 'Vitoria',         'ES', 'Pode indicar clientes PME.',           ARRAY['contabil','parceiro'],v_pedro),
    (v_cont18, 'Ricardo',       'Monteiro',      'ricardo.monteiro@email.com.br',      NULL,               '+55 11 99200-0018', '+55 11 99200-0018', 'Consultor Autonomo',       'LinkedIn',   'other',  NULL,     v_pedro, 'Sao Paulo',       'SP', 'Freelancer, interesse em ferramenta.', ARRAY['autonomo'],           v_pedro),
    (v_cont19, 'Vanessa',       'Ribeiro',       'vanessa.ribeiro@email.com.br',       NULL,               '+55 21 99200-0019', '+55 21 99200-0019', 'Empresaria',               'Instagram',  'client', NULL,     v_pedro, 'Rio de Janeiro',  'RJ', 'Abrindo novo negocio, sem empresa.', ARRAY['prospeccao'],         v_maria),
    (v_cont20, 'Eduardo',       'Campos',        'eduardo.campos@techsol.com.br',      '+55 11 3100-0020', '+55 11 99100-0020', '+55 11 99100-0020', 'Analista de Sistemas',     'Site',       'client', v_comp01, v_pedro, 'Sao Paulo',       'SP', 'Contato tecnico secundario.',          ARRAY['ti','operacional'],   v_maria),
    (v_cont21, 'Tatiana',       'Duarte',        'tatiana.duarte@agronorte.com.br',    '+55 62 3100-0021', '+55 62 99100-0021', '+55 62 99100-0021', 'Gerente Financeira',       'Feira',      'client', v_comp03, v_pedro, 'Goiania',         'GO', 'Aprova orcamentos acima de R$50k.',   ARRAY['financeiro','decisor'],v_maria),
    (v_cont22, 'Andre',         'Moreira',       'andre.moreira@saudeintegral.com.br', '+55 31 3100-0022', '+55 31 99100-0022', '+55 31 99100-0022', 'Diretor Clinico',          'Google Ads', 'client', v_comp04, v_pedro, 'Belo Horizonte',  'MG', 'Decisor final da clinica.',            ARRAY['saude','decisor'],    v_maria),
    (v_cont23, 'Carla',         'Vieira',        'carla.vieira@expressonacional.com.br','+55 41 3100-0023','+55 41 99100-0023','+55 41 99100-0023','Analista Logistica',      'LinkedIn',   'client', v_comp05, v_maria, 'Curitiba',        'PR', 'Contato tecnico da logistica.',        ARRAY['logistica'],          v_joao),
    (v_cont24, 'Roberto',       'Freitas',       'roberto.freitas@sabordobrasil.com.br','+55 71 3100-0024','+55 71 99100-0024','+55 71 99100-0024','Gerente de Vendas',       'Indicacao',  'client', v_comp07, v_maria, 'Salvador',        'BA', 'Responsavel pela equipe comercial.',   ARRAY['comercial'],          v_joao),
    (v_cont25, 'Priscila',      'Machado',       'priscila.machado@fincontrol.com.br', '+55 11 3100-0025', '+55 11 99100-0025', '+55 11 99100-0025', 'Analista Financeira',      'Google Ads', 'client', v_comp08, v_pedro, 'Sao Paulo',       'SP', 'Ponto focal para implantacao.',        ARRAY['financeiro'],         v_joao),
    (v_cont26, 'Gustavo',       'Correia',       'gustavo.correia@modacarioca.com.br', '+55 21 3100-0026', '+55 21 99100-0026', '+55 21 99100-0026', 'Diretor Criativo',         'Instagram',  'client', v_comp10, v_pedro, 'Rio de Janeiro',  'RJ', 'Influencia na decisao de compra.',     ARRAY['moda','criativo'],    v_pedro),
    (v_cont27, 'Amanda',        'Batista',       'amanda.batista@metprogresso.com.br', '+55 19 3100-0027', '+55 19 99100-0027', '+55 19 99100-0027', 'Gerente de Producao',      'Indicacao',  'client', v_comp11, v_maria, 'Campinas',        'SP', 'Contato operacional da fabrica.',      ARRAY['industria','producao'],v_joao),
    (v_cont28, 'Henrique',      'Neves',         'henrique.neves@vidaplena.com.br',    '+55 61 3100-0028', '+55 61 99100-0028', '+55 61 99100-0028', 'Gerente de TI',            'LinkedIn',   'client', v_comp13, v_maria, 'Brasilia',        'DF', 'Responsavel por infraestrutura TI.',   ARRAY['farma','ti'],         v_joao),
    (v_cont29, 'Sabrina',       'Pinto',         'sabrina.pinto@segurancatotal.com.br','+55 81 3100-0029', '+55 81 99100-0029', '+55 81 99100-0029', 'Gerente de RH',            'Indicacao',  'client', v_comp14, v_pedro, 'Recife',          'PE', 'Interesse em controle de ponto.',      ARRAY['seguranca','rh'],     v_maria),
    (v_cont30, 'Paulo',         'Silveira',      'paulo.silveira@email.com.br',        NULL,               '+55 48 99200-0030', '+55 48 99200-0030', 'Empreendedor',             'Site',       'client', NULL,     v_pedro, 'Florianopolis',   'SC', 'Lead inbound do blog.',                ARRAY['prospeccao','startup'],v_pedro);

  -- ============================================================================
  -- 6. LEADS (20 leads distribuidos nos estagios)
  -- ============================================================================
  INSERT INTO leads (id, title, contact_id, company_id, pipeline_id, stage_id, value, source, source_description, assigned_to, probability, temperature, notes, tags, created_by, created_at) VALUES
    (v_lead01, 'CRM para gestao de projetos - TechSol',             v_cont01, v_comp01, v_pipe_leads, v_stg_qualificacao, 85000.00,  'Site',       'Formulario de contato',            v_pedro, 40, 'warm', 'Empresa ja usa planilhas. Quer migrar para CRM.',          ARRAY['crm','migracao'],      v_maria, '2026-01-15 10:00:00-03'),
    (v_lead02, 'Sistema de vendas - Horizonte',                      v_cont03, v_comp02, v_pipe_leads, v_stg_proposta_env, 250000.00, 'Indicacao',  'Indicado pelo Joao',               v_maria, 60, 'hot',  'Grande empresa, orcamento aprovado.',                       ARRAY['vendas','enterprise'], v_joao,  '2026-01-20 14:30:00-03'),
    (v_lead03, 'Automacao comercial - Agro Norte',                   v_cont05, v_comp03, v_pipe_leads, v_stg_negociacao_l, 120000.00, 'Feira',      'Feira AgroTech 2026',              v_pedro, 70, 'hot',  'Negociando prazo de implantacao.',                           ARRAY['agro','automacao'],    v_maria, '2026-01-25 09:00:00-03'),
    (v_lead04, 'CRM para clinica - Saude Integral',                  v_cont06, v_comp04, v_pipe_leads, v_stg_novo_lead,    45000.00,  'Google Ads', 'Campanha Saude Digital',           v_pedro, 10, 'cold', 'Primeiro contato por formulario.',                           ARRAY['saude','crm'],         v_maria, '2026-02-01 08:00:00-03'),
    (v_lead05, 'Gestao de frotas - Expresso Nacional',               v_cont07, v_comp05, v_pipe_leads, v_stg_qualificacao, 180000.00, 'LinkedIn',   'Mensagem no LinkedIn',             v_maria, 35, 'warm', 'Interesse em rastreamento e gestao.',                        ARRAY['logistica','frotas'],  v_joao,  '2026-02-05 11:00:00-03'),
    (v_lead06, 'Plataforma EAD + CRM - Escola Digital',             v_cont08, v_comp06, v_pipe_leads, v_stg_novo_lead,    35000.00,  'Site',       'Landing page curso online',        v_pedro, 15, 'cold', 'Empresa pequena, avaliando custo-beneficio.',               ARRAY['educacao','ead'],      v_pedro, '2026-02-10 16:00:00-03'),
    (v_lead07, 'Automacao de vendas - Sabor do Brasil',              v_cont09, v_comp07, v_pipe_leads, v_stg_proposta_env, 95000.00,  'Indicacao',  'Indicacao da Maria Santos',        v_maria, 55, 'warm', 'Proposta enviada. Aguardando retorno.',                     ARRAY['alimentos','vendas'],  v_joao,  '2026-02-15 10:30:00-03'),
    (v_lead08, 'CRM financeiro - FinControl',                        v_cont10, v_comp08, v_pipe_leads, v_stg_negociacao_l, 150000.00, 'Google Ads', 'Campanha B2B Finance',             v_pedro, 65, 'hot',  'Interessado em modulo financeiro.',                          ARRAY['financeiro','crm'],    v_joao,  '2026-02-18 14:00:00-03'),
    (v_lead09, 'Sistema solar + CRM - Solar Nordeste',              v_cont11, v_comp09, v_pipe_leads, v_stg_convertido,   75000.00,  'Feira',      'Expo Energia 2026',                v_maria, 95, 'hot',  'Convertido em negocio. Parceria firmada.',                   ARRAY['energia','parceria'],  v_maria, '2026-01-10 09:00:00-03'),
    (v_lead10, 'E-commerce + CRM - Moda Carioca',                   v_cont12, v_comp10, v_pipe_leads, v_stg_qualificacao, 65000.00,  'Instagram',  'DM no Instagram da empresa',       v_pedro, 30, 'warm', 'Quer integrar loja virtual com CRM.',                       ARRAY['ecommerce','moda'],    v_pedro, '2026-02-20 15:00:00-03'),
    (v_lead11, 'ERP industrial - Metalurgica Progresso',             v_cont13, v_comp11, v_pipe_leads, v_stg_proposta_env, 320000.00, 'Indicacao',  'Rede de contatos industriais',     v_maria, 50, 'hot',  'Projeto grande. Proposta detalhada enviada.',                ARRAY['industria','erp'],     v_joao,  '2026-02-22 11:00:00-03'),
    (v_lead12, 'Reservas online - Aventura Brasil',                  v_cont14, v_comp12, v_pipe_leads, v_stg_descartado,   25000.00,  'Site',       'Formulario do blog',               v_pedro, 0,  'cold', 'Orcamento fora da realidade do cliente.',                    ARRAY['turismo'],             v_pedro, '2026-01-05 13:00:00-03'),
    (v_lead13, 'Gestao de distribuidores - Vida Plena',              v_cont15, v_comp13, v_pipe_leads, v_stg_negociacao_l, 200000.00, 'LinkedIn',   'InMail campanha farma',            v_maria, 60, 'warm', 'Negociando escopo de modulos.',                              ARRAY['farma','distribuicao'],v_joao,  '2026-02-25 10:00:00-03'),
    (v_lead14, 'Controle de acesso - Seguranca Total',               v_cont16, v_comp14, v_pipe_leads, v_stg_convertido,   175000.00, 'Indicacao',  'Indicacao do parceiro',            v_pedro, 90, 'hot',  'Convertido. Contrato em elaboracao.',                        ARRAY['seguranca','acesso'],  v_maria, '2026-01-12 14:00:00-03'),
    (v_lead15, 'CRM contabil - Contabil Precisao',                   v_cont17, v_comp15, v_pipe_leads, v_stg_qualificacao, 18000.00,  'Google Ads', 'Campanha contadores',              v_maria, 25, 'cold', 'Orcamento limitado. Avaliando plano basico.',               ARRAY['contabil'],            v_pedro, '2026-03-01 09:00:00-03'),
    (v_lead16, 'Consultoria em processos - Ricardo',                 v_cont18, NULL,     v_pipe_leads, v_stg_novo_lead,    12000.00,  'LinkedIn',   'Conexao no LinkedIn',              v_pedro, 5,  'cold', 'Autonomo, baixo potencial.',                                 ARRAY['consultoria'],         v_pedro, '2026-03-05 10:00:00-03'),
    (v_lead17, 'Novo negocio em expansao - Vanessa',                 v_cont19, NULL,     v_pipe_leads, v_stg_qualificacao, 40000.00,  'Instagram',  'Stories patrocinado',              v_pedro, 20, 'warm', 'Empreendedora, negocio em fase inicial.',                    ARRAY['startup','prospeccao'],v_maria, '2026-03-08 14:00:00-03'),
    (v_lead18, 'Automacao interna - TechSol (novo projeto)',         v_cont02, v_comp01, v_pipe_leads, v_stg_novo_lead,    55000.00,  'Site',       'Contato pelo chat do site',        v_pedro, 10, 'cold', 'Segundo projeto com a TechSol.',                             ARRAY['automacao','upsell'],  v_maria, '2026-03-10 11:00:00-03'),
    (v_lead19, 'Dashboard gerencial - Sabor do Brasil',              v_cont24, v_comp07, v_pipe_leads, v_stg_descartado,   30000.00,  'Indicacao',  'Indicacao interna',                v_maria, 0,  'cold', 'Cliente optou por solucao concorrente.',                     ARRAY['dashboard'],           v_joao,  '2026-01-08 16:00:00-03'),
    (v_lead20, 'Implantacao CRM completo - Paulo empreendedor',     v_cont30, NULL,     v_pipe_leads, v_stg_novo_lead,    500000.00, 'Site',       'Formulario de contato detalhado',  v_pedro, 5,  'warm', 'Startup com investimento. Alto valor potencial.',           ARRAY['startup','crm'],       v_pedro, '2026-03-15 09:30:00-03');

  -- ============================================================================
  -- 7. DEALS (25 negocios distribuidos nos estagios)
  -- ============================================================================
  INSERT INTO deals (id, title, contact_id, company_id, pipeline_id, stage_id, value, probability, temperature, expected_close_date, actual_close_date, source, deal_type, assigned_to, notes, tags, won_reason, lost_reason, lead_id, created_by, created_at) VALUES
    (v_deal01, 'CRM Enterprise - TechSol',                v_cont01, v_comp01, v_pipe_comercial, v_stg_negociacao_c,  85000.00,  70, 'hot',  '2026-04-30', NULL,          'Site',       'new_business', v_pedro, 'Negociando quantidade de licencas.',              ARRAY['crm','enterprise'],  NULL, NULL, v_lead01, v_maria, '2026-02-01 10:00:00-03'),
    (v_deal02, 'Sistema Integrado - Horizonte',            v_cont03, v_comp02, v_pipe_comercial, v_stg_fechamento,    250000.00, 85, 'hot',  '2026-04-15', NULL,          'Indicacao',  'new_business', v_maria, 'Contrato em revisao juridica.',                    ARRAY['sistema','enterprise'],NULL,NULL,v_lead02, v_joao,  '2026-02-10 14:00:00-03'),
    (v_deal03, 'Automacao Agro - Agro Norte',              v_cont05, v_comp03, v_pipe_comercial, v_stg_proposta_c,    120000.00, 55, 'warm', '2026-05-30', NULL,          'Feira',      'new_business', v_pedro, 'Proposta com 3 fases de implantacao.',             ARRAY['agro','automacao'],  NULL, NULL, v_lead03, v_maria, '2026-02-15 09:00:00-03'),
    (v_deal04, 'Parceria Solar - Solar Nordeste',          v_cont11, v_comp09, v_pipe_comercial, v_stg_ganho,         75000.00,  100,'hot',  '2026-03-01', '2026-03-01',  'Feira',      'new_business', v_maria, 'Parceria assinada. Inicio em abril.',              ARRAY['energia','parceria'],'Preco competitivo e suporte dedicado.', NULL, v_lead09, v_maria, '2026-01-20 09:00:00-03'),
    (v_deal05, 'Controle Acesso - Seguranca Total',        v_cont16, v_comp14, v_pipe_comercial, v_stg_ganho,         175000.00, 100,'hot',  '2026-02-28', '2026-02-28',  'Indicacao',  'new_business', v_pedro, 'Implantacao iniciada.',                             ARRAY['seguranca','acesso'],'Melhor solucao tecnica do mercado.', NULL, v_lead14, v_maria, '2026-01-25 14:00:00-03'),
    (v_deal06, 'CRM Financeiro - FinControl',              v_cont10, v_comp08, v_pipe_comercial, v_stg_negociacao_c,  150000.00, 65, 'hot',  '2026-05-15', NULL,          'Google Ads', 'new_business', v_pedro, 'Discussao sobre customizacoes.',                   ARRAY['financeiro','crm'],  NULL, NULL, v_lead08, v_joao,  '2026-03-01 10:00:00-03'),
    (v_deal07, 'ERP Industrial - Metal. Progresso',        v_cont13, v_comp11, v_pipe_comercial, v_stg_apresentacao,  320000.00, 40, 'warm', '2026-06-30', NULL,          'Indicacao',  'new_business', v_maria, 'Apresentacao agendada para proxima semana.',       ARRAY['industria','erp'],   NULL, NULL, v_lead11, v_joao,  '2026-03-05 11:00:00-03'),
    (v_deal08, 'Gestao Distribuidores - Vida Plena',       v_cont15, v_comp13, v_pipe_comercial, v_stg_proposta_c,    200000.00, 50, 'warm', '2026-06-15', NULL,          'LinkedIn',   'new_business', v_maria, 'Aguardando aprovacao do comite.',                   ARRAY['farma','distribuicao'],NULL,NULL,v_lead13, v_joao,  '2026-03-10 10:00:00-03'),
    (v_deal09, 'E-commerce CRM - Moda Carioca',            v_cont12, v_comp10, v_pipe_comercial, v_stg_primeiro_cont, 65000.00,  20, 'warm', '2026-07-30', NULL,          'Instagram',  'new_business', v_pedro, 'Primeiro contato realizado por telefone.',         ARRAY['ecommerce','moda'],  NULL, NULL, v_lead10, v_pedro, '2026-03-12 15:00:00-03'),
    (v_deal10, 'CRM Contabil - Contabil Precisao',         v_cont17, v_comp15, v_pipe_comercial, v_stg_primeiro_cont, 18000.00,  15, 'cold', '2026-08-30', NULL,          'Google Ads', 'new_business', v_maria, 'Avaliando opcoes no mercado.',                     ARRAY['contabil'],          NULL, NULL, v_lead15, v_pedro, '2026-03-15 09:00:00-03'),
    (v_deal11, 'Licencas adicionais - TechSol',            v_cont01, v_comp01, v_pipe_comercial, v_stg_ganho,         32000.00,  100,'hot',  '2026-02-15', '2026-02-15',  'Site',       'upsell',       v_pedro, 'Upsell de 20 licencas adicionais.',                ARRAY['crm','upsell'],      'Cliente satisfeito, expansao natural.', NULL, NULL, v_maria, '2026-02-01 10:00:00-03'),
    (v_deal12, 'Renovacao anual - Horizonte',               v_cont03, v_comp02, v_pipe_comercial, v_stg_fechamento,    180000.00, 90, 'hot',  '2026-04-01', NULL,          'Indicacao',  'renewal',      v_maria, 'Renovacao com reajuste de 8%.',                    ARRAY['renovacao'],         NULL, NULL, NULL,     v_joao,  '2026-03-01 14:00:00-03'),
    (v_deal13, 'Modulo RH - Sabor do Brasil',              v_cont09, v_comp07, v_pipe_comercial, v_stg_perdido,       95000.00,  0,  'cold', '2026-03-15', '2026-03-15',  'Indicacao',  'new_business', v_maria, 'Cliente escolheu concorrente mais barato.',        ARRAY['rh','alimentos'],    NULL, 'Concorrente ofereceu preco 30% menor.', v_lead07, v_joao, '2026-02-20 10:00:00-03'),
    (v_deal14, 'Suporte Premium - Agro Norte',             v_cont05, v_comp03, v_pipe_comercial, v_stg_ganho,         48000.00,  100,'hot',  '2026-03-10', '2026-03-10',  'Feira',      'upsell',       v_pedro, 'Upgrade para suporte 24/7.',                        ARRAY['suporte','agro'],    'Necessidade critica de suporte.', NULL, NULL, v_maria, '2026-02-25 09:00:00-03'),
    (v_deal15, 'Dashboard BI - Expresso Nacional',          v_cont07, v_comp05, v_pipe_comercial, v_stg_apresentacao,  95000.00,  35, 'warm', '2026-07-15', NULL,          'LinkedIn',   'new_business', v_maria, 'Demonstracao agendada.',                            ARRAY['bi','logistica'],    NULL, NULL, v_lead05, v_joao,  '2026-03-08 11:00:00-03'),
    (v_deal16, 'CRM Educacional - Escola Digital',          v_cont08, v_comp06, v_pipe_comercial, v_stg_perdido,       35000.00,  0,  'cold', '2026-03-20', '2026-03-20',  'Site',       'new_business', v_pedro, 'Sem orcamento no momento.',                         ARRAY['educacao'],          NULL, 'Sem verba disponivel para 2026.', v_lead06, v_pedro, '2026-02-28 16:00:00-03'),
    (v_deal17, 'Integracao API - FinControl',               v_cont25, v_comp08, v_pipe_comercial, v_stg_proposta_c,    45000.00,  45, 'warm', '2026-06-30', NULL,          'Google Ads', 'upsell',       v_pedro, 'Integracao com sistema bancario.',                   ARRAY['api','financeiro'],  NULL, NULL, NULL,     v_joao,  '2026-03-15 14:00:00-03'),
    (v_deal18, 'Projeto Completo - Metalurgica Progresso',  v_cont27, v_comp11, v_pipe_comercial, v_stg_primeiro_cont, 450000.00, 15, 'warm', '2026-09-30', NULL,          'Indicacao',  'new_business', v_maria, 'Projeto ambicioso. Fase de descoberta.',            ARRAY['industria','completo'],NULL,NULL,NULL,     v_joao,  '2026-03-18 11:00:00-03'),
    (v_deal19, 'Modulo Agendamento - Saude Integral',       v_cont06, v_comp04, v_pipe_comercial, v_stg_negociacao_c,  55000.00,  60, 'hot',  '2026-05-30', NULL,          'Google Ads', 'new_business', v_pedro, 'Modulo de agendamento com confirmacao via WhatsApp.',ARRAY['saude','agendamento'],NULL,NULL,v_lead04, v_maria, '2026-03-01 08:00:00-03'),
    (v_deal20, 'CRM Startup - Paulo Silveira',              v_cont30, NULL,     v_pipe_comercial, v_stg_primeiro_cont, 500000.00, 10, 'warm', '2026-10-30', NULL,          'Site',       'new_business', v_pedro, 'Startup com investimento. Projeto grande.',         ARRAY['startup','crm'],     NULL, NULL, v_lead20, v_pedro, '2026-03-20 09:30:00-03'),
    (v_deal21, 'Consultoria Processos - Vida Plena',        v_cont28, v_comp13, v_pipe_comercial, v_stg_apresentacao,  80000.00,  30, 'warm', '2026-07-30', NULL,          'LinkedIn',   'new_business', v_maria, 'Mapeamento de processos de distribuicao.',          ARRAY['consultoria','farma'],NULL,NULL,NULL,      v_joao,  '2026-03-10 10:00:00-03'),
    (v_deal22, 'Treinamento Equipe - Seguranca Total',      v_cont29, v_comp14, v_pipe_comercial, v_stg_ganho,         28000.00,  100,'hot',  '2026-03-25', '2026-03-25',  'Indicacao',  'upsell',       v_pedro, 'Treinamento para 50 colaboradores.',                ARRAY['treinamento','seguranca'],'Pacote incluso na implantacao.',NULL,NULL, v_maria, '2026-03-15 14:00:00-03'),
    (v_deal23, 'Renovacao Suporte - TechSol',               v_cont20, v_comp01, v_pipe_comercial, v_stg_proposta_c,    24000.00,  75, 'hot',  '2026-04-30', NULL,          'Site',       'renewal',      v_pedro, 'Renovacao com desconto de fidelidade.',             ARRAY['renovacao','suporte'],NULL,NULL,NULL,      v_maria, '2026-03-20 10:00:00-03'),
    (v_deal24, 'Perdido - Turismo Aventura',                v_cont14, v_comp12, v_pipe_comercial, v_stg_perdido,       25000.00,  0,  'cold', '2026-02-28', '2026-02-28',  'Site',       'new_business', v_pedro, 'Empresa muito pequena para o projeto.',             ARRAY['turismo'],           NULL, 'Orcamento insuficiente para MVP.',      v_lead12, v_pedro, '2026-01-15 13:00:00-03'),
    (v_deal25, 'Modulo Vendas - Moda Carioca',              v_cont26, v_comp10, v_pipe_comercial, v_stg_apresentacao,  72000.00,  25, 'warm', '2026-08-15', NULL,          'Instagram',  'new_business', v_pedro, 'Interesse em modulo de vendas omnichannel.',        ARRAY['moda','omnichannel'],NULL, NULL, NULL,     v_pedro, '2026-03-22 15:00:00-03');

  -- ============================================================================
  -- 8. PRODUCTS (10 produtos com precos em BRL)
  -- ============================================================================
  INSERT INTO products (id, name, description, sku, price, currency, tax_rate, unit, category, is_active) VALUES
    (v_prod01, 'Licenca Software CRM',           'Licenca mensal por usuario do sistema CRM completo.',           'CRM-LIC-001', 199.00,   'BRL', 0,    'licenca/mes', 'Software',     TRUE),
    (v_prod02, 'Consultoria em Processos',        'Consultoria especializada em mapeamento e otimizacao de processos comerciais.', 'CONS-PROC-001', 350.00, 'BRL', 5.00, 'hora',        'Servicos',    TRUE),
    (v_prod03, 'Treinamento Equipe Comercial',    'Treinamento presencial ou online para equipe de vendas.',       'TREIN-COM-001', 4500.00, 'BRL', 0,    'turma',       'Treinamento', TRUE),
    (v_prod04, 'Suporte Tecnico Mensal',          'Plano de suporte tecnico com atendimento em horario comercial.','SUP-MEN-001',   890.00,  'BRL', 0,    'mes',         'Suporte',     TRUE),
    (v_prod05, 'Suporte Premium 24/7',            'Plano de suporte com atendimento 24 horas, 7 dias por semana.', 'SUP-PRE-001',  2500.00,  'BRL', 0,    'mes',         'Suporte',     TRUE),
    (v_prod06, 'Modulo de Automacao',             'Modulo adicional para automacao de workflows e processos.',      'MOD-AUTO-001', 89.00,   'BRL', 0,    'licenca/mes', 'Software',    TRUE),
    (v_prod07, 'Integracao via API',              'Servico de integracao do CRM com sistemas externos via API.',    'INT-API-001',  8000.00,  'BRL', 5.00, 'projeto',     'Servicos',    TRUE),
    (v_prod08, 'Modulo de BI e Dashboards',       'Modulo avancado de Business Intelligence com dashboards customizaveis.','MOD-BI-001', 149.00, 'BRL', 0,  'licenca/mes', 'Software',    TRUE),
    (v_prod09, 'Implantacao e Configuracao',      'Servico de implantacao inicial com configuracao personalizada.', 'IMPL-CFG-001', 15000.00, 'BRL', 5.00, 'projeto',     'Servicos',    TRUE),
    (v_prod10, 'Armazenamento Extra (50GB)',      'Pacote adicional de 50GB de armazenamento em nuvem.',            'ARM-EXT-001',  59.00,   'BRL', 0,    'mes',         'Infraestrutura', TRUE);

  -- ============================================================================
  -- 9. DEAL_PRODUCTS (vinculando produtos aos negocios)
  -- ============================================================================
  INSERT INTO deal_products (deal_id, product_id, product_name, quantity, unit_price, discount_type, discount_value, tax_rate, total, sort_order) VALUES
    -- Deal 01: TechSol CRM Enterprise
    (v_deal01, v_prod01, 'Licenca Software CRM',        50,  199.00,  'percentage', 10,  0,    8955.00,   1),
    (v_deal01, v_prod09, 'Implantacao e Configuracao',   1,   15000.00,'percentage', 0,   5.00, 15750.00,  2),
    (v_deal01, v_prod04, 'Suporte Tecnico Mensal',       12,  890.00,  'percentage', 0,   0,    10680.00,  3),
    -- Deal 02: Horizonte Sistema Integrado
    (v_deal02, v_prod01, 'Licenca Software CRM',        100, 199.00,  'percentage', 15,  0,    16915.00,  1),
    (v_deal02, v_prod09, 'Implantacao e Configuracao',   1,   15000.00,'percentage', 0,   5.00, 15750.00,  2),
    (v_deal02, v_prod05, 'Suporte Premium 24/7',         12,  2500.00, 'percentage', 0,   0,    30000.00,  3),
    (v_deal02, v_prod07, 'Integracao via API',           3,   8000.00, 'percentage', 5,   5.00, 23940.00,  4),
    -- Deal 04: Parceria Solar
    (v_deal04, v_prod01, 'Licenca Software CRM',        25,  199.00,  'percentage', 20,  0,    3980.00,   1),
    (v_deal04, v_prod03, 'Treinamento Equipe Comercial', 2,   4500.00, 'percentage', 0,   0,    9000.00,   2),
    -- Deal 05: Seguranca Total
    (v_deal05, v_prod01, 'Licenca Software CRM',        80,  199.00,  'percentage', 12,  0,    14009.60,  1),
    (v_deal05, v_prod09, 'Implantacao e Configuracao',   1,   15000.00,'percentage', 0,   5.00, 15750.00,  2),
    (v_deal05, v_prod06, 'Modulo de Automacao',          80,  89.00,   'percentage', 10,  0,    6408.00,   3),
    -- Deal 11: Upsell TechSol
    (v_deal11, v_prod01, 'Licenca Software CRM',        20,  199.00,  'percentage', 5,   0,    3781.00,   1),
    -- Deal 14: Suporte Premium Agro Norte
    (v_deal14, v_prod05, 'Suporte Premium 24/7',         12,  2500.00, 'percentage', 0,   0,    30000.00,  1),
    (v_deal14, v_prod03, 'Treinamento Equipe Comercial', 3,   4500.00, 'percentage', 10,  0,    12150.00,  2),
    -- Deal 22: Treinamento Seguranca Total
    (v_deal22, v_prod03, 'Treinamento Equipe Comercial', 5,   4500.00, 'percentage', 10,  0,    20250.00,  1),
    (v_deal22, v_prod02, 'Consultoria em Processos',     16,  350.00,  'percentage', 0,   5.00, 5880.00,   2);

  -- ============================================================================
  -- 10. TICKETS (10 tickets de suporte)
  -- ============================================================================
  INSERT INTO tickets (id, title, description, contact_id, company_id, deal_id, pipeline_id, stage_id, priority, category, assigned_to, source, sla_deadline, tags, created_by, created_at) VALUES
    (v_tkt01, 'Erro ao gerar relatorio de vendas',           'Ao clicar em "Gerar Relatorio", o sistema exibe erro 500. Ja tentei em diferentes navegadores.', v_cont01, v_comp01, v_deal01, v_pipe_suporte, v_stg_em_atendimento, 'high',     'Bug',         v_pedro, 'Email',    '2026-03-30 18:00:00-03', ARRAY['bug','relatorio'],         v_maria, '2026-03-25 09:00:00-03'),
    (v_tkt02, 'Duvida sobre importacao de contatos',         'Como importar contatos de um arquivo CSV? Preciso migrar 500 registros.',                          v_cont03, v_comp02, NULL,     v_pipe_suporte, v_stg_resolvido,      'normal',   'Duvida',      v_pedro, 'Chat',     '2026-03-28 18:00:00-03', ARRAY['importacao','contatos'],   v_maria, '2026-03-20 14:00:00-03'),
    (v_tkt03, 'Solicitacao de novo campo customizado',       'Precisamos de um campo "Numero do Contrato" no cadastro de negocios.',                             v_cont05, v_comp03, v_deal03, v_pipe_suporte, v_stg_aguard_cliente, 'normal',   'Solicitacao', v_maria, 'Email',    '2026-04-02 18:00:00-03', ARRAY['customizacao','campo'],    v_joao,  '2026-03-22 10:00:00-03'),
    (v_tkt04, 'Reclamacao sobre lentidao do sistema',        'O sistema esta muito lento nas ultimas 2 semanas, principalmente no modulo de negocios.',           v_cont07, v_comp05, NULL,     v_pipe_suporte, v_stg_em_atendimento, 'critical', 'Reclamacao',  v_pedro, 'Telefone', '2026-03-29 12:00:00-03', ARRAY['performance','lentidao'],  v_joao,  '2026-03-26 08:00:00-03'),
    (v_tkt05, 'Duvida sobre integracao com WhatsApp',        'E possivel enviar mensagens automaticas pelo WhatsApp quando um lead e criado?',                    v_cont10, v_comp08, v_deal06, v_pipe_suporte, v_stg_novo_ticket,    'normal',   'Duvida',      v_pedro, 'Chat',     '2026-04-01 18:00:00-03', ARRAY['integracao','whatsapp'],   v_pedro, '2026-03-27 15:00:00-03'),
    (v_tkt06, 'Bug no envio de email automatico',            'Os emails automaticos de follow-up nao estao sendo enviados desde segunda-feira.',                   v_cont13, v_comp11, v_deal07, v_pipe_suporte, v_stg_em_atendimento, 'high',     'Bug',         v_maria, 'Email',    '2026-03-31 18:00:00-03', ARRAY['bug','email','automacao'], v_joao,  '2026-03-27 11:00:00-03'),
    (v_tkt07, 'Solicitacao de treinamento adicional',        'Novos funcionarios precisam de treinamento no modulo de leads e negocios.',                          v_cont16, v_comp14, v_deal05, v_pipe_suporte, v_stg_resolvido,      'low',      'Solicitacao', v_pedro, 'Email',    '2026-04-05 18:00:00-03', ARRAY['treinamento'],            v_maria, '2026-03-18 09:00:00-03'),
    (v_tkt08, 'Reclamacao sobre permissoes de acesso',       'Vendedores estao conseguindo ver negocios de outros vendedores. Isso nao deveria acontecer.',        v_cont15, v_comp13, v_deal08, v_pipe_suporte, v_stg_novo_ticket,    'high',     'Reclamacao',  v_maria, 'Telefone', '2026-04-01 18:00:00-03', ARRAY['permissao','seguranca'],  v_joao,  '2026-03-28 10:00:00-03'),
    (v_tkt09, 'Duvida sobre relatorios customizados',        'Como criar um relatorio que mostre vendas por regiao e por vendedor?',                               v_cont09, v_comp07, NULL,     v_pipe_suporte, v_stg_fechado_sup,    'normal',   'Duvida',      v_maria, 'Chat',     '2026-03-25 18:00:00-03', ARRAY['relatorio','customizado'], v_joao,  '2026-03-15 16:00:00-03'),
    (v_tkt10, 'Bug ao editar contato com caracteres especiais','Ao salvar contato com nome "Jose" (com acento), o sistema exibe erro de validacao.',              v_cont17, v_comp15, NULL,     v_pipe_suporte, v_stg_novo_ticket,    'normal',   'Bug',         v_pedro, 'Email',    '2026-04-03 18:00:00-03', ARRAY['bug','caracteres'],       v_pedro, '2026-03-28 14:00:00-03');

  -- ============================================================================
  -- 11. ACTIVITIES (50 atividades variadas)
  -- ============================================================================
  INSERT INTO activities (entity_type, entity_id, type, title, description, scheduled_at, completed_at, is_done, priority, duration_minutes, result, assigned_to, created_by, created_at) VALUES
    -- Ligacoes
    ('lead',    v_lead01, 'call',    'Ligacao de qualificacao',             'Ligacao para entender necessidades da TechSol. Ana Carolina atendeu e demonstrou interesse.', '2026-01-20 10:00:00-03', '2026-01-20 10:25:00-03', TRUE,  'normal', 25, 'Interesse confirmado. Agendar demonstracao.', v_pedro, v_pedro, '2026-01-20 10:00:00-03'),
    ('lead',    v_lead02, 'call',    'Ligacao com Fernanda - Horizonte',    'Primeira ligacao para alinhar expectativas do projeto integrado.',                             '2026-01-22 14:00:00-03', '2026-01-22 14:40:00-03', TRUE,  'high',   40, 'Orcamento aprovado pela diretoria.',           v_maria, v_maria, '2026-01-22 14:00:00-03'),
    ('lead',    v_lead03, 'call',    'Follow-up Agro Norte',                'Retorno sobre proposta enviada. Juliana pediu prazo para analise.',                             '2026-02-01 11:00:00-03', '2026-02-01 11:15:00-03', TRUE,  'normal', 15, 'Retorno previsto para proxima semana.',        v_pedro, v_pedro, '2026-02-01 11:00:00-03'),
    ('deal',    v_deal01, 'call',    'Negociacao de licencas - TechSol',    'Discussao sobre quantidade de licencas e desconto por volume.',                                 '2026-02-15 10:00:00-03', '2026-02-15 10:35:00-03', TRUE,  'high',   35, 'Proposta ajustada para 50 licencas.',          v_pedro, v_pedro, '2026-02-15 10:00:00-03'),
    ('deal',    v_deal02, 'call',    'Alinhamento juridico - Horizonte',    'Ligacao com juridico da Horizonte para alinhar termos do contrato.',                             '2026-03-10 15:00:00-03', '2026-03-10 15:50:00-03', TRUE,  'high',   50, 'Contrato em revisao final.',                  v_maria, v_maria, '2026-03-10 15:00:00-03'),
    ('deal',    v_deal06, 'call',    'Demo modulo financeiro - FinControl', 'Demonstracao do modulo financeiro para Marcos e Priscila.',                                      '2026-03-15 14:00:00-03', '2026-03-15 15:00:00-03', TRUE,  'normal', 60, 'Feedback positivo. Ajustar proposta.',         v_pedro, v_pedro, '2026-03-15 14:00:00-03'),
    ('contact', v_cont30, 'call',    'Primeiro contato - Paulo Silveira',   'Ligacao de qualificacao com Paulo, empreendedor de Florianopolis.',                              '2026-03-16 10:00:00-03', '2026-03-16 10:20:00-03', TRUE,  'normal', 20, 'Startup com investimento. Alto potencial.',   v_pedro, v_pedro, '2026-03-16 10:00:00-03'),
    ('deal',    v_deal19, 'call',    'Follow-up agendamento - Saude',       'Ligacao para alinhar cronograma do modulo de agendamento.',                                      '2026-03-20 09:00:00-03', '2026-03-20 09:30:00-03', TRUE,  'normal', 30, 'Inicio previsto para maio.',                  v_pedro, v_pedro, '2026-03-20 09:00:00-03'),

    -- Emails
    ('lead',    v_lead01, 'email',   'Envio de material institucional',     'Enviado apresentacao da empresa e casos de sucesso do setor de tecnologia.',                     '2026-01-18 09:00:00-03', '2026-01-18 09:05:00-03', TRUE,  'normal', 5,  'Email entregue com sucesso.',                 v_pedro, v_pedro, '2026-01-18 09:00:00-03'),
    ('lead',    v_lead02, 'email',   'Proposta comercial - Horizonte',      'Enviada proposta detalhada com escopo, cronograma e valores.',                                    '2026-01-28 10:00:00-03', '2026-01-28 10:10:00-03', TRUE,  'high',   10, 'Proposta aberta pelo destinatario.',           v_maria, v_maria, '2026-01-28 10:00:00-03'),
    ('lead',    v_lead07, 'email',   'Proposta Sabor do Brasil',            'Enviada proposta para automacao de vendas com 3 modulos.',                                        '2026-02-20 11:00:00-03', '2026-02-20 11:05:00-03', TRUE,  'normal', 5,  'Aguardando retorno.',                         v_maria, v_maria, '2026-02-20 11:00:00-03'),
    ('deal',    v_deal02, 'email',   'Contrato para assinatura - Horizonte','Enviado contrato final para assinatura digital.',                                                  '2026-03-20 10:00:00-03', '2026-03-20 10:05:00-03', TRUE,  'high',   5,  'Contrato enviado via DocuSign.',               v_maria, v_maria, '2026-03-20 10:00:00-03'),
    ('deal',    v_deal03, 'email',   'Cronograma de implantacao - Agro',    'Enviado cronograma detalhado das 3 fases de implantacao.',                                        '2026-03-01 14:00:00-03', '2026-03-01 14:10:00-03', TRUE,  'normal', 10, 'Cliente confirmou recebimento.',               v_pedro, v_pedro, '2026-03-01 14:00:00-03'),
    ('deal',    v_deal08, 'email',   'Proposta distribuidores - Vida Plena','Proposta com escopo de modulo de gestao de distribuidores.',                                       '2026-03-15 11:00:00-03', '2026-03-15 11:05:00-03', TRUE,  'normal', 5,  'Encaminhada ao comite de compras.',            v_maria, v_maria, '2026-03-15 11:00:00-03'),
    ('ticket',  v_tkt01,  'email',   'Resposta sobre erro no relatorio',    'Informando que a equipe de desenvolvimento esta investigando o erro 500.',                        '2026-03-25 11:00:00-03', '2026-03-25 11:05:00-03', TRUE,  'high',   5,  'Cliente ciente. Prazo: 48h.',                 v_pedro, v_pedro, '2026-03-25 11:00:00-03'),
    ('ticket',  v_tkt02,  'email',   'Instrucoes de importacao CSV',        'Enviado guia passo a passo para importacao de contatos via CSV.',                                 '2026-03-21 10:00:00-03', '2026-03-21 10:10:00-03', TRUE,  'normal', 10, 'Ticket resolvido. Cliente agradeceu.',         v_pedro, v_pedro, '2026-03-21 10:00:00-03'),

    -- Reunioes
    ('lead',    v_lead02, 'meeting', 'Reuniao de apresentacao - Horizonte', 'Reuniao presencial com diretoria da Horizonte para apresentacao do sistema.',                      '2026-01-25 14:00:00-03', '2026-01-25 16:00:00-03', TRUE,  'high',   120,'Apresentacao bem recebida. Pedir proposta.', v_maria, v_joao,  '2026-01-25 14:00:00-03'),
    ('deal',    v_deal01, 'meeting', 'Demo tecnica - TechSol',             'Demonstracao tecnica do CRM para equipe de TI da TechSol.',                                       '2026-02-10 14:00:00-03', '2026-02-10 15:30:00-03', TRUE,  'high',   90, 'Equipe tecnica aprovou a solucao.',            v_pedro, v_maria, '2026-02-10 14:00:00-03'),
    ('deal',    v_deal07, 'meeting', 'Descoberta - Metal. Progresso',      'Reuniao de descoberta para entender processos industriais da metalurgica.',                         '2026-03-12 10:00:00-03', '2026-03-12 12:00:00-03', TRUE,  'normal', 120,'Mapeados 8 processos criticos.',               v_maria, v_joao,  '2026-03-12 10:00:00-03'),
    ('deal',    v_deal15, 'meeting', 'Demo BI - Expresso Nacional',        'Demonstracao do modulo de BI com dashboards de logistica.',                                        '2026-03-18 14:00:00-03', NULL,                      FALSE, 'normal', 60, NULL,                                          v_maria, v_maria, '2026-03-15 10:00:00-03'),
    ('deal',    v_deal21, 'meeting', 'Kickoff consultoria - Vida Plena',   'Reuniao de inicio do projeto de consultoria em processos.',                                        '2026-04-01 10:00:00-03', NULL,                      FALSE, 'high',   120,NULL,                                          v_maria, v_joao,  '2026-03-20 10:00:00-03'),
    ('deal',    v_deal25, 'meeting', 'Apresentacao modulo vendas - Moda',  'Apresentacao do modulo de vendas omnichannel para Moda Carioca.',                                  '2026-04-05 14:00:00-03', NULL,                      FALSE, 'normal', 60, NULL,                                          v_pedro, v_pedro, '2026-03-25 15:00:00-03'),

    -- Notas
    ('lead',    v_lead04, 'note',    'Nota sobre lead Saude Integral',     'Lead veio pelo Google Ads, campanha "Saude Digital". Perfil interessante mas sem urgencia.',        NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-02-01 08:30:00-03'),
    ('lead',    v_lead12, 'note',    'Lead descartado - Aventura Brasil',  'Orcamento de R$25k esta muito acima da capacidade financeira da empresa. Descartado.',             NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-01-10 14:00:00-03'),
    ('lead',    v_lead19, 'note',    'Lead perdido - Dashboard Sabor',     'Cliente optou por Power BI direto. Nao viu valor na integracao com CRM.',                           NULL, NULL, TRUE, 'normal', NULL, NULL, v_maria, v_maria, '2026-01-15 17:00:00-03'),
    ('deal',    v_deal04, 'note',    'Parceria fechada com sucesso',       'Parceria com Solar Nordeste assinada. Inicio das atividades conjuntas em abril.',                   NULL, NULL, TRUE, 'high',   NULL, NULL, v_maria, v_maria, '2026-03-01 10:00:00-03'),
    ('deal',    v_deal13, 'note',    'Negocio perdido - analise',          'Perdemos para concorrente que ofereceu 30% menos. Revisar pricing para setor de alimentos.',        NULL, NULL, TRUE, 'high',   NULL, NULL, v_maria, v_joao,  '2026-03-15 16:00:00-03'),
    ('deal',    v_deal16, 'note',    'Sem verba - Escola Digital',         'Cliente informou que nao ha verba para 2026. Recontatar em 2027.',                                 NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-03-20 17:00:00-03'),
    ('contact', v_cont01, 'note',    'Perfil decisor - Ana Carolina',      'Ana Carolina e decisora tecnica na TechSol. Tem autonomia para aprovar projetos ate R$100k.',       NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-01-16 11:00:00-03'),
    ('contact', v_cont11, 'note',    'Parceira estrategica - Isabela',     'Isabela pode indicar clientes do setor de energia. Manter relacionamento ativo.',                   NULL, NULL, TRUE, 'normal', NULL, NULL, v_maria, v_maria, '2026-01-22 09:00:00-03'),
    ('company', v_comp02, 'note',    'Horizonte - conta estrategica',      'Horizonte e conta estrategica. Faturamento de R$18M/ano. Potencial para projeto de R$250k+.',       NULL, NULL, TRUE, 'high',   NULL, NULL, v_joao,  v_joao,  '2026-01-20 15:00:00-03'),
    ('company', v_comp14, 'note',    'Seguranca Total - expansao',         'Empresa com 350 funcionarios, em expansao para novas cidades. Potencial de upsell.',                NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_maria, '2026-02-01 10:00:00-03'),
    ('ticket',  v_tkt04,  'note',    'Investigacao de lentidao',           'Equipe de infra identificou pico de uso no horario das 9h-11h. Investigando query lenta.',          NULL, NULL, TRUE, 'critical',NULL,NULL, v_pedro, v_pedro, '2026-03-26 10:00:00-03'),

    -- Mudancas de estagio (stage_change)
    ('lead',    v_lead01, 'stage_change', 'Movido para Qualificacao',      'Lead movido de "Novo Lead" para "Qualificacao" apos primeira ligacao.',                              NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-01-20 10:30:00-03'),
    ('lead',    v_lead02, 'stage_change', 'Movido para Proposta Enviada',  'Proposta comercial enviada. Lead avancou para "Proposta Enviada".',                                  NULL, NULL, TRUE, 'normal', NULL, NULL, v_maria, v_maria, '2026-01-28 10:15:00-03'),
    ('lead',    v_lead09, 'stage_change', 'Lead convertido',               'Lead convertido em negocio. Parceria com Solar Nordeste firmada.',                                   NULL, NULL, TRUE, 'high',   NULL, NULL, v_maria, v_maria, '2026-01-20 09:30:00-03'),
    ('lead',    v_lead12, 'stage_change', 'Lead descartado',               'Lead descartado. Orcamento incompativel com capacidade do cliente.',                                 NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-01-10 14:05:00-03'),
    ('lead',    v_lead14, 'stage_change', 'Lead convertido',               'Lead Seguranca Total convertido em negocio de R$175k.',                                              NULL, NULL, TRUE, 'high',   NULL, NULL, v_pedro, v_pedro, '2026-01-25 14:30:00-03'),
    ('deal',    v_deal01, 'stage_change', 'Avancou para Negociacao',       'Deal TechSol avancou de "Proposta" para "Negociacao".',                                              NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-02-15 11:00:00-03'),
    ('deal',    v_deal04, 'stage_change', 'Deal ganho - Solar Nordeste',   'Negocio ganho! Parceria assinada com Solar Nordeste.',                                               NULL, NULL, TRUE, 'high',   NULL, NULL, v_maria, v_maria, '2026-03-01 10:30:00-03'),
    ('deal',    v_deal05, 'stage_change', 'Deal ganho - Seguranca Total',  'Negocio ganho! Contrato de R$175k com Seguranca Total.',                                             NULL, NULL, TRUE, 'high',   NULL, NULL, v_pedro, v_pedro, '2026-02-28 15:00:00-03'),
    ('deal',    v_deal13, 'stage_change', 'Deal perdido - Sabor do Brasil','Negocio perdido. Concorrente ofereceu preco mais baixo.',                                            NULL, NULL, TRUE, 'high',   NULL, NULL, v_maria, v_maria, '2026-03-15 15:00:00-03'),
    ('deal',    v_deal16, 'stage_change', 'Deal perdido - Escola Digital', 'Negocio perdido. Cliente sem verba para 2026.',                                                      NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-03-20 16:30:00-03'),
    ('ticket',  v_tkt01,  'stage_change', 'Ticket em atendimento',        'Ticket movido para "Em Atendimento". Equipe de dev investigando.',                                   NULL, NULL, TRUE, 'high',   NULL, NULL, v_pedro, v_pedro, '2026-03-25 10:00:00-03'),
    ('ticket',  v_tkt02,  'stage_change', 'Ticket resolvido',             'Ticket resolvido. Guia de importacao enviado ao cliente.',                                            NULL, NULL, TRUE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-03-21 10:15:00-03'),
    ('ticket',  v_tkt09,  'stage_change', 'Ticket fechado',               'Ticket fechado apos confirmacao do cliente.',                                                         NULL, NULL, TRUE, 'normal', NULL, NULL, v_maria, v_maria, '2026-03-18 16:00:00-03'),

    -- Tasks (como atividades)
    ('deal',    v_deal02, 'task',    'Preparar apresentacao final',        'Preparar slides com ROI e business case para reuniao de fechamento.',                                 '2026-03-25 09:00:00-03', NULL, FALSE, 'high',   NULL, NULL, v_maria, v_joao,  '2026-03-20 15:00:00-03'),
    ('deal',    v_deal20, 'task',    'Pesquisar startup Paulo',            'Levantar informacoes sobre a startup do Paulo Silveira antes da reuniao.',                             '2026-03-28 09:00:00-03', NULL, FALSE, 'normal', NULL, NULL, v_pedro, v_pedro, '2026-03-21 10:00:00-03');

  -- ============================================================================
  -- 12. TASKS (15 tarefas com diferentes prioridades e status)
  -- ============================================================================
  INSERT INTO tasks (id, title, description, status, priority, task_type, assigned_to, created_by, due_date, start_date, completed_at, estimated_hours, actual_hours, entity_type, entity_id, tags, checklist) VALUES
    (v_task01, 'Preparar proposta comercial - Horizonte',     'Elaborar proposta detalhada com escopo, cronograma, valores e condicoes de pagamento.',                   'completed',      'high',     'proposta',     v_maria, v_joao,  '2026-02-05 18:00:00-03', '2026-01-28 09:00:00-03', '2026-02-04 16:00:00-03', 8,  7.5,  'deal',    v_deal02, ARRAY['proposta','horizonte'],  '[{"text":"Definir escopo","done":true},{"text":"Calcular valores","done":true},{"text":"Revisar com diretoria","done":true}]'::jsonb),
    (v_task02, 'Agendar demo tecnica - TechSol',              'Agendar e preparar demonstracao tecnica do CRM para equipe de TI da TechSol.',                           'completed',      'normal',   'demo',         v_pedro, v_maria, '2026-02-08 18:00:00-03', '2026-02-03 09:00:00-03', '2026-02-07 17:00:00-03', 4,  3.5,  'deal',    v_deal01, ARRAY['demo','techsol'],       '[{"text":"Preparar ambiente","done":true},{"text":"Testar integracao","done":true},{"text":"Confirmar participantes","done":true}]'::jsonb),
    (v_task03, 'Enviar contrato - Solar Nordeste',            'Enviar contrato de parceria para assinatura do diretor da Solar Nordeste.',                               'completed',      'high',     'contrato',     v_maria, v_maria, '2026-02-28 18:00:00-03', '2026-02-25 09:00:00-03', '2026-02-27 15:00:00-03', 2,  1.5,  'deal',    v_deal04, ARRAY['contrato','parceria'],   '[{"text":"Redigir contrato","done":true},{"text":"Revisao juridica","done":true},{"text":"Enviar para assinatura","done":true}]'::jsonb),
    (v_task04, 'Follow-up leads frios',                        'Entrar em contato com leads frios da ultima quinzena para verificar interesse.',                          'in_progress',    'normal',   'follow-up',    v_pedro, v_maria, '2026-03-30 18:00:00-03', '2026-03-25 09:00:00-03', NULL,                      6,  NULL, 'lead',    v_lead04, ARRAY['follow-up','leads'],     '[{"text":"Saude Integral","done":true},{"text":"Escola Digital","done":false},{"text":"Ricardo Monteiro","done":false},{"text":"TechSol novo projeto","done":false}]'::jsonb),
    (v_task05, 'Revisar contrato Horizonte (renovacao)',       'Revisar termos de renovacao e aplicar reajuste de 8% conforme acordo.',                                   'in_progress',    'high',     'contrato',     v_maria, v_joao,  '2026-03-31 18:00:00-03', '2026-03-25 09:00:00-03', NULL,                      4,  NULL, 'deal',    v_deal12, ARRAY['contrato','renovacao'],  '[{"text":"Verificar clausulas","done":true},{"text":"Aplicar reajuste","done":true},{"text":"Enviar para aprovacao","done":false}]'::jsonb),
    (v_task06, 'Preparar material de treinamento',             'Criar material de treinamento para novos funcionarios da Seguranca Total.',                               'pending',        'normal',   'treinamento',  v_pedro, v_maria, '2026-04-10 18:00:00-03', NULL,                      NULL,                      12, NULL, 'deal',    v_deal22, ARRAY['treinamento','material'],'[{"text":"Modulo leads","done":false},{"text":"Modulo negocios","done":false},{"text":"Modulo relatorios","done":false}]'::jsonb),
    (v_task07, 'Investigar lentidao relatada',                 'Analisar queries lentas no modulo de negocios reportadas pelo ticket #4.',                                'in_progress',    'critical', 'bugfix',       v_pedro, v_joao,  '2026-03-29 18:00:00-03', '2026-03-26 09:00:00-03', NULL,                      8,  NULL, 'ticket',  v_tkt04,  ARRAY['performance','urgente'],'[{"text":"Identificar queries","done":true},{"text":"Analisar plano de execucao","done":true},{"text":"Otimizar indices","done":false},{"text":"Testar em staging","done":false}]'::jsonb),
    (v_task08, 'Mapear processos - Metalurgica Progresso',     'Documentar os 8 processos criticos identificados na reuniao de descoberta.',                              'pending',        'high',     'consultoria',  v_maria, v_joao,  '2026-04-15 18:00:00-03', NULL,                      NULL,                      16, NULL, 'deal',    v_deal07, ARRAY['processos','mapeamento'],'[{"text":"Processo de compras","done":false},{"text":"Processo de producao","done":false},{"text":"Processo de qualidade","done":false},{"text":"Processo de expedicao","done":false}]'::jsonb),
    (v_task09, 'Atualizar CRM com novos leads da feira',       'Cadastrar leads captados na Expo Negocios 2026 no CRM.',                                                 'completed',      'normal',   'cadastro',     v_pedro, v_pedro, '2026-03-20 18:00:00-03', '2026-03-18 09:00:00-03', '2026-03-19 17:00:00-03', 3,  2.5,  NULL,      NULL,     ARRAY['feira','cadastro'],     '[{"text":"Importar planilha","done":true},{"text":"Validar duplicados","done":true},{"text":"Atribuir responsaveis","done":true}]'::jsonb),
    (v_task10, 'Criar automacao de boas-vindas',               'Configurar email automatico de boas-vindas para novos leads.',                                            'waiting_review', 'normal',   'automacao',    v_pedro, v_maria, '2026-03-28 18:00:00-03', '2026-03-22 09:00:00-03', NULL,                      3,  2.0,  NULL,      NULL,     ARRAY['automacao','email'],    '[{"text":"Criar template","done":true},{"text":"Configurar trigger","done":true},{"text":"Testar envio","done":true},{"text":"Aprovacao Maria","done":false}]'::jsonb),
    (v_task11, 'Relatorio mensal de vendas - Marco',           'Gerar relatorio de vendas do mes de marco para reuniao da diretoria.',                                    'pending',        'high',     'relatorio',    v_maria, v_joao,  '2026-04-02 18:00:00-03', NULL,                      NULL,                      4,  NULL, NULL,      NULL,     ARRAY['relatorio','mensal'],   '[{"text":"Coletar dados","done":false},{"text":"Gerar graficos","done":false},{"text":"Escrever analise","done":false},{"text":"Revisar com Joao","done":false}]'::jsonb),
    (v_task12, 'Configurar campo CNPJ para contatos',          'Implementar campo customizado de CNPJ com validacao no cadastro de contatos.',                            'deferred',       'low',      'desenvolvimento',v_pedro,v_joao,  '2026-04-30 18:00:00-03', NULL,                      NULL,                      6,  NULL, NULL,      NULL,     ARRAY['customizacao','campo'], '[{"text":"Criar campo no schema","done":false},{"text":"Adicionar validacao","done":false},{"text":"Testar","done":false}]'::jsonb),
    (v_task13, 'Pesquisa de satisfacao - Q1 2026',             'Enviar pesquisa de satisfacao para clientes ativos do primeiro trimestre.',                                'pending',        'normal',   'pesquisa',     v_maria, v_joao,  '2026-04-05 18:00:00-03', NULL,                      NULL,                      5,  NULL, NULL,      NULL,     ARRAY['satisfacao','pesquisa'],'[{"text":"Criar questionario","done":false},{"text":"Selecionar clientes","done":false},{"text":"Enviar emails","done":false},{"text":"Compilar resultados","done":false}]'::jsonb),
    (v_task14, 'Preparar apresentacao BI - Expresso Nacional', 'Criar dashboards de exemplo com dados de logistica para demonstracao.',                                    'in_progress',    'normal',   'demo',         v_maria, v_maria, '2026-03-28 18:00:00-03', '2026-03-20 09:00:00-03', NULL,                      5,  NULL, 'deal',    v_deal15, ARRAY['bi','demo'],            '[{"text":"Dashboard de entregas","done":true},{"text":"Dashboard de custos","done":false},{"text":"Dashboard de KPIs","done":false}]'::jsonb),
    (v_task15, 'Resolver bug caracteres especiais',            'Corrigir validacao que rejeita acentos em nomes de contatos.',                                              'pending',        'normal',   'bugfix',       v_pedro, v_pedro, '2026-04-05 18:00:00-03', NULL,                      NULL,                      3,  NULL, 'ticket',  v_tkt10,  ARRAY['bug','validacao'],      '[{"text":"Identificar regex","done":false},{"text":"Corrigir validacao","done":false},{"text":"Testar com acentos","done":false}]'::jsonb);

  -- ============================================================================
  -- 13. CUSTOM FIELD DEFINITIONS (5 campos customizados)
  -- ============================================================================
  INSERT INTO custom_field_definitions (id, entity_type, field_name, field_label, field_type, options, is_required, show_in_kanban, show_in_filter, show_in_list, default_value, sort_order, tooltip) VALUES
    (v_cfd01, 'lead',    'origem_lead',          'Origem do Lead',         'select',  '["Google Ads","Facebook Ads","LinkedIn","Instagram","Indicacao","Feira","Site","Telefone","Email","Outro"]'::jsonb, FALSE, TRUE,  TRUE, TRUE, NULL,        1, 'Canal de origem do lead'),
    (v_cfd02, 'contact', 'cnpj_contato',         'CNPJ',                   'text',    NULL,                                                                                                               FALSE, FALSE, TRUE, TRUE, NULL,        2, 'CNPJ do contato (se pessoa juridica)'),
    (v_cfd03, 'deal',    'valor_mensal',          'Valor Mensal Recorrente','number',  NULL,                                                                                                               FALSE, TRUE,  TRUE, TRUE, '0',         3, 'Valor mensal recorrente do negocio (MRR)'),
    (v_cfd04, 'contact', 'decisor',               'Decisor',                'boolean', NULL,                                                                                                               FALSE, TRUE,  TRUE, TRUE, 'false',     4, 'Indica se o contato e um decisor de compra'),
    (v_cfd05, 'deal',    'data_proximo_contato',  'Data Proximo Contato',   'date',    NULL,                                                                                                               FALSE, FALSE, TRUE, TRUE, NULL,        5, 'Data prevista para o proximo contato com o cliente');

  -- Inserir alguns valores para os campos customizados
  INSERT INTO custom_field_values (field_id, entity_type, entity_id, value) VALUES
    (v_cfd01, 'lead', v_lead01, '"Site"'::jsonb),
    (v_cfd01, 'lead', v_lead02, '"Indicacao"'::jsonb),
    (v_cfd01, 'lead', v_lead03, '"Feira"'::jsonb),
    (v_cfd01, 'lead', v_lead04, '"Google Ads"'::jsonb),
    (v_cfd01, 'lead', v_lead05, '"LinkedIn"'::jsonb),
    (v_cfd02, 'contact', v_cont01, '"12.345.678/0001-01"'::jsonb),
    (v_cfd02, 'contact', v_cont03, '"23.456.789/0001-02"'::jsonb),
    (v_cfd04, 'contact', v_cont01, 'true'::jsonb),
    (v_cfd04, 'contact', v_cont03, 'false'::jsonb),
    (v_cfd04, 'contact', v_cont05, 'true'::jsonb),
    (v_cfd04, 'contact', v_cont07, 'true'::jsonb),
    (v_cfd04, 'contact', v_cont10, 'true'::jsonb),
    (v_cfd04, 'contact', v_cont13, 'true'::jsonb),
    (v_cfd03, 'deal', v_deal01, '8955'::jsonb),
    (v_cfd03, 'deal', v_deal02, '16915'::jsonb),
    (v_cfd03, 'deal', v_deal04, '3980'::jsonb),
    (v_cfd03, 'deal', v_deal06, '12500'::jsonb),
    (v_cfd05, 'deal', v_deal01, '"2026-04-05"'::jsonb),
    (v_cfd05, 'deal', v_deal02, '"2026-04-01"'::jsonb),
    (v_cfd05, 'deal', v_deal06, '"2026-04-10"'::jsonb),
    (v_cfd05, 'deal', v_deal09, '"2026-04-15"'::jsonb);

  -- ============================================================================
  -- 14. AUTOMATION RULES (3 regras de automacao)
  -- ============================================================================
  INSERT INTO automation_rules (id, pipeline_id, stage_id, trigger_type, trigger_config, action_type, action_config, conditions, delay_minutes, is_active, sort_order, name, description, created_by) VALUES
    (v_auto01, v_pipe_comercial, v_stg_ganho,       'stage_enter', '{"stage_name":"Ganho"}'::jsonb,                   'create_task',   '{"task_title":"Iniciar onboarding do cliente","task_description":"Cliente fechou negocio. Iniciar processo de onboarding e implantacao.","task_priority":"high","assign_to":"deal_owner"}'::jsonb,  '[]'::jsonb, 0, TRUE, 1, 'Criar tarefa de onboarding ao ganhar negocio',  'Quando um negocio entra no estagio "Ganho", cria automaticamente uma tarefa de onboarding para o responsavel.',         v_joao),
    (v_auto02, v_pipe_leads,     v_stg_novo_lead,   'entity_created','{"entity_type":"lead"}'::jsonb,                 'assign_user',   '{"assign_strategy":"round_robin","user_ids":["' || v_pedro::text || '","' || v_maria::text || '"]}'::jsonb,              '[]'::jsonb, 0, TRUE, 2, 'Atribuir lead novo automaticamente',            'Quando um novo lead e criado, atribui automaticamente a um vendedor por rodizio.',                                      v_joao),
    (v_auto03, v_pipe_suporte,   v_stg_resolvido,   'stage_enter', '{"stage_name":"Resolvido"}'::jsonb,               'notification',  '{"title":"Ticket resolvido","message":"O ticket foi marcado como resolvido. Verifique a satisfacao do cliente.","notify":"ticket_creator"}'::jsonb, '[]'::jsonb, 5, TRUE, 3, 'Notificar quando ticket for resolvido',         'Quando um ticket entra no estagio "Resolvido", envia notificacao para o criador do ticket apos 5 minutos.',             v_joao);

  -- ============================================================================
  -- 15. NOTIFICATIONS (notificacoes para os usuarios)
  -- ============================================================================
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read, read_at, created_at) VALUES
    -- Notificacoes para Joao (admin)
    (v_joao, 'Negocio ganho - Solar Nordeste',              'Parabens! O negocio "Parceria Solar - Solar Nordeste" foi ganho por Maria Santos. Valor: R$ 75.000,00.',             'success', 'deal',   v_deal04, TRUE,  '2026-03-01 10:35:00-03', '2026-03-01 10:30:00-03'),
    (v_joao, 'Negocio ganho - Seguranca Total',             'Parabens! O negocio "Controle Acesso - Seguranca Total" foi ganho por Pedro Oliveira. Valor: R$ 175.000,00.',       'success', 'deal',   v_deal05, TRUE,  '2026-02-28 15:10:00-03', '2026-02-28 15:00:00-03'),
    (v_joao, 'Negocio perdido - Sabor do Brasil',           'O negocio "Modulo RH - Sabor do Brasil" foi perdido. Motivo: Concorrente com preco 30% menor.',                    'warning', 'deal',   v_deal13, TRUE,  '2026-03-15 16:00:00-03', '2026-03-15 15:30:00-03'),
    (v_joao, 'Ticket critico aberto',                       'Novo ticket critico: "Reclamacao sobre lentidao do sistema" aberto pela Expresso Nacional.',                        'error',   'ticket', v_tkt04,  FALSE, NULL,                      '2026-03-26 08:05:00-03'),
    (v_joao, 'Relatorio mensal pendente',                   'O relatorio mensal de vendas de marco esta pendente. Prazo: 02/04/2026.',                                           'task',    NULL,     NULL,     FALSE, NULL,                      '2026-03-28 09:00:00-03'),

    -- Notificacoes para Maria (manager)
    (v_maria, 'Novo lead atribuido',                        'O lead "CRM Enterprise - TechSol" foi atribuido a Pedro Oliveira.',                                                'info',    'lead',   v_lead01, TRUE,  '2026-01-15 10:10:00-03', '2026-01-15 10:05:00-03'),
    (v_maria, 'Proposta aceita - Horizonte',                'A proposta do negocio "Sistema Integrado - Horizonte" foi aceita. Valor: R$ 250.000,00.',                           'success', 'deal',   v_deal02, TRUE,  '2026-03-10 16:00:00-03', '2026-03-10 15:55:00-03'),
    (v_maria, 'Tarefa atrasada',                            'A tarefa "Preparar apresentacao BI - Expresso Nacional" esta atrasada. Prazo original: 28/03/2026.',                'warning', 'deal',   v_deal15, FALSE, NULL,                      '2026-03-28 09:00:00-03'),
    (v_maria, 'Ticket resolvido - Importacao CSV',          'O ticket "Duvida sobre importacao de contatos" foi resolvido por Pedro Oliveira.',                                  'success', 'ticket', v_tkt02,  TRUE,  '2026-03-21 10:20:00-03', '2026-03-21 10:15:00-03'),
    (v_maria, 'Nova reuniao agendada',                      'Reuniao "Kickoff consultoria - Vida Plena" agendada para 01/04/2026 as 10h.',                                      'info',    'deal',   v_deal21, FALSE, NULL,                      '2026-03-20 10:05:00-03'),

    -- Notificacoes para Pedro (agent)
    (v_pedro, 'Lead quente - FinControl',                   'O lead "CRM financeiro - FinControl" esta quente e na fase de negociacao. Valor: R$ 150.000,00.',                  'deal',    'lead',   v_lead08, TRUE,  '2026-02-18 14:10:00-03', '2026-02-18 14:05:00-03'),
    (v_pedro, 'Tarefa atribuida - Material treinamento',    'Nova tarefa atribuida: "Preparar material de treinamento" para Seguranca Total. Prazo: 10/04/2026.',               'task',    'deal',   v_deal22, FALSE, NULL,                      '2026-03-25 09:00:00-03'),
    (v_pedro, 'Ticket atribuido - Erro relatorio',          'O ticket "Erro ao gerar relatorio de vendas" foi atribuido a voce. Prioridade: Alta.',                              'error',   'ticket', v_tkt01,  TRUE,  '2026-03-25 09:10:00-03', '2026-03-25 09:05:00-03'),
    (v_pedro, 'Deal ganho - Licencas TechSol',              'Negocio "Licencas adicionais - TechSol" ganho! Upsell de R$ 32.000,00.',                                            'success', 'deal',   v_deal11, TRUE,  '2026-02-15 10:05:00-03', '2026-02-15 10:00:00-03'),
    (v_pedro, 'Lembrete: follow-up leads frios',            'Voce tem leads frios aguardando follow-up. Verifique sua lista de leads pendentes.',                                'info',    NULL,     NULL,     FALSE, NULL,                      '2026-03-27 09:00:00-03');

  -- ============================================================================
  -- Atualizar leads convertidos com referencia ao deal
  -- ============================================================================
  UPDATE leads SET converted_to_deal_id = v_deal04, converted_at = '2026-01-20 09:30:00-03' WHERE id = v_lead09;
  UPDATE leads SET converted_to_deal_id = v_deal05, converted_at = '2026-01-25 14:30:00-03' WHERE id = v_lead14;

  RAISE NOTICE 'Seed data inserido com sucesso!';
  RAISE NOTICE 'Profiles: 3, Pipelines: 4, Stages: 23, Companies: 15';
  RAISE NOTICE 'Contacts: 30, Leads: 20, Deals: 25, Products: 10';
  RAISE NOTICE 'Deal Products: 17, Tickets: 10, Activities: 50';
  RAISE NOTICE 'Tasks: 15, Custom Fields: 5, Automations: 3, Notifications: 15';

END;
$$;
