import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pawhome_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pawhome_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('pawhome_token');
      if (!currentToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('pawhome_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Session verification failed, logging out');
      localStorage.removeItem('pawhome_token');
      localStorage.removeItem('pawhome_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password, rememberMe });
      if (data.success && data.token) {
        localStorage.setItem('pawhome_token', data.token);
        localStorage.setItem('pawhome_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await authService.register(formData);
      if (data.success && data.token) {
        localStorage.setItem('pawhome_token', data.token);
        localStorage.setItem('pawhome_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pawhome_token');
    localStorage.removeItem('pawhome_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('pawhome_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
