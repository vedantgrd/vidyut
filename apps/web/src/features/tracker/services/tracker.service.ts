import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface ApplicationRecord {
  id: string
  userId: string
  scholarshipId: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  notes: string | null
  completionPercent: number
  submittedAt: string | null
  lastActivityAt: string
  createdAt: string
  updatedAt: string
  scholarship: {
    id: string
    name: string
    provider: string
    shortDescription: string | null
    amount: number
    amountDescription: string | null
    deadline: string
    scholarshipCategory: string
    tags: string[]
    applicationUrl: string | null
  }
}

export const trackerService = {
  async fetchApplications(): Promise<ApplicationRecord[]> {
    return ApiClient.get<ApplicationRecord[]>(ENDPOINTS.TRACKER.APPLICATIONS)
  },

  async createApplication(scholarshipId: string, notes?: string): Promise<ApplicationRecord> {
    return ApiClient.post<ApplicationRecord>(ENDPOINTS.TRACKER.CREATE, {
      scholarshipId,
      notes,
    })
  },

  async updateStatus(id: string, status: ApplicationRecord['status'], notes?: string): Promise<ApplicationRecord> {
    return ApiClient.patch<ApplicationRecord>(
      ENDPOINTS.TRACKER.UPDATE_STATUS(id),
      { status, notes },
    )
  },

  async deleteApplication(id: string): Promise<void> {
    await ApiClient.delete(ENDPOINTS.TRACKER.DELETE(id))
  },
}
