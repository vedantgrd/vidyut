import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { EligibilityEngine } from '../lib/EligibilityEngine.js'

export type CalendarEventType =
  | 'SCHOLARSHIP_DEADLINE'
  | 'SCHOLARSHIP_OPENING'
  | 'PERSONAL_TASK'
  | 'DOCUMENT_EXPIRY'
  | 'APPLICATION_UPDATE'
  | 'EXPECTED_INSTALLMENT'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD ISO date-only string to avoid timezone drift
  dateTime?: string
  type: CalendarEventType
  source: 'application' | 'eligible_scholarship' | 'task' | 'vault_document' | 'disbursement'
  status?: string
  priority?: string
  isCompleted?: boolean
  isVerifiedDeadline?: boolean
  verificationSource?: string | null
  sourceVerificationDate?: string | null
  actionUrl: string
  metadata?: Record<string, any>
}

const calendar = new Hono<{ Variables: { userId: string; role: string } }>()
calendar.use('*', authMiddleware)

// Helper to format date-only safely without timezone conversion drift
function toDateString(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// GET /calendar/events - Fetch all calendar events with optional month, year, and type filters
calendar.get('/events', async (c) => {
  const userId = c.get('userId')
  const month = c.req.query('month') ? parseInt(c.req.query('month')!) : null
  const year = c.req.query('year') ? parseInt(c.req.query('year')!) : null
  const typeFilter = c.req.query('type') // optional filter

  // Date range boundary
  let startRange: Date | undefined
  let endRange: Date | undefined

  if (month && year) {
    // Include 7 days buffer before and after for calendar grid edge days
    startRange = new Date(Date.UTC(year, month - 1, 1 - 7))
    endRange = new Date(Date.UTC(year, month, 7, 23, 59, 59))
  }

  const events: CalendarEvent[] = []

  // 1. Fetch Student Applications (and their scholarships)
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      scholarship: {
        include: {
          installments: { orderBy: { installmentNo: 'asc' } }
        }
      },
      disbursements: true
    }
  })

  const appliedScholarshipIds = new Set(applications.map(a => a.scholarshipId))

  // Add application deadlines and opening dates
  for (const app of applications) {
    const s = app.scholarship
    if (s.deadline) {
      events.push({
        id: `event-deadline-app-${app.id}`,
        title: `${s.name} Deadline`,
        description: `Applied scheme with status: ${app.status.replace(/_/g, ' ')}`,
        date: toDateString(s.deadline),
        dateTime: s.deadline.toISOString(),
        type: 'SCHOLARSHIP_DEADLINE',
        source: 'application',
        status: app.status,
        isVerifiedDeadline: s.isVerifiedDeadline,
        verificationSource: s.verificationSource,
        sourceVerificationDate: s.sourceVerificationDate ? toDateString(s.sourceVerificationDate) : null,
        actionUrl: `/applications/${app.id}`,
        metadata: {
          scholarshipId: s.id,
          applicationId: app.id,
          provider: s.provider,
          amount: s.amount
        }
      })
    }

    if (s.openDate) {
      events.push({
        id: `event-open-app-${app.id}`,
        title: `${s.name} Applications Opened`,
        description: `Opening date for ${s.name}`,
        date: toDateString(s.openDate),
        dateTime: s.openDate.toISOString(),
        type: 'SCHOLARSHIP_OPENING',
        source: 'application',
        isVerifiedDeadline: true,
        actionUrl: `/applications/${app.id}`,
        metadata: { scholarshipId: s.id }
      })
    }

    // Add expected disbursement dates for approved applications
    if (app.status === 'APPROVED') {
      for (const inst of s.installments) {
        if (inst.expectedDate) {
          const disbursed = app.disbursements.find(d => d.installmentId === inst.id && d.status === 'DISBURSED')
          events.push({
            id: `event-installment-${inst.id}`,
            title: `Expected Payout: ₹${inst.amount.toLocaleString('en-IN')}`,
            description: `Installment #${inst.installmentNo} for ${s.name}`,
            date: toDateString(inst.expectedDate),
            dateTime: inst.expectedDate.toISOString(),
            type: 'EXPECTED_INSTALLMENT',
            source: 'disbursement',
            status: disbursed ? 'DISBURSED' : 'PENDING',
            actionUrl: `/applications/${app.id}`,
            metadata: {
              amount: inst.amount,
              installmentNo: inst.installmentNo,
              scholarshipId: s.id
            }
          })
        }
      }
    }
  }

  // 2. Fetch Active Eligible Scholarships that student hasn't applied to yet
  const activeScholarships = await prisma.scholarship.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: Array.from(appliedScholarshipIds) }
    }
  })

  for (const s of activeScholarships) {
    try {
      const report = await EligibilityEngine.evaluate(userId, s.id)
      if (report.isEligible && s.deadline) {
        events.push({
          id: `event-deadline-eligible-${s.id}`,
          title: `${s.name} Deadline`,
          description: `You are eligible for this grant of ₹${s.amount.toLocaleString('en-IN')}. Application not yet started.`,
          date: toDateString(s.deadline),
          dateTime: s.deadline.toISOString(),
          type: 'SCHOLARSHIP_DEADLINE',
          source: 'eligible_scholarship',
          isVerifiedDeadline: s.isVerifiedDeadline,
          verificationSource: s.verificationSource,
          sourceVerificationDate: s.sourceVerificationDate ? toDateString(s.sourceVerificationDate) : null,
          actionUrl: `/scholarships/${s.id}`,
          metadata: {
            scholarshipId: s.id,
            provider: s.provider,
            amount: s.amount,
            isEligible: report.isEligible
          }
        })
      }
    } catch {
      // Graceful fallback
    }
  }

  // 3. Fetch Personal Student Tasks
  const taskWhere: any = { userId }
  if (startRange && endRange) {
    taskWhere.dueDate = { gte: startRange, lte: endRange }
  }

  const tasks = await prisma.studentTask.findMany({
    where: taskWhere,
    include: {
      scholarship: { select: { id: true, name: true } },
      application: { select: { id: true } }
    }
  })

  for (const t of tasks) {
    if (t.dueDate) {
      events.push({
        id: `event-task-${t.id}`,
        title: t.title,
        description: t.description || undefined,
        date: toDateString(t.dueDate),
        dateTime: t.dueDate.toISOString(),
        type: 'PERSONAL_TASK',
        source: 'task',
        priority: t.priority,
        isCompleted: t.isCompleted,
        actionUrl: t.applicationId ? `/applications/${t.applicationId}` : (t.scholarshipId ? `/scholarships/${t.scholarshipId}` : '/dashboard'),
        metadata: {
          taskId: t.id,
          requirementType: t.requirementType,
          isSystemGenerated: t.isSystemGenerated
        }
      })
    }
  }

  // 4. Fetch Document Expiries from Vault
  const userDocs = await prisma.document.findMany({
    where: {
      userId,
      expiryDate: { not: null }
    }
  })

  for (const d of userDocs) {
    if (d.expiryDate) {
      events.push({
        id: `event-doc-expiry-${d.id}`,
        title: `Document Expiry: ${d.label}`,
        description: `Your ${d.label} stored in the vault expires on this date. Renew it to keep applications valid.`,
        date: toDateString(d.expiryDate),
        dateTime: d.expiryDate.toISOString(),
        type: 'DOCUMENT_EXPIRY',
        source: 'vault_document',
        status: d.status,
        actionUrl: '/documents',
        metadata: {
          documentId: d.id,
          documentType: d.type
        }
      })
    }
  }

  // Filter by event type if requested
  let filteredEvents = events
  if (typeFilter) {
    filteredEvents = events.filter(e => e.type === typeFilter)
  }

  // Sort chronologically
  filteredEvents.sort((a, b) => a.date.localeCompare(b.date))

  // Calculate upcoming counts
  const todayStr = toDateString(new Date())
  const upcomingCount = filteredEvents.filter(e => e.date >= todayStr).length

  return c.json({
    events: filteredEvents,
    today: todayStr,
    totalCount: filteredEvents.length,
    upcomingCount
  })
})

