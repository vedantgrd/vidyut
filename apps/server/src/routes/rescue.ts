import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { ReadinessService } from '../services/readinessService.js'

export interface RescueActionCard {
  id: string
  title: string
  whyItMatters: string
  relatedScholarshipName: string
  relatedScholarshipId: string
  applicationId?: string
  deadline: string | null
  daysRemaining: number | null
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  priorityScore: number
  rationale: string
  isMandatory: boolean
  estimatedEffort: string
  actionLabel: string
  actionUrl: string
  actionType: 'UPLOAD_DOCUMENT' | 'COMPLETE_PROFILE' | 'REVIEW_AND_SUBMIT' | 'RESOLVE_TASK' | 'RENEW_DOCUMENT'
  category: 'DOCUMENT' | 'PROFILE' | 'APPLICATION' | 'TASK'
}

const rescue = new Hono<{ Variables: { userId: string; role: string } }>()
rescue.use('*', authMiddleware)

// GET /rescue/actions - Return prioritized rescue action plan
rescue.get('/actions', async (c) => {
  const userId = c.get('userId')
  const now = new Date()

  // 1. Fetch user profile, applications, tasks, and documents
  const [applications, studentTasks, userDocs, userProfile] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: {
        scholarship: {
          include: { requiredDocuments: true }
        },
        documents: { include: { document: true } }
      }
    }),
    prisma.studentTask.findMany({
      where: { userId, isCompleted: false },
      include: { scholarship: true }
    }),
    prisma.document.findMany({ where: { userId } }),
    prisma.studentProfile.findUnique({ where: { userId } })
  ])

  const actionCards: RescueActionCard[] = []

  // Check general profile completion first
  if (!userProfile?.phone || !userProfile?.category || !userProfile?.domicileState) {
    actionCards.push({
      id: 'rescue-profile-essentials',
      title: 'Complete Profile Essentials',
      whyItMatters: 'Scholarship eligibility and preflight verification require phone, category, and domicile state.',
      relatedScholarshipName: 'All Scholarships',
      relatedScholarshipId: '',
      deadline: null,
      daysRemaining: null,
      priority: 'HIGH',
      priorityScore: 75,
      rationale: 'Required for automated matching and submission validation across all schemes',
      isMandatory: true,
      estimatedEffort: '2 mins',
      actionLabel: 'Complete Profile',
      actionUrl: '/profile',
      actionType: 'COMPLETE_PROFILE',
      category: 'PROFILE'
    })
  }

  // 2. Evaluate active DRAFT applications with Readiness Engine
  for (const app of applications) {
    if (app.status === 'DRAFT') {
      try {
        const readiness = await ReadinessService.evaluateReadiness(userId, app.scholarshipId, app.id)
        const deadlineDate = new Date(app.scholarship.deadline)
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Check if deadline is passed
        if (diffDays < 0) {
          // Already passed, non-actionable
          continue
        }

        // Urgency multiplier based on days remaining
        let urgencyMultiplier = 1
        if (diffDays <= 2) urgencyMultiplier = 3.5
        else if (diffDays <= 5) urgencyMultiplier = 2.5
        else if (diffDays <= 10) urgencyMultiplier = 1.8
        else if (diffDays <= 30) urgencyMultiplier = 1.2

        // If ready to submit, create immediate submission action!
        if (readiness.canSubmit) {
          const score = Math.round(90 * urgencyMultiplier)
          actionCards.push({
            id: `rescue-submit-${app.id}`,
            title: `Submit Application for ${app.scholarship.name}`,
            whyItMatters: `Your application is 100% complete and passed all preflight validations! Submit before it closes in ${diffDays} day(s).`,
            relatedScholarshipName: app.scholarship.name,
            relatedScholarshipId: app.scholarship.id,
            applicationId: app.id,
            deadline: readiness.deadlineFormatted,
            daysRemaining: diffDays,
            priority: diffDays <= 3 ? 'CRITICAL' : 'URGENT',
            priorityScore: score,
            rationale: `Submission ready & closes in ${diffDays} days`,
            isMandatory: true,
            estimatedEffort: '1 min',
            actionLabel: 'Review & Submit Now',
            actionUrl: `/applications/${app.id}`,
            actionType: 'REVIEW_AND_SUBMIT',
            category: 'APPLICATION'
          })
        } else {
          // Generate action cards for top missing requirements
          for (const missing of readiness.missingRequirements) {
            if (missing.isMandatory) {
              const baseScore = missing.category === 'DOCUMENT' ? 60 : 50
              const finalScore = Math.round(baseScore * urgencyMultiplier)

              let actionType: RescueActionCard['actionType'] = 'UPLOAD_DOCUMENT'
              let estEffort = '3 mins'

              if (missing.category === 'PROFILE') {
                actionType = 'COMPLETE_PROFILE'
                estEffort = '2 mins'
              }

              actionCards.push({
                id: `rescue-req-${missing.id}-${app.id}`,
                title: missing.category === 'DOCUMENT'
                  ? `Upload ${missing.label} for ${app.scholarship.name}`
                  : `Complete ${missing.label} for ${app.scholarship.name}`,
                whyItMatters: `Blocks submission for ₹${app.scholarship.amount.toLocaleString('en-IN')} scholarship. Deadline in ${diffDays} day(s).`,
                relatedScholarshipName: app.scholarship.name,
                relatedScholarshipId: app.scholarship.id,
                applicationId: app.id,
                deadline: readiness.deadlineFormatted,
                daysRemaining: diffDays,
                priority: diffDays <= 3 ? 'CRITICAL' : (diffDays <= 7 ? 'URGENT' : 'HIGH'),
                priorityScore: finalScore,
                rationale: `Mandatory requirement for deadline in ${diffDays} day(s)`,
                isMandatory: true,
                estimatedEffort: estEffort,
                actionLabel: missing.category === 'DOCUMENT' ? 'Open Vault' : 'Complete Details',
                actionUrl: missing.actionUrl || `/applications/${app.id}`,
                actionType,
                category: missing.category === 'DOCUMENT' ? 'DOCUMENT' : 'PROFILE'
              })
            }
          }
        }
      } catch (err) {
        console.error('Rescue evaluation error for app', app.id, err)
      }
    }
  }

  // 3. Evaluate Expired & Expiring Documents in Vault
  for (const doc of userDocs) {
    if (doc.expiryDate) {
      const expDate = new Date(doc.expiryDate)
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= 0) {
        actionCards.push({
          id: `rescue-doc-expired-${doc.id}`,
          title: `Renew Expired ${doc.label}`,
          whyItMatters: `Your ${doc.label} in the vault has expired and may cause rejection of active applications.`,
          relatedScholarshipName: 'Vault Integrity',
          relatedScholarshipId: '',
          deadline: doc.expiryDate.toISOString().slice(0, 10),
          daysRemaining: diffDays,
          priority: 'URGENT',
          priorityScore: 80,
          rationale: 'Expired document in vault',
          isMandatory: true,
          estimatedEffort: '3 mins',
          actionLabel: 'Replace in Vault',
          actionUrl: '/documents',
          actionType: 'RENEW_DOCUMENT',
          category: 'DOCUMENT'
        })
      } else if (diffDays <= 15) {
        actionCards.push({
          id: `rescue-doc-expiring-${doc.id}`,
          title: `${doc.label} Expiring in ${diffDays} Days`,
          whyItMatters: `This certificate will expire on ${doc.expiryDate.toISOString().slice(0, 10)}. Obtain a renewal to avoid disruption.`,
          relatedScholarshipName: 'Vault Reminder',
          relatedScholarshipId: '',
          deadline: doc.expiryDate.toISOString().slice(0, 10),
          daysRemaining: diffDays,
          priority: 'MEDIUM',
          priorityScore: 40,
          rationale: `Document expiring in ${diffDays} days`,
          isMandatory: false,
          estimatedEffort: '5 mins',
          actionLabel: 'View Document',
          actionUrl: '/documents',
          actionType: 'RENEW_DOCUMENT',
          category: 'DOCUMENT'
        })
      }
    }
  }

  // 4. Overdue or Urgent Personal Tasks
  for (const task of studentTasks) {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isOverdue = diffDays < 0

      // Only add personal tasks that aren't already represented by requirements
      if (!task.requirementKey) {
        actionCards.push({
          id: `rescue-task-${task.id}`,
          title: task.title,
          whyItMatters: isOverdue
            ? `This personal task was due ${Math.abs(diffDays)} day(s) ago.`
            : (task.description || `Task due in ${diffDays} day(s).`),
          relatedScholarshipName: task.scholarship?.name || 'Personal Milestone',
          relatedScholarshipId: task.scholarshipId || '',
          deadline: dueDate.toISOString().slice(0, 10),
          daysRemaining: diffDays,
          priority: isOverdue ? 'CRITICAL' : (diffDays <= 2 ? 'HIGH' : 'MEDIUM'),
          priorityScore: isOverdue ? 88 : (task.priority === 'URGENT' ? 85 : 55),
          rationale: isOverdue ? 'Overdue task' : `Due in ${diffDays} days`,
          isMandatory: false,
          estimatedEffort: '5 mins',
          actionLabel: 'Go to Calendar',
          actionUrl: '/calendar',
          actionType: 'RESOLVE_TASK',
          category: 'TASK'
        })
      }
    }
  }

  // Deduplicate and Rank action cards deterministically
  const seenKeys = new Set<string>()
  const uniqueCards: RescueActionCard[] = []

  // Sort descending by calculated priorityScore
  actionCards.sort((a, b) => b.priorityScore - a.priorityScore)

  for (const card of actionCards) {
    const key = `${card.category}:${card.title}:${card.relatedScholarshipId}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      uniqueCards.push(card)
    }
  }

  // Calculate status summary
  const criticalCount = uniqueCards.filter(c => c.priority === 'CRITICAL').length
  const urgentCount = uniqueCards.filter(c => c.priority === 'URGENT').length
  const highCount = uniqueCards.filter(c => c.priority === 'HIGH').length

  let rescueStatus: 'ALL_CLEAR' | 'ATTENTION_NEEDED' | 'URGENT_ACTION_REQUIRED' = 'ALL_CLEAR'
  if (criticalCount > 0 || urgentCount > 0) {
    rescueStatus = 'URGENT_ACTION_REQUIRED'
  } else if (highCount > 0 || uniqueCards.length > 0) {
    rescueStatus = 'ATTENTION_NEEDED'
  }

  return c.json({
    status: rescueStatus,
    actions: uniqueCards,
    totalActions: uniqueCards.length,
    criticalCount,
    urgentCount,
    summary: uniqueCards.length === 0
      ? 'All applications are up to date and no urgent deadlines require attention.'
      : `${uniqueCards.length} prioritized action(s) identified to safeguard your scholarship opportunities.`
  })
})

export default rescue
