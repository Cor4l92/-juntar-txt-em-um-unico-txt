import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import * as authService from '@/services/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated, setUser, setProfile, setLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const session = await authService.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          const userProfile = await authService.getProfile(session.user.id);
          if (mounted) setProfile(userProfile);
        }
      } catch {
        // Sem sessão ativa
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        try {
          const userProfile = await authService.getProfile(session.user.id);
          setProfile(userProfile);
        } catch {
          // Perfil pode não existir ainda
        }
      } else if (event === 'SIGNED_OUT') {
        storeLogout();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, storeLogout]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      toast.success('Login realizado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast.error(message);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      await authService.signUp(email, password, fullName);
      toast.success('Conta criada! Verifique seu email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      toast.error(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      storeLogout();
      toast.success('Logout realizado.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sair';
      toast.error(message);
    }
  }, [storeLogout]);

  const updateProfile = useCallback(async (data: Parameters<typeof authService.updateProfile>[0]) => {
    try {
      const updated = await authService.updateProfile(data);
      setProfile(updated);
      toast.success('Perfil atualizado!');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      toast.error(message);
      throw err;
    }
  }, [setProfile]);

  return { user, profile, isLoading, isAuthenticated, signIn, signUp, signOut, updateProfile };
}
