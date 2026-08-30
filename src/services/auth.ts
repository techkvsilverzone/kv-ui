import { api } from '../lib/api';
import type { User } from '../context/AuthContext';

export interface AuthResponse {
  user: User;
  token: string;
}

/** Item 1: which channel the first-time mobile-verification code went out on — set by the
 * server based on whether WhatsApp OTP is enabled (WHATSAPP_OTP_ENABLED), else email fallback. */
export interface PhoneVerificationDispatch {
  message: string;
  channel: 'whatsapp' | 'email';
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  signup: async (
    name: string,
    email: string,
    password: string,
    phone: string,
    stallEvent?: boolean,
  ): Promise<AuthResponse & { promoCoupon?: string; phoneVerification?: PhoneVerificationDispatch }> => {
    return api.post<AuthResponse & { promoCoupon?: string; phoneVerification?: PhoneVerificationDispatch }>('/auth/signup', {
      name,
      email,
      password,
      phone,
      stallEvent,
    });
  },

  /** Item 1: (re)request a mobile-verification code for the logged-in user's own phone. */
  requestPhoneVerification: async (): Promise<PhoneVerificationDispatch> => {
    return api.post<PhoneVerificationDispatch>('/users/me/phone/request-otp', {});
  },

  verifyPhoneOtp: async (code: string): Promise<{ user: User }> => {
    return api.post<{ user: User }>('/users/me/phone/verify-otp', { code });
  },

  logout: async (): Promise<void> => {
    // Server clears the httpOnly auth cookie; JS cannot do this itself.
    return api.post<void>('/auth/logout', {});
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

  requestOtp: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/otp/request', { email });
  },

  verifyOtp: async (email: string, code: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/otp/verify', { email, code });
  },
};
