import { create } from 'zustand';
import { User } from '@/types';
import { apiClient } from '@/shared/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('wen_ai_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('wen_ai_access_token'),
  isLoading: false,

  login: (userData, accessToken, refreshToken) => {
    localStorage.setItem('wen_ai_access_token', accessToken);
    localStorage.setItem('wen_ai_refresh_token', refreshToken);
    localStorage.setItem('wen_ai_user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('wen_ai_access_token');
    localStorage.removeItem('wen_ai_refresh_token');
    localStorage.removeItem('wen_ai_user');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updatedData) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedData };
      localStorage.setItem('wen_ai_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('wen_ai_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      set({ isLoading: true });
      const res = await apiClient.get('/auth/me');
      localStorage.setItem('wen_ai_user', JSON.stringify(res.data));
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('wen_ai_access_token');
      localStorage.removeItem('wen_ai_refresh_token');
      localStorage.removeItem('wen_ai_user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
