export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'interview' | 'reminder';
  relatedEntityId?: string; // e.g., Scholarship ID
}

export type ViewMode = 'month' | 'agenda';
