'use client';

import React, { createContext, useState, useEffect, useRef, ReactNode, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  apiRequest,
  setAccessToken,
  registerPublicTokenStateListener,
} from '@/lib/api-client';

export interface PublicUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  verified: boolean;
  createdAt: string;
}

interface MeResponse {
  success: boolean;
  user: PublicUser;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: PublicUser;
}

interface PublicAuthContextType {
  user: PublicUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const PublicAuthContext = createContext<PublicAuthContextType | undefined>(undefined);

export function PublicAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Reference to prevent duplicate concurrent profile fetches
  const activeMePromise = useRef<Promise<MeResponse> | null>(null);

  const fetchMe = async (): Promise<MeResponse> => {
    if (activeMePromise.current) {
      return activeMePromise.current;
    }
    activeMePromise.current = apiRequest<MeResponse>('/public-auth/me');
    try {
      const result = await activeMePromise.current;
      return result;
    } finally {
      activeMePromise.current = null;
    }
  };

  // 1. Synchronize local states with API token callbacks
  useEffect(() => {
    registerPublicTokenStateListener((token) => {
      setAccessTokenState(token);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        // Redirect to login if on protected portal route
        if (pathname && pathname.startsWith('/portal')) {
          router.push('/login');
        }
      }
    });
  }, [pathname, router]);

  // 2. Restore active session on initial load
  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('public_token') : null;
    if (savedToken) {
      setAccessToken(savedToken, 'public');
      (async () => {
        try {
          const data = await fetchMe();
          setUser(data.user);
        } catch {
          setAccessToken(null, 'public');
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<LoginResponse>('/public-auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      });

      setAccessToken(data.accessToken, 'public');
      setUser(data.user);
      router.push('/portal');
    } catch (error) {
      setAccessToken(null, 'public');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/public-auth/logout', { method: 'POST' });
    } catch {
      // Clean up local state anyway
    } finally {
      setAccessToken(null, 'public');
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshSession = async () => {
    try {
      const data = await fetchMe();
      setUser(data.user);
    } catch {
      setAccessToken(null, 'public');
    }
  };

  return (
    <PublicAuthContext.Provider
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
    </PublicAuthContext.Provider>
  );
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (context === undefined) {
    throw new Error('usePublicAuth must be used within a PublicAuthProvider');
  }
  return context;
}
