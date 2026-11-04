import { create } from 'zustand';
import { authApi } from '../services/api';

interface User {
  id: number;
  username: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: authApi.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(username, password);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ 
        error: err.response?.data?.error || 'Login failed', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  register: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(username, password);
      set({ isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ 
        error: err.response?.data?.error || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const isAuth = authApi.isAuthenticated();
    set({ isAuthenticated: isAuth });
    if (!isAuth) {
      set({ user: null });
    }
  },

  fetchUser: async () => {
    try {
      console.log('Fetching user profile...');
      const user = await authApi.me();
      console.log('User profile fetched:', user);
      set({ user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  }
}));
