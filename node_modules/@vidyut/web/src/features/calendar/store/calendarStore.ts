import { create } from 'zustand'
import { calendarService, type CalendarEvent } from '../services/calendar.service'

interface CalendarState {
  events: CalendarEvent[]
  currentMonth: number
  currentYear: number
  isLoading: boolean
  fetchEvents: (month?: number, year?: number) => Promise<void>
  setMonth: (month: number, year: number) => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  isLoading: false,

  fetchEvents: async (month, year) => {
    const m = month ?? get().currentMonth
    const y = year ?? get().currentYear
    set({ isLoading: true })
    try {
      const events = await calendarService.fetchEvents(m, y)
      set({ events, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setMonth: (month, year) => {
    set({ currentMonth: month, currentYear: year })
    get().fetchEvents(month, year)
  },
}))
