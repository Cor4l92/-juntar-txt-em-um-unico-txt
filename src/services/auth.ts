// =============================================================================
// Servico de Autenticacao - Login, registro, perfil e avatar
// =============================================================================

import { supabase } from './supabase';
import type { Profile } from '@/types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Login com email e senha
// -----------------------------------------------------------------------------
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Erro ao fazer login: ${error.message}`);
  }

  return data;
}

// -----------------------------------------------------------------------------
// Registro de novo usuario + criacao automatica do perfil
// -----------------------------------------------------------------------------
export async function signUp(email: string, password: string, fullName: string) {
  // 1. Cria o usuario no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(`Erro ao criar conta: ${error.message}`);
  }

  // 2. Cria o perfil na tabela profiles (caso nao exista trigger automatico)
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: 'agent', // Papel padrao para novos usuarios
      is_active: true,
    });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError.message);
    }
  }

  return data;
}

// -----------------------------------------------------------------------------
// Logout
// -----------------------------------------------------------------------------
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Erro ao sair: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// Enviar email de redefinicao de senha
// -----------------------------------------------------------------------------
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(`Erro ao enviar email de redefinicao: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// Obter sessao atual
// -----------------------------------------------------------------------------
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Erro ao obter sessao: ${error.message}`);
  }

  return data.session;
}

// -----------------------------------------------------------------------------
// Escutar mudancas no estado de autenticacao (login/logout/token refresh)
// -----------------------------------------------------------------------------
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  // Retorna o objeto de subscription para que o chamador possa cancelar
  return data.subscription;
}

// -----------------------------------------------------------------------------
// Atualizar perfil do usuario na tabela profiles
// -----------------------------------------------------------------------------
export async function updateProfile(
  profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
) {
  // Obtem o usuario logado para pegar o ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Usuario nao autenticado');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  }

  return data as Profile;
}

// -----------------------------------------------------------------------------
// Buscar perfil por ID
// -----------------------------------------------------------------------------
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar perfil: ${error.message}`);
  }

  return data as Profile;
}

// -----------------------------------------------------------------------------
// Upload de avatar para o Supabase Storage
// -----------------------------------------------------------------------------
export async function uploadAvatar(userId: string, file: File) {
  // Nome do arquivo baseado no ID do usuario (sobrescreve o anterior)
  const fileExt = file.name.split('.').pop();
  const filePath = `avatars/${userId}.${fileExt}`;

  // 1. Faz upload do arquivo
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true, // Sobrescreve se ja existir
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar avatar: ${uploadError.message}`);
  }

  // 2. Gera a URL publica do avatar
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Atualiza o perfil com a nova URL do avatar
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Erro ao atualizar URL do avatar: ${updateError.message}`);
  }

  return urlData.publicUrl;
}
