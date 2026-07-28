'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth-storage';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = authStorage.getUser();
    if (stored && authStorage.getAccessToken()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const redirectByRole = useCallback(
    (role: User['role']) => {
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }
      if (role === 'TEACHER') {
        router.push('/teacher/dashboard');
        return;
      }
      router.push('/student/dashboard');
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authService.login(email, password);
      authStorage.setAuth(data.user, data.tokens);
      setUser(data.user);
      redirectByRole(data.user.role);
    },
    [redirectByRole],
  );

  const register = useCallback(
    async (formData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
    }) => {
      const data = await authService.register(formData);
      authStorage.setAuth(data.user, data.tokens);
      setUser(data.user);
      redirectByRole(data.user.role);
    },
    [redirectByRole],
  );

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // ignore logout errors
      }
    }
    authStorage.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
