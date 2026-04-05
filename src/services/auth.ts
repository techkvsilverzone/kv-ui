import { api } from '../lib/api';
import type { User } from '../context/AuthContext';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  signup: async (name: string, email: string, password: string, phone?: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/signup', { name, email, password, phone });
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.put<User>('/users/me', data);
  },

  changePassword: async (userId: string, newPassword: string): Promise<{ message: string }> => {
    return api.put<{ message: string }>(`/users/${userId}/password`, { newPassword });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },
};
