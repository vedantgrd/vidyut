import { create } from 'zustand';
import { discoveryService } from '../services/discovery.service';
import type { ScholarshipDetail, FilterCriteria } from '../types';

interface DiscoveryState {
  scholarships: ScholarshipDetail[];
  isLoading: boolean;
  error: string | null;
  filters: FilterCriteria;
  
  setFilters: (filters: Partial<FilterCriteria>) => void;
  fetchScholarships: () => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
}

const defaultFilters: FilterCriteria = {
  searchQuery: '',
  minAmount: 0,
  maxAmount: 500000,
  tags: [],
  sortBy: 'matchScore'
};

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  scholarships: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchScholarships();
  },

  fetchScholarships: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await discoveryService.searchScholarships(get().filters);
      set({ scholarships: results, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch scholarships' });
    }
  },

  toggleSave: async (id: string) => {
    try {
      await discoveryService.toggleSave(id);
      set(state => ({
        scholarships: state.scholarships.map(s => 
          s.id === id ? { ...s, isSaved: !s.isSaved } : s
        )
      }));
    } catch (error) {
      console.error('Failed to save scholarship');
    }
  }
}));
