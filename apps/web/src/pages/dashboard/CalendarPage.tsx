import { useEffect } from 'react'
import { useCalendarStore } from '@/features/calendar/store/calendarStore'
import { DashboardHeader } from '@/features/dashboard/components/DashboardLayout'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const CalendarPage = () => {
  const { events, currentMonth, currentYear, isLoading, fetchEvents, setMonth } = useCalendarStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

  const eventDates = new Set(events.map((e) => new Date(e.date).getDate()))

  const prev = () => {
    const d = new Date(currentYear, currentMonth - 2, 1)
    setMonth(d.getMonth() + 1, d.getFullYear())
  }
  const next = () => {
    const d = new Date(currentYear, currentMonth, 1)
    setMonth(d.getMonth() + 1, d.getFullYear())
  }

  return (
    <div>
      <DashboardHeader
        title="Calendar"
        subtitle="Track scholarship deadlines from your saved and applied scholarships."
      />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={prev} style={{ padding: '8px 16px', border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-1)', cursor: 'pointer', color: 'var(--text-primary)' }}>←</button>
          <h2 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{MONTHS[currentMonth - 1]} {currentYear}</h2>
          <button onClick={next} style={{ padding: '8px 16px', border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-1)', cursor: 'pointer', color: 'var(--text-primary)' }}>→</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', padding: '8px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const hasEvent = eventDates.has(day)
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear()
            return (
              <div key={day} style={{
                padding: '10px 6px',
                textAlign: 'center',
                borderRadius: 8,
                background: isToday ? 'var(--color-primary)' : hasEvent ? '#eef2ff' : 'var(--surface-1)',
                border: `1px solid ${isToday ? 'transparent' : hasEvent ? '#c7d2fe' : 'var(--border-subtle)'}`,
                color: isToday ? '#fff' : 'var(--text-primary)',
                fontSize: 14,
                fontWeight: hasEvent || isToday ? 600 : 400,
                position: 'relative',
                cursor: hasEvent ? 'pointer' : 'default',
              }}>
                {day}
                {hasEvent && !isToday && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4f46e5', margin: '3px auto 0' }} />}
              </div>
            )
          })}
        </div>

        {/* Events list */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: 32 }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-tertiary)' }}>
            <p style={{ marginBottom: 8 }}>No deadlines this month.</p>
            <p style={{ fontSize: 13 }}>Save or apply to scholarships to track their deadlines here.</p>
          </div>
        ) : (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Deadlines this month</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eef2ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', lineHeight: 1 }}>{new Date(e.date).getDate()}</span>
                    <span style={{ fontSize: 10, color: '#6366f1' }}>{MONTHS[new Date(e.date).getMonth()].slice(0,3)}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{e.title}</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{e.provider}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 20, background: e.source === 'application' ? '#dcfce7' : '#f3f4f6', color: e.source === 'application' ? '#166534' : '#4b5563' }}>
                    {e.source === 'application' ? 'Applied' : 'Saved'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarPage
