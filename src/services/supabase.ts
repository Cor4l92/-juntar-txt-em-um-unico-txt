// =============================================================================
// Cliente Supabase - Instancia unica para toda a aplicacao
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// Variaveis de ambiente do Vite (prefixo VITE_ obrigatorio)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validacao: garante que as variaveis estao definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variaveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorias. ' +
    'Copie o arquivo .env.example para .env e preencha com as credenciais do seu projeto Supabase.'
  );
}

// Cliente Supabase com configuracoes padrao de autenticacao
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persiste a sessao no localStorage automaticamente
    persistSession: true,
    // Detecta mudancas de sessao em outras abas
    detectSessionInUrl: true,
  },
});

export default supabase;
