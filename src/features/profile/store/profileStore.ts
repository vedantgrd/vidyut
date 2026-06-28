import { create } from 'zustand';
import { profileService } from '../services/profile.service';
import type { UserProfileData } from '../types';

interface ProfileState {
  profile: UserProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.fetchProfile();
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch profile' });
    }
  },

  updateProfile: async (data: Partial<UserProfileData>) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await profileService.updateProfile(data);
      set({ profile: updated, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message || 'Failed to update profile' });
    }
  }
}));
