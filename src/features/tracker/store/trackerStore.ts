import { create } from 'zustand';
import { trackerService } from '../services/tracker.service';
import type { ApplicationRecord, ApplicationStage } from '../types';

interface TrackerState {
  applications: ApplicationRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchApplications: () => Promise<void>;
  moveApplication: (id: string, newStage: ApplicationStage) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await trackerService.fetchApplications();
      set({ applications: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch applications' });
    }
  },

  moveApplication: async (id: string, newStage: ApplicationStage) => {
    const previousState = get().applications;
    
    // Optimistic update
    set({
      applications: previousState.map(app => 
        app.id === id ? { ...app, stage: newStage, lastUpdated: new Date().toISOString() } : app
      )
    });

    try {
      await trackerService.updateApplicationStage(id, newStage);
    } catch (error) {
      // Rollback on failure
      set({ applications: previousState });
      console.error('Failed to update application stage', error);
    }
  }
}));
