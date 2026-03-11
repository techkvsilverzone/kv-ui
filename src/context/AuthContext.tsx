import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import { UNAUTHORIZED_EVENT } from '@/lib/api';

export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (user: User): User => ({
  ...user,
  id: user.id || user._id,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kv-silver-user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const silentLogout = () => {
      setUser(null);
      localStorage.removeItem('kv-silver-token');
      localStorage.removeItem('kv-silver-user');
    };

    const initAuth = async () => {
      const token = localStorage.getItem('kv-silver-token');
      if (token) {
        try {
          const userData = await authService.getMe();
          const normalizedUser = normalizeUser(userData);
          setUser(normalizedUser);
          localStorage.setItem('kv-silver-user', JSON.stringify(normalizedUser));
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          silentLogout();
        }
      }
      setIsLoading(false);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, silentLogout);

    initAuth();

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, silentLogout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, token } = await authService.login(email, password);
      const normalizedUser = normalizeUser(user);
      setUser(normalizedUser);
      localStorage.setItem('kv-silver-token', token);
      localStorage.setItem('kv-silver-user', JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { user, token } = await authService.signup(name, email, password);
      const normalizedUser = normalizeUser(user);
      setUser(normalizedUser);
      localStorage.setItem('kv-silver-token', token);
      localStorage.setItem('kv-silver-user', JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error('Signup failed', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kv-silver-token');
    localStorage.removeItem('kv-silver-user');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      const normalizedUser = normalizeUser(updatedUser);
      setUser(normalizedUser);
      localStorage.setItem('kv-silver-user', JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error('Update profile failed', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
