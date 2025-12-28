import { api } from './api';

import type { SafeUser, AuthTokens, AuthResponse, ApiResponse } from '@/types';

export const authService = {
  // Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data.data;
  },

  // Register
  register: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/logout');
  },

  // Get current user
  getCurrentUser: async (): Promise<SafeUser> => {
    const response = await api.get<ApiResponse<SafeUser>>('/auth/me');
    return response.data.data;
  },
};
