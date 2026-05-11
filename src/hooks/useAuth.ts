import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import type { AuthState, LoginCredentials } from '@/types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = authService.getAuthState();
    setAuthState(state);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const state = await authService.login(credentials);
      setAuthState(state);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState(null);
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const state = await authService.register(email, password, username);
      setAuthState(state);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated: authState?.isAuthenticated || false,
    user: authState?.user || null,
    isLoading,
    error,
    login,
    logout,
    register,
  };
}
