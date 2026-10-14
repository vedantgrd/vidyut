import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Download,
  CheckSquare,
  Square,
  Trash2,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import type { CalendarEvent, StudentTask, Scholarship } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { PageSpinner } from '@/components/ui/Spinner'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [scholarships, setScholarships] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Current view date
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().slice(0, 10))
  const [activeFilter, setActiveFilter] = useState<string>('ALL')

  // Task creation modal
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDueDate, setTaskDueDate] = useState(now.toISOString().slice(0, 10))
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [taskScholarshipId, setTaskScholarshipId] = useState('')
  const [submittingTask, setSubmittingTask] = useState(false)

  // Fetch calendar events and tasks
  const loadCalendarData = async () => {
    try {
      const [eventsRes, tasksRes, scholarshipsRes] = await Promise.all([
        api.get<{ events: CalendarEvent[] }>(`/calendar/events?month=${month}&year=${year}`),
        api.get<{ tasks: StudentTask[] }>('/tasks'),
        api.get<{ scholarships: Scholarship[] }>('/scholarships?limit=50')
      ])
      setEvents(eventsRes.events || [])
      setTasks(tasksRes.tasks || [])
      setScholarships(scholarshipsRes.scholarships?.map(s => ({ id: s.id, name: s.name })) || [])
    } catch (err) {
      console.error('Failed to load calendar data', err)
      toast('Failed to load calendar events', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalendarData()
  }, [month, year])

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDate(today.toISOString().slice(0, 10))
  }

  // Task management handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      toast('Please enter a task title', 'error')
      return
    }
    setSubmittingTask(true)
    try {
      await api.post('/tasks', {
        title: taskTitle.trim(),
        description: taskDesc.trim() || null,
        dueDate: taskDueDate || null,
        priority: taskPriority,
        scholarshipId: taskScholarshipId || null
      })
      toast('Task created successfully!', 'success')
      setTaskTitle('')
      setTaskDesc('')
      setTaskModalOpen(false)
      loadCalendarData()
    } catch (err) {
      toast(err, 'error')
    } finally {
      setSubmittingTask(false)
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/toggle`)
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
      setEvents(prev => prev.map(e => e.metadata?.taskId === taskId ? { ...e, isCompleted: !e.isCompleted } : e))
      toast('Task updated', 'info')
    } catch (err) {
      toast(err, 'error')
      loadCalendarData()
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setEvents(prev => prev.filter(e => e.metadata?.taskId !== taskId))
      toast('Task deleted', 'info')
    } catch (err) {
      toast(err, 'error')
    }
  }

  const handleSyncSuggestedTasks = async () => {
    try {
      const res = await api.post<{ generatedCount: number }>('/tasks/sync-suggested')
      toast(`Synchronized suggested tasks (${res.generatedCount} new requirement tasks generated)`, 'success')
      loadCalendarData()
    } catch (err) {
      toast(err, 'error')
    }
  }

  // Export iCalendar file (.ics)
  const handleExportICS = async () => {
    try {
      const blobData = await api.getBlob('/calendar/export.ics')
      const url = window.URL.createObjectURL(blobData.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = blobData.fileName || 'vidyut-scholarship-calendar.ics'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast('Calendar exported! Import to Google Calendar, Apple Calendar or Outlook.', 'success')
    } catch (err) {
      toast('Failed to export calendar', 'error')
    }
  }

  // Filter events
  const filteredEvents = events.filter(e => {
    if (activeFilter === 'DEADLINES') return e.type === 'SCHOLARSHIP_DEADLINE'
    if (activeFilter === 'TASKS') return e.type === 'PERSONAL_TASK'
    if (activeFilter === 'EXPIRY') return e.type === 'DOCUMENT_EXPIRY'
    if (activeFilter === 'PAYOUTS') return e.type === 'EXPECTED_INSTALLMENT'
    return true
  })

  // Calendar grid calculations
  const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const totalDaysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const daysInPrevMonth = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()

  const todayIso = new Date().toISOString().slice(0, 10)

  // Events on selected date
  const selectedDateEvents = filteredEvents.filter(e => e.date === selectedDate)

  if (loading) return <PageSpinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: 20, marginBottom: 8 }}>
            <CalendarIcon size={12} color="#1e40af" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Smart Scholarship Calendar
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Deadlines & Action Agenda
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Unified schedule of verified scholarship deadlines, document expiries, personal tasks, and DBT payouts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncSuggestedTasks}
            leftIcon={<Sparkles size={14} color="#1e40af" />}
          >
            Auto-Sync Tasks
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportICS}
            leftIcon={<Download size={14} />}
          >
            Export (.ics)
          </Button>
          <Button
            size="sm"
            style={{ background: '#1e40af', color: '#ffffff' }}
            leftIcon={<Plus size={14} />}
            onClick={() => {
              setTaskDueDate(selectedDate)
              setTaskModalOpen(true)
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { key: 'ALL', label: `All Events (${events.length})` },
          { key: 'DEADLINES', label: `Deadlines (${events.filter(e => e.type === 'SCHOLARSHIP_DEADLINE').length})` },
          { key: 'TASKS', label: `Personal Tasks (${events.filter(e => e.type === 'PERSONAL_TASK').length})` },
          { key: 'EXPIRY', label: `Doc Expiry (${events.filter(e => e.type === 'DOCUMENT_EXPIRY').length})` },
          { key: 'PAYOUTS', label: `DBT Payouts (${events.filter(e => e.type === 'EXPECTED_INSTALLMENT').length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: activeFilter === tab.key ? '1px solid #1e40af' : '1px solid #e2e8f0',
              background: activeFilter === tab.key ? '#eff6ff' : '#ffffff',
              color: activeFilter === tab.key ? '#1e40af' : '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 120ms ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Calendar View: 2 Columns on desktop (Month Grid + Day Agenda) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: 20 }}>
        {/* Left Column: Month Grid */}
        <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff' }}>
          {/* Calendar Header with Nav & Today action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {MONTH_NAMES[month - 1]} {year}
              </h2>
              <button
                onClick={handleToday}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                Today
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handlePrevMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} color="#475569" />
              </button>
              <button
                onClick={handleNextMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={16} color="#475569" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6, textAlign: 'center' }}>
            {DAY_NAMES.map(d => (
              <span key={d} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {/* Previous month padding days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1
              return (
                <div
                  key={`prev-${i}`}
                  style={{
                    minHeight: 64,
                    padding: 6,
                    borderRadius: 8,
                    background: '#f8fafc',
                    color: '#cbd5e1',
                    fontSize: 12,
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span>{dayNum}</span>
                </div>
              )
            })}

            {/* Current month days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dayStr = String(dayNum).padStart(2, '0')
              const monthStr = String(month).padStart(2, '0')
              const cellDate = `${year}-${monthStr}-${dayStr}`

              const isToday = cellDate === todayIso
              const isSelected = cellDate === selectedDate
              const dayEvents = filteredEvents.filter(e => e.date === cellDate)

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDate)}
                  style={{
                    minHeight: 64,
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: isSelected ? '#eff6ff' : (isToday ? '#f0fdf4' : '#ffffff'),
                    border: isSelected ? '2px solid #1e40af' : (isToday ? '1px solid #86efac' : '1px solid #e2e8f0'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isToday || isSelected ? 800 : 500,
                      color: isSelected ? '#1e40af' : (isToday ? '#059669' : '#0f172a')
                    }}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#ffffff',
                        background: isSelected ? '#1e40af' : '#64748b',
                        padding: '1px 5px',
                        borderRadius: 10
                      }}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event dots/indicators */}
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
                    {dayEvents.slice(0, 3).map((e, idx) => {
                      let dotColor = '#1e40af'
                      if (e.type === 'SCHOLARSHIP_DEADLINE') dotColor = '#dc2626'
                      if (e.type === 'DOCUMENT_EXPIRY') dotColor = '#d97706'
                      if (e.type === 'EXPECTED_INSTALLMENT') dotColor = '#059669'
                      return (
                        <div
                          key={idx}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: dotColor
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Right Column: Selected Date Agenda & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Agenda for Selected Date */}
          <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Agenda: {selectedDate}
                </h3>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                  {selectedDate === todayIso ? 'Today' : 'Selected date in calendar'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Plus size={12} />}
                onClick={() => {
                  setTaskDueDate(selectedDate)
                  setTaskModalOpen(true)
                }}
              >
                New Task
              </Button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <Clock size={24} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>No events scheduled for this day</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 12px' }}>Click "New Task" to add a deadline reminder or personal milestone.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: event.isCompleted ? '#f8fafc' : '#ffffff',
                      border: event.isCompleted ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {event.type === 'PERSONAL_TASK' && event.metadata?.taskId ? (
                          <button
                            onClick={() => handleToggleTask(event.metadata!.taskId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            {event.isCompleted ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#64748b" />}
                          </button>
                        ) : null}
                        <h4 style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: event.isCompleted ? '#64748b' : '#0f172a',
                          textDecoration: event.isCompleted ? 'line-through' : 'none',
                          margin: 0
                        }}>
                          {event.title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {event.isVerifiedDeadline && (
                          <Badge variant="accent">Verified</Badge>
                        )}
                        {event.type === 'PERSONAL_TASK' && event.metadata?.taskId && (
                          <button
                            onClick={() => handleDeleteTask(event.metadata!.taskId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>
                        {event.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                        {event.type.replace(/_/g, ' ')}
                      </span>
                      {event.actionUrl && (
                        <Link to={event.actionUrl} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="ghost" rightIcon={<ExternalLink size={11} />} style={{ fontSize: 11, padding: '2px 8px', height: 26 }}>
                            Open
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* All Pending Tasks Overview Card */}
          <Card style={{ padding: 20, border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={16} color="#1e40af" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Personal Tasks ({tasks.filter(t => !t.isCompleted).length} pending)
                </h3>
              </div>
            </div>

            {tasks.length === 0 ? (
              <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
                No tasks created. Click "Add Task" or "Auto-Sync Tasks" to populate your checklist.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.slice(0, 6).map(t => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleToggleTask(t.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        {t.isCompleted ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#64748b" />}
                      </button>
                      <div>
                        <p style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: t.isCompleted ? '#94a3b8' : '#0f172a',
                          textDecoration: t.isCompleted ? 'line-through' : 'none',
                          margin: 0
                        }}>
                          {t.title}
                        </p>
                        {t.dueDate && (
                          <span style={{ fontSize: 10, color: '#64748b' }}>
                            Due: {t.dueDate.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {taskModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: 24,
                width: '100%',
                maxWidth: 480,
                border: '1px solid #cbd5e1',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Add Personal Task / Reminder</h3>
                <button
                  onClick={() => setTaskModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upload renewed income certificate"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes or instructions"
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={e => setTaskPriority(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Link to Scholarship (Optional)
                  </label>
                  <select
                    value={taskScholarshipId}
                    onChange={e => setTaskScholarshipId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">-- No specific scholarship --</option>
                    {scholarships.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingTask} style={{ background: '#1e40af', color: '#ffffff' }}>
                    {submittingTask ? 'Saving...' : 'Save Task'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default CalendarPage
