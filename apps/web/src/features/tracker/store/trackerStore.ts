import { create } from 'zustand'
import { trackerService, type ApplicationRecord } from '../services/tracker.service'

interface TrackerState {
  applications: ApplicationRecord[]
  isLoading: boolean
  error: string | null
  fetchApplications: () => Promise<void>
  updateStatus: (id: string, status: ApplicationRecord['status'], notes?: string) => Promise<void>
  createApplication: (scholarshipId: string, notes?: string) => Promise<ApplicationRecord>
  deleteApplication: (id: string) => Promise<void>
  moveApplication: (id: string, status: ApplicationRecord['status']) => Promise<void>
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null })
    try {
      const applications = await trackerService.fetchApplications()
      set({ applications, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? 'Failed to fetch applications' })
    }
  },

  updateStatus: async (id, status, notes) => {
    try {
      const updated = await trackerService.updateStatus(id, status, notes)
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? updated : a)),
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to update status' })
      throw err
    }
  },

  createApplication: async (scholarshipId, notes) => {
    const app = await trackerService.createApplication(scholarshipId, notes)
    set((state) => ({ applications: [app, ...state.applications] }))
    return app
  },

  deleteApplication: async (id) => {
    await trackerService.deleteApplication(id)
    set((state) => ({ applications: state.applications.filter((a) => a.id !== id) }))
  },

  moveApplication: async (id, status) => {
    const prev = get().applications.find((a) => a.id === id)
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
    try {
      const updated = await trackerService.updateStatus(id, status)
      set((state) => ({ applications: state.applications.map((a) => (a.id === id ? updated : a)) }))
    } catch (err: any) {
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id && prev ? prev : a)),
        error: err.message ?? 'Failed to move application',
      }))
    }
  },
}))
