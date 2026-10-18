import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User, LoginPayload, RegisterPayload } from '../services/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user from GET /api/auth/me on startup
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await api.getMe();
        if (isMounted) {
          const loadedUser = response.user || response.data?.user || null;
          setUser(loadedUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginPayload) => {
    const response = await api.login(credentials);
    const loggedUser = response.user || response.data?.user || null;
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await api.register(payload);
    const registeredUser = response.user || response.data?.user || null;
    setUser(registeredUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

