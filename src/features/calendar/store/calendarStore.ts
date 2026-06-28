import { create } from 'zustand';
import { calendarService } from '../services/calendar.service';
import type { CalendarEvent, ViewMode } from '../types';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  currentDate: Date;
  viewMode: ViewMode;
  
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  fetchEvents: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  currentDate: new Date(),
  viewMode: 'month',

  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
    get().fetchEvents();
  },
  
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  fetchEvents: async () => {
    const { currentDate } = get();
    set({ isLoading: true, error: null });
    try {
      const data = await calendarService.fetchEvents(currentDate.getMonth(), currentDate.getFullYear());
      set({ events: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to fetch calendar events' });
    }
  }
}));
