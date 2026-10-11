import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'deadline'
  source: 'bookmark' | 'application'
  scholarshipId: string
  provider: string
  applicationStatus?: string
}

export const calendarService = {
  async fetchEvents(month: number, year: number): Promise<CalendarEvent[]> {
    const res = await ApiClient.get<{ events: CalendarEvent[] }>(ENDPOINTS.CALENDAR.EVENTS, {
      params: { month, year },
    })
    return res.events
  },
}
