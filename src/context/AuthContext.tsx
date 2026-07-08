'use client';

import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  apiRequest,
  setAccessToken,
  registerTokenStateListener,
} from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'COORDINATOR' | 'STAFF';
  block: string | null;
}

interface MeResponse {
  success: boolean;
  user: User;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Reference to deduplicate concurrent in-flight /auth/me promises
  const activeMePromise = useRef<Promise<MeResponse> | null>(null);

  const fetchMe = async (): Promise<MeResponse> => {
    if (activeMePromise.current) {
      return activeMePromise.current;
    }
    activeMePromise.current = apiRequest<MeResponse>('/auth/me');
    try {
      const result = await activeMePromise.current;
      return result;
    } finally {
      activeMePromise.current = null;
    }
  };

  // 1. Sync React State with API Client token updates
  useEffect(() => {
    registerTokenStateListener((token) => {
      setAccessTokenState(token);
      if (!token) {
        // If token cleared (session expired or logged out)
        setUser(null);
        setIsLoading(false);
        if (pathname && pathname.startsWith('/staff-portal') && pathname !== '/staff-portal/login') {
          router.push('/staff-portal/login');
        }
      }
    });
  }, [pathname, router]);

  // 2. Try to restore session on initial load
  useEffect(() => {
    (async () => {
      try {
        // Querying /auth/me automatically triggers token refresh in api-client if required
        const data = await fetchMe();
        setUser(data.user);
      } catch {
        // Not authenticated, clean up
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      router.push('/staff-portal/dashboard');
    } catch (err) {
      setAccessToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Clean local session regardless of network response
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
      router.push('/staff-portal/login');
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMe();
      setUser(data.user);
    } catch {
      setAccessToken(null);
      throw new Error('Session refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
