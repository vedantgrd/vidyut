import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { EligibilityEngine } from '../lib/EligibilityEngine.js'

const calendar = new Hono<{ Variables: { userId: string; role: string } }>()

calendar.use('*', authMiddleware)

// GET /calendar/events - Fetch deadlines of applied and eligible scholarships
calendar.get('/events', async (c) => {
  const userId = c.get('userId') as string
  const month = parseInt(c.req.query('month') ?? String(new Date().getMonth() + 1))
  const year = parseInt(c.req.query('year') ?? String(new Date().getFullYear()))

  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  // 1. Fetch active scholarships with deadlines in this month
  const scholarships = await prisma.scholarship.findMany({
    where: {
      deadline: { gte: startOfMonth, lte: endOfMonth },
      status: 'ACTIVE'
    }
  })

  // 2. Fetch student's applications
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { scholarship: true }
  })

  const events = []

  for (const s of scholarships) {
    const matchingApp = applications.find((a: any) => a.scholarshipId === s.id)
    
    if (matchingApp) {
      events.push({
        id: `application-${matchingApp.id}`,
        title: s.name,
        date: s.deadline,
        type: 'deadline',
        source: 'application',
        scholarshipId: s.id,
        provider: s.provider,
        applicationStatus: matchingApp.status,
      })
    } else {
      // Check if student is eligible
      try {
        const report = await EligibilityEngine.evaluate(userId, s.id)
        if (report.isEligible) {
          events.push({
            id: `eligible-${s.id}`,
            title: s.name,
            date: s.deadline,
            type: 'deadline',
            source: 'eligible',
            scholarshipId: s.id,
            provider: s.provider,
          })
        }
      } catch (err) {
        console.error('Error in calendar eligibility evaluation:', err)
      }
    }
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return c.json({
    success: true,
    data: events
  })
})

export default calendar
