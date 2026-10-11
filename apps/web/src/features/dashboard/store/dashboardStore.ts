import { create } from 'zustand'
import { dashboardService, type DashboardData } from '../services/dashboard.service'

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  fetchDashboard: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await dashboardService.fetchDashboardData()
      set({ data, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? 'Failed to load dashboard' })
    }
  },
}))
