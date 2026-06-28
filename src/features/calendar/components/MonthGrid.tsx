import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns';
import type { CalendarEvent } from '../types';
import styles from './Calendar.module.css';

interface MonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export const MonthGrid: React.FC<MonthGridProps> = React.memo(({ currentDate, events }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date), day));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.gridContainer}>
      <div className={styles.weekDays}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDay}>{day}</div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toISOString()} 
              className={`${styles.dayCell} ${!isCurrentMonth ? styles.disabledDay : ''} ${isToday ? styles.today : ''}`}
            >
              <div className={styles.dayNumber}>{format(day, dateFormat)}</div>
              <div className={styles.eventList}>
                {dayEvents.map(evt => (
                  <div key={evt.id} className={styles.eventBadge} data-type={evt.type} title={evt.title}>
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

MonthGrid.displayName = 'MonthGrid';