// GET /calendar/export.ics - Lightweight standard iCalendar format export for Google / Apple / Outlook
calendar.get('/export.ics', async (c) => {
  const userId = c.get('userId')

  const applications = await prisma.application.findMany({
    where: { userId },
    include: { scholarship: true }
  })
  const tasks = await prisma.studentTask.findMany({
    where: { userId, isCompleted: false, dueDate: { not: null } },
    include: { scholarship: true }
  })

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vidyut Scholarships//Smart Calendar v1.1//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Vidyut Scholarship Calendar',
    'X-WR-TIMEZONE:Asia/Kolkata'
  ]

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  for (const app of applications) {
    const s = app.scholarship
    if (s.deadline) {
      const dt = formatICSDate(new Date(s.deadline))
      ics.push(
        'BEGIN:VEVENT',
        `UID:vidyut-deadline-${app.id}@vidyut.in`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${dt}`,
        `DTEND:${dt}`,
        `SUMMARY:Scholarship Deadline: ${s.name}`,
        `DESCRIPTION:Application status: ${app.status}. Provider: ${s.provider}. Amount: INR ${s.amount}.`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      )
    }
  }

  for (const task of tasks) {
    if (task.dueDate) {
      const dt = formatICSDate(new Date(task.dueDate))
      ics.push(
        'BEGIN:VEVENT',
        `UID:vidyut-task-${task.id}@vidyut.in`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${dt}`,
        `DTEND:${dt}`,
        `SUMMARY:Task: ${task.title}`,
        `DESCRIPTION:${task.description || 'Personal deadline task in Vidyut.'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      )
    }
  }

  ics.push('END:VCALENDAR')

  c.header('Content-Type', 'text/calendar; charset=utf-8')
  c.header('Content-Disposition', 'attachment; filename="vidyut-scholarship-deadlines.ics"')
  return c.text(ics.join('\r\n'))
})

export default calendar
