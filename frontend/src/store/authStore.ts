import { create } from 'zustand';
import { authService } from '@/services/authService';
import type { SafeUser } from '@/types';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  loadingState: LoadingState;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loadingState: 'idle',
  error: null,

  login: async (credentials) => {
    set({ loadingState: 'loading', error: null });

    try {
      const { user, tokens } = await authService.login(credentials);

      // Store auth token
      localStorage.setItem('authToken', tokens.accessToken);

      set({
        user,
        isAuthenticated: true,
        loadingState: 'success',
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        loadingState: 'error',
        error: message,
      });
      throw error;
    }
  },

  register: async (credentials) => {
    // Validate passwords match on frontend
    if (credentials.password !== credentials.confirmPassword) {
      const message = 'Passwords do not match';
      set({
        loadingState: 'error',
        error: message,
      });
      throw new Error(message);
    }

    set({ loadingState: 'loading', error: null });

    try {
      const { user, tokens } = await authService.register({
        email: credentials.email,
        password: credentials.password,
      });

      // Store auth token
      localStorage.setItem('authToken', tokens.accessToken);

      set({
        user,
        isAuthenticated: true,
        loadingState: 'success',
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({
        loadingState: 'error',
        error: message,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      set({
        user: null,
        isAuthenticated: false,
        loadingState: 'idle',
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('authToken');
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

