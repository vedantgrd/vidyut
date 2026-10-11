import { create } from 'zustand'
import { profileService, type UserProfileData } from '../services/profile.service'

interface ProfileState {
  profile: UserProfileData | null
  completion: { score: number; missingFields: string[] } | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  fetchCompletion: () => Promise<void>
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  completion: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await profileService.fetchProfile()
      set({ profile, isLoading: false })
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? 'Failed to load profile' })
    }
  },

  fetchCompletion: async () => {
    try {
      const completion = await profileService.getCompletion()
      set({ completion })
    } catch {
      // non-critical
    }
  },

  updateProfile: async (data) => {
    set({ isSaving: true, error: null })
    try {
      const profile = await profileService.updateProfile(data)
      set({ profile, isSaving: false })
    } catch (err: any) {
      set({ isSaving: false, error: err.message ?? 'Failed to save profile' })
      throw err
    }
  },
}))
