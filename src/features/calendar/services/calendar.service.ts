import { addDays, subDays } from 'date-fns';
import type { CalendarEvent } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const today = new Date();

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'State Excellence Award Deadline',
    date: addDays(today, 15).toISOString(),
    type: 'deadline',
  },
  {
    id: 'evt_2',
    title: 'Women in STEM Interview',
    date: addDays(today, 5).toISOString(),
    type: 'interview',
  },
  {
    id: 'evt_3',
    title: 'Submit Income Certificate',
    date: subDays(today, 2).toISOString(),
    type: 'reminder',
  },
  {
    id: 'evt_4',
    title: 'Minority Welfare Application',
    date: addDays(today, 3).toISOString(),
    type: 'deadline',
  }
];

export const calendarService = {
  async fetchEvents(_month: number, _year: number): Promise<CalendarEvent[]> {
    await delay(600);
    return MOCK_EVENTS;
  }
};
