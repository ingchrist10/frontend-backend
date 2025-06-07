#!/bin/bash

mkdir -p frontend-codes/context

cat > frontend-codes/context/AuthContext.tsx << 'EOL'
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { axiosAuth, isAuthenticated, logout } from '@/lib/authUtils';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const isAuth = isAuthenticated();
        setAuthStatus(isAuth);
        
        if (isAuth) {
          try {
            // Fetch user profile data
            const response = await axiosAuth.get('/auth/protected/');
            setUser(response.data.user);
          } catch (err) {
            console.error('Error fetching user data:', err);
            // If fetching user fails, assume token is invalid
            logout();
            setAuthStatus(false);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setAuthStatus(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setAuthStatus(false);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout: handleLogout,
    isAuthenticated: authStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
EOL

echo "Auth context created successfully." 