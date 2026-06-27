import { create } from 'zustand';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardData } from '../types';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  fetchData: (force?: boolean) => Promise<void>;
  markActivityAsRead: (id: string) => void;
}

// 5 minutes cache TTL
const CACHE_TTL = 1000 * 60 * 5;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchData: async (force = false) => {
    const { data, lastUpdated, isLoading } = get();
    
    // Prevent concurrent fetches
    if (isLoading) return;
    
    // Serve from cache if fresh enough, unless forced
    if (!force && data && lastUpdated && Date.now() - lastUpdated < CACHE_TTL) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const newData = await dashboardService.fetchDashboardData();
      set({ 
        data: newData, 
        isLoading: false, 
        lastUpdated: Date.now() 
      });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to load dashboard data.' 
      });
    }
  },

  markActivityAsRead: (id: string) => {
    set((state) => {
      if (!state.data) return state;
      
      const newActivity = state.data.recentActivity.map(item => 
        item.id === id ? { ...item, isRead: true } : item
      );
      
      return {
        data: {
          ...state.data,
          recentActivity: newActivity
        }
      };
    });
  }
}));
