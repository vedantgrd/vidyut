import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface ScholarshipDetail {
  id: string
  slug: string
  name: string
  provider: string
  shortDescription: string | null
  description: string
  amount: number
  amountDescription: string | null
  eligibilityText: string
  categories: string[]
  educationLevels: string[]
  states: string[]
  scholarshipCategory: string
  tags: string[]
  isFeatured: boolean
  isNational: boolean
  deadline: string
  officialWebsite: string | null
  applicationUrl: string | null
  status: string
  requiredDocuments: string[]
  genderEligibility: string | null
  maxIncome: number | null
  minCGPA: number | null
  matchScore: number
  isSaved: boolean
}

export interface FilterCriteria {
  searchQuery?: string
  minAmount?: number
  maxAmount?: number
  category?: string
  educationLevel?: string
  state?: string
  tags?: string[]
  sortBy?: 'matchScore' | 'deadline' | 'amount' | 'newest'
  page?: number
  limit?: number
}

export const discoveryService = {
  async searchScholarships(filters: FilterCriteria): Promise<{ scholarships: ScholarshipDetail[]; pagination: any }> {
    const params: Record<string, any> = {}
    if (filters.searchQuery) params.search = filters.searchQuery
    if (filters.minAmount) params.minAmount = filters.minAmount
    if (filters.maxAmount) params.maxAmount = filters.maxAmount
    if (filters.category) params.category = filters.category
    if (filters.educationLevel) params.educationLevel = filters.educationLevel
    if (filters.state) params.state = filters.state
    if (filters.sortBy) params.sortBy = filters.sortBy
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',')

    return ApiClient.get<{ scholarships: ScholarshipDetail[]; pagination: any }>(ENDPOINTS.DISCOVERY.SEARCH, { params })
  },

  async getScholarshipDetails(id: string): Promise<ScholarshipDetail | null> {
    const res = await ApiClient.get<{ scholarship: ScholarshipDetail }>(ENDPOINTS.DISCOVERY.DETAILS(id))
    return res.scholarship
  },

  async toggleSave(id: string): Promise<boolean> {
    const res = await ApiClient.post<{ bookmarked: boolean }>(ENDPOINTS.DISCOVERY.TOGGLE_SAVE(id))
    return res.bookmarked
  },

  async getFeatured(): Promise<ScholarshipDetail[]> {
    const res = await ApiClient.get<{ scholarships: ScholarshipDetail[] }>(ENDPOINTS.DISCOVERY.FEATURED)
    return res.scholarships
  },

  async getRecommended(): Promise<ScholarshipDetail[]> {
    const res = await ApiClient.get<{ scholarships: ScholarshipDetail[] }>(ENDPOINTS.DISCOVERY.RECOMMENDED)
    return res.scholarships
  },

  async getBookmarked(): Promise<ScholarshipDetail[]> {
    const res = await ApiClient.get<{ scholarships: ScholarshipDetail[] }>(ENDPOINTS.DISCOVERY.BOOKMARKED)
    return res.scholarships
  },
}
