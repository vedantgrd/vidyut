import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface DashboardData {
  greeting: string
  stats: { label: string; value: number; icon: string }[]
  recentActivity: {
    id: string
    type: string
    title: string
    description: string
    date: string
    status: string
  }[]
  recommendedScholarships: {
    id: string
    name: string
    provider: string
    amount: number
    amountDescription: string | null
    deadline: string
    scholarshipCategory: string
    tags: string[]
    isFeatured: boolean
    matchScore: number
  }[]
  upcomingDeadlines: {
    id: string
    name: string
    provider: string
    deadline: string
    amount: number
  }[]
  notifications: any[]
  profileCompletion: number
}

export const dashboardService = {
  async fetchDashboardData(): Promise<DashboardData> {
    return ApiClient.get<DashboardData>(ENDPOINTS.DASHBOARD.HOME)
  },
}
