import { create } from 'zustand'
import { discoveryService, type ScholarshipDetail, type FilterCriteria } from '../services/discovery.service'

interface DiscoveryState {
  scholarships: ScholarshipDetail[]
  pagination: { page: number; limit: number; total: number; totalPages: number } | null
  isLoading: boolean
  error: string | null
  filters: FilterCriteria
  setFilters: (filters: Partial<FilterCriteria>) => void
  fetchScholarships: () => Promise<void>
  toggleSave: (id: string) => Promise<void>
}

const defaultFilters: FilterCriteria = {
  searchQuery: '',
  tags: [],
  sortBy: 'matchScore',
  page: 1,
  limit: 12,
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  scholarships: [],
  pagination: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }))
    get().fetchScholarships()
  },

  fetchScholarships: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await discoveryService.searchScholarships(get().filters)
      set({ scholarships: res.scholarships, pagination: res.pagination, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? 'Failed to fetch scholarships' })
    }
  },

  toggleSave: async (id: string) => {
    const prev = get().scholarships.find((s) => s.id === id)
    // Optimistic update
    set((state) => ({
      scholarships: state.scholarships.map((s) => (s.id === id ? { ...s, isSaved: !s.isSaved } : s)),
    }))
    try {
      await discoveryService.toggleSave(id)
    } catch {
      // Rollback
      set((state) => ({
        scholarships: state.scholarships.map((s) =>
          s.id === id ? { ...s, isSaved: prev?.isSaved ?? false } : s,
        ),
      }))
    }
  },
}))
