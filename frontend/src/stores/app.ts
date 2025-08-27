import { create } from 'zustand';
import type { NotificationState, LoadingState, Theme } from '@/types';

interface AppState {
  // UI State
  theme: Theme;
  sidebarOpen: boolean;
  
  // Notifications
  notifications: NotificationState[];
  
  // Loading states
  globalLoading: LoadingState;
  
  // API Key storage
  apiKey: string | null;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<NotificationState, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: LoadingState) => void;
  
  // API Key actions
  setApiKey: (key: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  globalLoading: { isLoading: false },
  apiKey: null,

  // Theme actions
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  },

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  // Notification actions
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationState = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Loading actions
  setGlobalLoading: (loading: LoadingState) => {
    set({ globalLoading: loading });
  },

  // API Key actions
  setApiKey: (key: string | null) => {
    set({ apiKey: key });
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('xai_api_key', key);
      } else {
        localStorage.removeItem('xai_api_key');
      }
    }
  },
}));

// Initialize theme on client side
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as Theme;
  const savedApiKey = localStorage.getItem('xai_api_key');
  
  if (savedTheme) {
    useAppStore.getState().setTheme(savedTheme);
  }
  
  if (savedApiKey) {
    useAppStore.getState().setApiKey(savedApiKey);
  }
}