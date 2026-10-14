import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js'
import { ReadinessService } from '../services/readinessService.js'

const tasks = new Hono<{ Variables: { userId: string; role: string } }>()
tasks.use('*', authMiddleware)

// GET /tasks - List student tasks
tasks.get('/', async (c) => {
  const userId = c.get('userId')
  const status = c.req.query('status') // 'all' | 'pending' | 'completed'
  const scholarshipId = c.req.query('scholarshipId')

  const where: any = { userId }
  if (status === 'pending') where.isCompleted = false
  if (status === 'completed') where.isCompleted = true
  if (scholarshipId) where.scholarshipId = scholarshipId

  const list = await prisma.studentTask.findMany({
    where,
    include: {
      scholarship: {
        select: {
          id: true,
          name: true,
          provider: true,
          deadline: true
        }
      },
      application: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: [
      { isCompleted: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  // Summary counts
  const total = list.length
  const completed = list.filter(t => t.isCompleted).length
  const pending = total - completed
  const now = new Date()
  const overdue = list.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() < now.getTime()).length

  return c.json({
    tasks: list,
    stats: {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 100
    }
  })
})

// POST /tasks - Create personal task
tasks.post('/', zValidator('json', createTaskSchema), async (c) => {
  const userId = c.get('userId')
  const data = c.req.valid('json')

  const task = await prisma.studentTask.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      scholarshipId: data.scholarshipId,
      applicationId: data.applicationId,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
      isSystemGenerated: false
    },
    include: {
      scholarship: {
        select: { id: true, name: true }
      }
    }
  })

  return c.json({ task }, 201)
})

// PATCH /tasks/:id - Update task
tasks.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const data = c.req.valid('json')

  const existing = await prisma.studentTask.findUnique({ where: { id } })
  if (!existing) return c.json({ error: 'Task not found' }, 404)
  if (existing.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const updated = await prisma.studentTask.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      priority: data.priority,
      scholarshipId: data.scholarshipId !== undefined ? data.scholarshipId : undefined,
      applicationId: data.applicationId !== undefined ? data.applicationId : undefined,
      reminderDate: data.reminderDate !== undefined ? (data.reminderDate ? new Date(data.reminderDate) : null) : undefined,
      isCompleted: data.isCompleted !== undefined ? data.isCompleted : undefined,
      completedAt: data.isCompleted !== undefined ? (data.isCompleted ? new Date() : null) : undefined
    },
    include: {
      scholarship: { select: { id: true, name: true } }
    }
  })

  return c.json({ task: updated })
})

// POST /tasks/:id/toggle - Toggle complete/reopen
tasks.post('/:id/toggle', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const existing = await prisma.studentTask.findUnique({ where: { id } })
  if (!existing) return c.json({ error: 'Task not found' }, 404)
  if (existing.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const nextStatus = !existing.isCompleted
  const updated = await prisma.studentTask.update({
    where: { id },
    data: {
      isCompleted: nextStatus,
      completedAt: nextStatus ? new Date() : null
    }
  })

  return c.json({ task: updated })
})

// DELETE /tasks/:id - Delete task
tasks.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const existing = await prisma.studentTask.findUnique({ where: { id } })
  if (!existing) return c.json({ error: 'Task not found' }, 404)
  if (existing.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  await prisma.studentTask.delete({ where: { id } })
  return c.json({ message: 'Task deleted', id })
})

// POST /tasks/sync-suggested - Idempotent sync of suggested tasks from real application requirements
tasks.post('/sync-suggested', async (c) => {
  const userId = c.get('userId')

  // Find student's active applications in DRAFT
  const draftApps = await prisma.application.findMany({
    where: { userId, status: 'DRAFT' },
    include: {
      scholarship: {
        include: { requiredDocuments: true }
      }
    }
  })

  const generatedTasks = []

  for (const app of draftApps) {
    try {
      const readiness = await ReadinessService.evaluateReadiness(userId, app.scholarshipId, app.id)

      for (const missing of readiness.missingRequirements) {
        const reqKey = `req:${missing.id}:${app.scholarshipId}`

        // Check if task with this key already exists
        const existingTask = await prisma.studentTask.findFirst({
          where: { userId, requirementKey: reqKey }
        })

        if (!existingTask) {
          const newTask = await prisma.studentTask.create({
            data: {
              userId,
              title: missing.category === 'DOCUMENT'
                ? `Upload ${missing.label} for ${app.scholarship.name}`
                : `Complete ${missing.label} for ${app.scholarship.name}`,
              description: `Required for ${app.scholarship.name}. Deadline: ${app.scholarship.deadline.toISOString().slice(0, 10)}.`,
              dueDate: app.scholarship.deadline,
              priority: 'HIGH',
              scholarshipId: app.scholarshipId,
              applicationId: app.id,
              requirementType: missing.category,
              requirementKey: reqKey,
              isSystemGenerated: true
            }
          })
          generatedTasks.push(newTask)
        } else if (existingTask.isCompleted) {
          // If requirement is still missing in reality, reopen it
          await prisma.studentTask.update({
            where: { id: existingTask.id },
            data: { isCompleted: false, completedAt: null }
          })
        }
      }

      // Check if any previously generated tasks for this scholarship are now completed in readiness
      for (const completed of readiness.completedRequirements) {
        const reqKey = `req:${completed.id}:${app.scholarshipId}`
        const pendingTask = await prisma.studentTask.findFirst({
          where: { userId, requirementKey: reqKey, isCompleted: false }
        })
        if (pendingTask) {
          await prisma.studentTask.update({
            where: { id: pendingTask.id },
            data: { isCompleted: true, completedAt: new Date() }
          })
        }
      }
    } catch (e) {
      console.error('Error generating suggested tasks for app', app.id, e)
    }
  }

  return c.json({
    message: 'Suggested tasks synchronized',
    generatedCount: generatedTasks.length,
    newTasks: generatedTasks
  })
})

export default tasks
