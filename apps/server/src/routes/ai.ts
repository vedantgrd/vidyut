import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { aiAssistSchema } from '../validators/schemas.js'
import { evaluateEligibility } from '../services/eligibilityEngine.js'
import type { DbEligibilityRule, StudentEligibilityProfile, DbAcademicRecord } from '../types/index.js'

const ai = new Hono<{ Variables: { userId: string; role: string } }>()
ai.use('*', authMiddleware)

async function getStudentContext(userId: string) {
  const [user, p, fi, ar, docs, apps, tasks, scholarships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true }
    }),
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.familyInfo.findUnique({ where: { userId } }),
    prisma.academicRecord.findMany({ where: { userId }, orderBy: { level: 'asc' } }),
    prisma.document.findMany({ where: { userId } }),
    prisma.application.findMany({
      where: { userId },
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            amount: true,
            paymentType: true,
            deadline: true,
            installments: { orderBy: { installmentNo: 'asc' } }
          }
        },
        disbursements: { orderBy: { createdAt: 'asc' }, include: { installment: true } }
      }
    }),
    prisma.studentTask.findMany({
      where: { userId, isCompleted: false },
      orderBy: { dueDate: 'asc' }
    }),
    prisma.scholarship.findMany({
      where: { status: 'ACTIVE' },
      include: {
        eligibilityRules: true,
        requiredDocuments: true,
        installments: { orderBy: { installmentNo: 'asc' } }
      },
      orderBy: { deadline: 'asc' }
    })
  ])

  const sp: StudentEligibilityProfile | null = p ? {
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    category: p.category,
    domicileState: p.domicileState,
    hasDisability: p.hasDisability,
    isMinority: p.isMinority,
    religion: p.religion,
    annualFamilyIncome: fi?.annualFamilyIncome ?? null,
    academicRecords: ar as unknown as DbAcademicRecord[]
  } : null

  return { user, p, fi, ar, docs, apps, tasks, scholarships, sp }
}

ai.post('/assist', zValidator('json', aiAssistSchema), async (c) => {
  const userId = c.get('userId')
  const { message, context, scholarshipId } = c.req.valid('json')
  const ctx = await getStudentContext(userId)

  const rawMsg = (message || '').trim()
  // Clean punctuation and normalize spacing for robust intent classification
  const q = rawMsg.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ').replace(/\s+/g, ' ').trim()
  const studentName = ctx.user?.fullName?.split(' ')[0] || 'there'

  // =========================================================================
  // 1. SPECIFIC SCHOLARSHIP CONTEXT (e.g. from a Scholarship Detail view)
  // =========================================================================
  if (scholarshipId) {
    const s = ctx.scholarships.find(item => item.id === scholarshipId) || await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        eligibilityRules: true,
        requiredDocuments: true,
        installments: { orderBy: { installmentNo: 'asc' } }
      }
    })

    if (s) {
      // Installments / Disbursements for this specific scholarship
      if (q.includes('disburs') || q.includes('install') || q.includes('payment') || q.includes('money') || q.includes('payout') || q.includes('dbt') || q.includes('tranche')) {
        if (s.paymentType === 'INSTALLMENTS' && s.installments.length > 0) {
          const instList = s.installments.map(i => `• Installment ${i.installmentNo}: ₹${i.amount.toLocaleString('en-IN')}${i.name ? ` (${i.name})` : ''}${i.description ? ` — ${i.description}` : ''}`).join('\n')
          return c.json({
            response: `"${s.name}" provides total funding of ₹${s.amount.toLocaleString('en-IN')} disbursed in ${s.installments.length} Direct Benefit Transfer (DBT) tranches:\n\n${instList}\n\nFunds are credited directly to your Aadhaar-linked bank account upon verification of academic progression milestones.`,
            context
          })
        } else {
          return c.json({
            response: `"${s.name}" provides a one-time financial grant of ₹${s.amount.toLocaleString('en-IN')}. Upon committee approval, the full amount is released via DBT directly into your verified bank account.`,
            context
          })
        }
      }

      // Documents required for this specific scholarship
      if (q.includes('document') || context === 'document_explain' || q.includes('upload') || q.includes('vault') || q.includes('require')) {
        const req = s.requiredDocuments.filter(d => !d.isOptional)
        const ownedTypes = new Set(ctx.docs.map(d => d.type))
        const have = req.filter(d => ownedTypes.has(d.documentType))
        const missing = req.filter(d => !ownedTypes.has(d.documentType))
        let reply = `Document requirements for "${s.name}":\n\n• Required: ${req.map(d => d.label).join(', ')}.`
        if (have.length > 0) {
          reply += `\n\n✓ Already in your Vault: ${have.map(d => d.label).join(', ')} — these will auto-link with 1 click!`
        }
        if (missing.length > 0) {
          reply += `\n\n○ Still needed: ${missing.map(d => d.label).join(', ')}. Upload them once to your Document Vault to proceed.`
        }
        return c.json({ response: reply, context })
      }

      // Eligibility check for this specific scholarship
      if (q.includes('eligib') || context === 'eligibility' || q.includes('qualif') || q.includes('why') || q.includes('can i apply')) {
        if (!ctx.sp) {
          return c.json({ response: 'Please complete your profile first so I can evaluate your eligibility for this scholarship.', context })
        }
        const res = evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp)
        if (res.isEligible) {
          return c.json({
            response: `Great news, ${studentName}! You are eligible for "${s.name}" with a ${res.matchScore}% match score.\n\nAll eligibility criteria (merit percentage, family income, and reservation category) match your saved profile. You can apply directly with 1 click!`,
            context
          })
        } else {
          const reasons = res.failedRules.filter(r => r.isRequired).map(r => r.description).filter(Boolean)
          const reasonText = reasons.length > 0 ? reasons.join('\n• ') : 'One or more mandatory rules do not match your current profile.'
          return c.json({
            response: `You currently do not meet the criteria for "${s.name}":\n\n• ${reasonText}\n\nIf any information has changed (such as recent exam scores or income certificate updates), update your Profile to re-evaluate.`,
            context
          })
        }
      }

      // Deadline question for this specific scholarship
      if (q.includes('deadline') || q.includes('last date') || q.includes('when')) {
        const deadlineDate = new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return c.json({
          response: `The application deadline for "${s.name}" is ${deadlineDate} (${daysLeft > 0 ? `${daysLeft} day(s) remaining` : 'deadline passed'}). Submit your application before the closing date to avoid missing out!`,
          context
        })
      }
    }
  }

  // =========================================================================
  // 2. CAPABILITIES / WHAT CAN YOU DO / HELP
  // =========================================================================
  const isHelpQuery = (
    q === 'what can you do' ||
    q.includes('what can you do') ||
    q.includes('what do you do') ||
    q.includes('who are you') ||
    q.includes('how can you help') ||
    q.includes('capabilities') ||
    q.includes('help me') ||
    q === 'help' ||
    q === 'commands' ||
    q === 'guide'
  )

  if (isHelpQuery) {
    return c.json({
      response: `I'm your **Vidyut Scholarship Intelligence Assistant**, connected directly to your candidate dossier, document vault, deadline calendar, and DBT treasury.

Here is what you can ask me:

🎯 **1. Eligibility & Matching**
• *"Explain my eligibility"* — get an in-depth breakdown of which scholarships you qualify for and why based on your income, domicile, category, and marks.
• *"Which scholarships do I qualify for?"* — see your ranked matches.

📁 **2. Document Vault & Readiness**
• *"Are my vault documents complete?"* — check which certificates you have uploaded and if anything is missing.
• *"Do I have my income certificate verified?"* — inspect credential verification statuses.

💸 **3. DBT & Installments**
• *"Show my installment payouts"* — view disbursed funds, bank UTR reference numbers, and scheduled future tranches.
• *"When will I get paid?"* — check payout timelines.

📝 **4. Application Tracking**
• *"What is the status of my applications?"* — track review milestones, officer remarks, and approvals.

📅 **5. Deadlines & Rescue Mode**
• *"What deadlines are coming up?"* — see approaching closing dates and urgent actions needed.

🔍 **6. Specific Scholarships**
• *"Tell me about Tata Capital Pankh"* or *"How does Vidyut Education Support pay?"*

Click or type any of the questions above to get started!`,
      context
    })
  }

  // =========================================================================
  // 3. ELIGIBILITY & SCHOLARSHIP MATCHING (e.g. "Explain my eligibility")
  // =========================================================================
  const isEligibilityQuery = (
    q.includes('eligib') || // catches eligible, eligibility, ineligible
    q.includes('qualif') || // catches qualify, qualified, qualification
    q.includes('match') ||
    q.includes('criteria') ||
    q.includes('fit') ||
    q.includes('can i apply') ||
    q.includes('am i eligible') ||
    q.includes('which scholarship') ||
    q.includes('recommend') ||
    (q.includes('why') && (q.includes('apply') || q.includes('get') || q.includes('scholarship')))
  )

  if (isEligibilityQuery) {
    if (!ctx.sp) {
      return c.json({
        response: `To evaluate your eligibility, I need your academic and socio-economic details. Please visit the **Profile** tab to enter your category, domicile state, annual family income, and academic marks. Once entered, I'll calculate your exact match scores across all national and state schemes!`,
        context
      })
    }

    // Check if the query asks about a specific named scholarship (e.g. "tata", "vidyut", "reliance", "pragati")
    const specificMatch = ctx.scholarships.find(s =>
      q.includes(s.name.toLowerCase()) ||
      (s.slug && q.includes(s.slug.toLowerCase())) ||
      (s.provider && q.includes(s.provider.toLowerCase()))
    )

    if (specificMatch) {
      const res = evaluateEligibility(specificMatch.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp)
      if (res.isEligible) {
        const instText = specificMatch.paymentType === 'INSTALLMENTS' ? ` (disbursed in ${specificMatch.installments.length} DBT installments)` : ' (one-time grant)'
        return c.json({
          response: `Yes, ${studentName}! You are eligible for **${specificMatch.name}** with a **${res.matchScore}% match score**.\n\n• **Grant Amount**: ₹${specificMatch.amount.toLocaleString('en-IN')}${instText}\n• **Provider**: ${specificMatch.provider}\n• **Criteria Satisfied**: All academic cutoffs, income limits, and domicile requirements match your profile.\n\nYou can apply directly with 1 click using your saved Vidyut Document Vault!`,
          context
        })
      } else {
        const failed = res.failedRules.filter(r => r.isRequired).map(r => r.description).filter(Boolean)
        const reasons = failed.length > 0 ? failed.join('\n• ') : 'Some requirements do not match your current profile.'
        return c.json({
          response: `You are currently not eligible for **${specificMatch.name}**. Here is the criteria breakdown:\n\n• ${reasons}\n\nIf your family income, domicile, or exam marks have been updated recently, revise your **Profile** to re-evaluate.`,
          context
        })
      }
    }

    // Comprehensive general eligibility diagnosis across all scholarships
    const eligibleList: { sch: typeof ctx.scholarships[0]; res: ReturnType<typeof evaluateEligibility> }[] = []
    const ineligibleList: { sch: typeof ctx.scholarships[0]; reasons: string[] }[] = []

    for (const sch of ctx.scholarships) {
      const res = evaluateEligibility(sch.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp)
      if (res.isEligible) {
        eligibleList.push({ sch, res })
      } else {
        const reasons = res.failedRules.filter(r => r.isRequired).map(r => r.description).filter(Boolean) as string[]
        ineligibleList.push({ sch, reasons })
      }
    }

    // Format best academic record summary
    const bestAcademic = ctx.ar.length > 0
      ? ctx.ar.map(a => `${a.level.replace('_', ' ')}: ${a.percentage ? `${a.percentage}%` : (a.cgpa ? `${a.cgpa} CGPA` : 'Recorded')}`).join(', ')
      : 'No academic records'

    const incomeStr = ctx.fi?.annualFamilyIncome ? `₹${ctx.fi.annualFamilyIncome.toLocaleString('en-IN')}` : 'Not specified'

    let reply = `Here is your detailed **Eligibility & Scholarship Matching Assessment**:\n\n`
    reply += `👤 **Your Profile Basis**:\n`
    reply += `• Social Category: ${ctx.p?.category || 'General'}\n`
    reply += `• Domicile State: ${ctx.p?.domicileState || 'All-India'}\n`
    reply += `• Annual Family Income: ${incomeStr}\n`
    reply += `• Academic Merit: ${bestAcademic}\n\n`

    if (eligibleList.length > 0) {
      reply += `🎯 **You Qualify for ${eligibleList.length} Active Scholarships**:\n`
      eligibleList.slice(0, 4).forEach((item, idx) => {
        const instInfo = item.sch.paymentType === 'INSTALLMENTS' && item.sch.installments.length > 0
          ? ` (${item.sch.installments.length} DBT installments)`
          : ' (One-time grant)'
        reply += `${idx + 1}. **${item.sch.name}** (${item.sch.provider})\n`
        reply += `   • Award: ₹${item.sch.amount.toLocaleString('en-IN')}${instInfo} | Match: **${item.res.matchScore}%**\n`
        // Show up to 2 passed reasons
        const passedSample = item.res.passedRules.map(r => r.description).filter(Boolean).slice(0, 2)
        if (passedSample.length > 0) {
          reply += `   • Why you qualify: ${passedSample.join('; ')}\n`
        }
      })

      if (eligibleList.length > 4) {
        reply += `\n*...and ${eligibleList.length - 4} more scheme(s) in your Scholarships tab.*\n`
      }
    } else {
      reply += `⚠️ **No Active Schemes Currently Match 100% of Your Criteria**.\n`
      if (ineligibleList.length > 0) {
        reply += `Top reasons why available scholarships were not matched:\n`
        ineligibleList.slice(0, 2).forEach(item => {
          reply += `• **${item.sch.name}**: ${item.reasons.slice(0, 2).join('; ') || 'Criteria not met'}\n`
        })
      }
    }

    // Vault readiness status
    const verifiedDocsCount = ctx.docs.filter(d => d.status === 'VERIFIED').length
    reply += `\n📁 **Vault Readiness**: You have ${ctx.docs.length} document(s) uploaded (${verifiedDocsCount} verified). Once ready, you can submit to all eligible scholarships with 1 click without re-uploading documents!`

    return c.json({ response: reply, context })
  }

  // =========================================================================
  // 4. FUND DISBURSEMENTS, INSTALLMENTS & DBT TRACKING
  // =========================================================================
  const isDbtQuery = (
    q.includes('disburs') ||
    q.includes('installment') ||
    q.includes('dbt') ||
    q.includes('bank') ||
    q.includes('payout') ||
    q.includes('money') ||
    q.includes('payment') ||
    q.includes('receive fund') ||
    q.includes('stipend') ||
    q.includes('tranche') ||
    q.includes('utr') ||
    q.includes('when will i get') ||
    q.includes('fund')
  )

  if (isDbtQuery) {
    const approvedApps = ctx.apps.filter(a => a.status === 'APPROVED')
    const totalApproved = approvedApps.reduce((sum, a) => sum + a.scholarship.amount, 0)
    let totalDisbursed = 0
    const disbursementItems: string[] = []

    for (const a of approvedApps) {
      const disb = a.disbursements.filter(d => d.status === 'DISBURSED')
      for (const d of disb) {
        totalDisbursed += d.amount
        const dateStr = d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recorded'
        disbursementItems.push(`• **₹${d.amount.toLocaleString('en-IN')}** (Ref: \`${d.referenceCode || 'DBT-CONFIRMED'}\`) for ${a.scholarship.name} on ${dateStr}`)
      }
    }

    const pendingDisbursed = Math.max(0, totalApproved - totalDisbursed)

    if (approvedApps.length > 0) {
      let reply = `Here is your **Direct Benefit Transfer (DBT) Treasury Summary**:\n\n`
      reply += `• **Total Approved Aid**: ₹${totalApproved.toLocaleString('en-IN')}\n`
      reply += `• **Disbursed to Bank Account**: ₹${totalDisbursed.toLocaleString('en-IN')}\n`
      reply += `• **Pending Future Tranches**: ₹${pendingDisbursed.toLocaleString('en-IN')}\n\n`

      if (disbursementItems.length > 0) {
        reply += `💳 **Processed Bank Disbursements**:\n${disbursementItems.join('\n')}\n\n`
      }

      // Check upcoming installments
      const upcoming: string[] = []
      for (const a of approvedApps) {
        if (a.scholarship.paymentType === 'INSTALLMENTS' && a.scholarship.installments) {
          const disbursedNos = new Set(a.disbursements.filter(d => d.status === 'DISBURSED').map(d => d.installmentNo).filter(Boolean))
          for (const inst of a.scholarship.installments) {
            if (!disbursedNos.has(inst.installmentNo)) {
              upcoming.push(`• **${a.scholarship.name}** — Installment ${inst.installmentNo}: ₹${inst.amount.toLocaleString('en-IN')}${inst.name ? ` (${inst.name})` : ''}`)
            }
          }
        }
      }

      if (upcoming.length > 0) {
        reply += `⏳ **Upcoming Scheduled Installments**:\n${upcoming.join('\n')}\n\n`
      }

      reply += `💡 **DBT Note**: All scholarship tranches are wired directly to your Aadhaar-linked bank account without intermediaries.`
      return c.json({ response: reply, context })
    } else {
      return c.json({
        response: `You do not have any approved scholarship disbursements yet.\n\nOnce your submitted application is reviewed and approved by the scholarship committee:\n1. For **single grant** scholarships, the full amount is released via DBT directly to your bank account.\n2. For **multi-installment** scholarships (like Vidyut Education Support or MahaDBT), funds are released in staged tranches (e.g. 50% upon admission + 50% for 2nd semester).\n\nYou can track all future payouts, bank transaction UTR reference codes, and installment advice slips right here in Vidyut!`,
        context
      })
    }
  }

  // =========================================================================
  // 5. DOCUMENT VAULT & READINESS AUDIT
  // =========================================================================
  const isDocumentQuery = (
    q.includes('document') ||
    q.includes('vault') ||
    q.includes('upload') ||
    q.includes('aadhaar') ||
    q.includes('income cert') ||
    q.includes('marksheet') ||
    q.includes('certificate') ||
    q.includes('readiness') ||
    q.includes('preflight') ||
    q.includes('complete')
  )

  if (isDocumentQuery) {
    const verified = ctx.docs.filter(d => d.status === 'VERIFIED')
    const pending = ctx.docs.filter(d => d.status === 'PENDING')

    if (ctx.docs.length === 0) {
      return c.json({
        response: `You haven't uploaded any credentials to your **Vidyut Document Vault** yet.\n\nWith Vidyut, you upload each document **once**: Aadhaar Card, Income Certificate, and Marksheets. Our system verifies them and auto-attaches them to all future applications with 1 click!\n\nHead to the **Document Vault** tab to upload your first credential.`,
        context
      })
    }

    const docItems = ctx.docs.map(d => {
      const statusIcon = d.status === 'VERIFIED' ? '✓' : (d.status === 'REJECTED' ? '✕' : '⏳')
      return `• ${statusIcon} **${d.label}** (${d.status.toLowerCase()})`
    })

    let reply = `Here is your **Document Vault Audit**:\n\n`
    reply += `• Total Stored: **${ctx.docs.length}** document(s)\n`
    reply += `• Verified Credentials: **${verified.length}**\n`
    reply += `• Under Review / Pending: **${pending.length}**\n\n`
    reply += `📋 **Stored Credentials**:\n${docItems.join('\n')}\n\n`

    if (verified.length >= 3) {
      reply += `✨ **Readiness Status**: Excellent! Your essential credentials (identity, income, and academics) are verified. You can apply to all matched scholarships with zero paperwork delay!`
    } else {
      reply += `💡 **Tip**: Ensure you have uploaded your Aadhaar Card, Tahasildar Income Certificate, and latest Marksheets so scholarship officers can verify your application instantly.`
    }

    return c.json({ response: reply, context })
  }

  // =========================================================================
  // 6. APPLICATION STATUS TRACKING
  // =========================================================================
  const isAppQuery = (
    q.includes('application') ||
    q.includes('status') ||
    q.includes('track') ||
    q.includes('submitted') ||
    q.includes('under review') ||
    q.includes('approved') ||
    q.includes('rejected') ||
    q.includes('where is my')
  )

  if (isAppQuery) {
    if (ctx.apps.length === 0) {
      const eligibleCount = ctx.sp ? ctx.scholarships.filter(s => evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp!).isEligible).length : 0
      return c.json({
        response: `You haven't submitted any scholarship applications yet.\n\nGood news: based on your profile, you match **${eligibleCount} eligible scholarship(s)**! Head over to the **Scholarships** tab to review and submit with 1 click.`,
        context
      })
    }

    const list = ctx.apps.map(a => {
      const statusLabel = a.status.replace(/_/g, ' ')
      const dbtInfo = a.status === 'APPROVED'
        ? ` | DBT Disbursed: ₹${a.disbursements.filter(d => d.status === 'DISBURSED').reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}`
        : ''
      const notes = a.reviewerNotes ? `\n   *Officer Note: "${a.reviewerNotes}"*` : ''
      return `• **${a.scholarship.name}**\n   Status: \`${statusLabel}\`${dbtInfo}${notes}`
    }).join('\n\n')

    return c.json({
      response: `Here is the current review status of your **${ctx.apps.length} application(s)**:\n\n${list}\n\nClick on any application in your **Applications** tab to view the live verification timeline, document audit trails, and disbursement status.`,
      context
    })
  }

  // =========================================================================
  // 7. DEADLINES, CALENDAR & RESCUE MODE
  // =========================================================================
  const isDeadlineQuery = (
    q.includes('deadline') ||
    q.includes('last date') ||
    q.includes('closing date') ||
    q.includes('when to apply') ||
    q.includes('calendar') ||
    q.includes('rescue') ||
    q.includes('urgent') ||
    q.includes('task') ||
    q.includes('todo') ||
    q.includes('due') ||
    q.includes('agenda')
  )

  if (isDeadlineQuery) {
    const upcomingDeadlines = ctx.scholarships
      .map(s => {
        const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const dateStr = new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        return { name: s.name, dateStr, daysLeft }
      })
      .filter(d => d.daysLeft >= 0)
      .slice(0, 4)

    let reply = `📅 **Upcoming Scholarship Deadlines**:\n\n`
    if (upcomingDeadlines.length > 0) {
      reply += upcomingDeadlines.map(d => `• **${d.name}**: ${d.dateStr} (${d.daysLeft === 0 ? 'Due Today!' : `${d.daysLeft} day(s) left`})`).join('\n')
      reply += `\n\n`
    } else {
      reply += `No urgent application deadlines closing this week.\n\n`
    }

    if (ctx.tasks.length > 0) {
      reply += `🚨 **Pending Action Tasks (Deadline Rescue)**:\n`
      ctx.tasks.slice(0, 3).forEach(t => {
        const due = t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` : ''
        reply += `• [ ] ${t.title}${due}\n`
      })
      reply += `\nVisit the **Smart Calendar** to sync deadlines directly to Google Calendar or Apple Calendar with 1-click \`.ics\` export!`
    } else {
      reply += `✓ You have no pending urgent tasks. Check the **Smart Calendar** tab to view full monthly milestones!`
    }

    return c.json({ response: reply, context })
  }

  // =========================================================================
  // 8. SPECIFIC SCHOLARSHIP BY NAME IN GENERAL CHAT
  // =========================================================================
  const matchedNamedScholarship = ctx.scholarships.find(s => {
    const sName = s.name.toLowerCase()
    const sSlug = (s.slug || '').toLowerCase()
    const sProv = (s.provider || '').toLowerCase()
    return q.includes(sName) || q.includes(sSlug) || q.includes(sProv) || (sName.split(' ').some(w => w.length > 4 && q.includes(w)))
  })

  if (matchedNamedScholarship) {
    const s = matchedNamedScholarship
    const res = ctx.sp ? evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp) : null
    const deadlineDate = new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const daysLeft = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    let reply = `Here is information on **${s.name}**:\n\n`
    reply += `• **Provider**: ${s.provider}\n`
    reply += `• **Funding Amount**: ₹${s.amount.toLocaleString('en-IN')}${s.paymentType === 'INSTALLMENTS' ? ` (paid across ${s.installments.length} DBT installments)` : ' (one-time grant)'}\n`
    reply += `• **Application Deadline**: ${deadlineDate} (${daysLeft > 0 ? `${daysLeft} days left` : 'Passed'})\n`
    if (s.description) {
      reply += `• **Summary**: ${s.description.slice(0, 160)}...\n\n`
    }

    if (res) {
      if (res.isEligible) {
        reply += `🎯 **Your Eligibility**: You are **100% eligible** with a match score of **${res.matchScore}%**! All criteria match your profile.\n`
      } else {
        const failed = res.failedRules.filter(r => r.isRequired).map(r => r.description).filter(Boolean)
        reply += `⚠️ **Your Eligibility**: You currently do not meet all criteria:\n• ${failed.join('\n• ')}\n`
      }
    }

    reply += `\nYou can view full criteria and apply directly in the **Scholarships** tab!`
    return c.json({ response: reply, context })
  }

  // =========================================================================
  // 9. HOW VIDYUT WORKS / PLATFORM GUIDANCE
  // =========================================================================
  const isPlatformQuery = (
    q.includes('how to apply') ||
    q.includes('how it works') ||
    q.includes('what is vidyut') ||
    q.includes('how does it work') ||
    q.includes('change income') ||
    q.includes('change profile') ||
    q.includes('update profile')
  )

  if (isPlatformQuery) {
    return c.json({
      response: `**How Vidyut Works (The 4-Step Student Workflow)**:

1. **One Profile**: Enter your personal details, academic scores, and family income once in the **Profile** tab.
2. **One Document Vault**: Upload your Aadhaar Card, Income Certificate, and Marksheet once in the **Document Vault**. We verify them so you never have to re-upload.
3. **1-Click Apply**: Explore eligible scholarships in the **Scholarships** tab. Your saved credentials and prefilled dossier are attached automatically with 1 click!
4. **Transparent DBT Tracking**: Once approved, track Direct Benefit Transfer installments, bank UTR reference numbers, and payout dates in real time.

Need to update your details? Just click **Profile** to update income or marks anytime!`,
      context
    })
  }

  // =========================================================================
  // 10. GREETINGS (Only if short greeting without substantive question)
  // =========================================================================
  const isGreeting = (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'namaste' ||
    q === 'good morning' ||
    q === 'good afternoon' ||
    q === 'good evening' ||
    q === 'hi vidyut' ||
    q === 'hello vidyut'
  )

  if (isGreeting) {
    const eligibleCount = ctx.sp ? ctx.scholarships.filter(s => evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp!).isEligible).length : 0
    return c.json({
      response: `Hi ${studentName}! 👋 I'm your **Vidyut Scholarship Assistant**.

Here is a quick snapshot of your account:
• 🎯 **${eligibleCount} Eligible Scholarships** matching your current profile
• 📁 **${ctx.docs.length} Documents** saved in your vault (${ctx.docs.filter(d => d.status === 'VERIFIED').length} verified)
• 📝 **${ctx.apps.length} Applications** in review pipeline

What would you like to explore?
1. *"Explain my eligibility"* — see why you qualify for matched schemes
2. *"Are my vault documents complete?"* — audit your uploaded credentials
3. *"Show my installment payouts"* — view your DBT disbursements
4. *"What deadlines are coming up?"* — check upcoming dates`,
      context
    })
  }

  // =========================================================================
  // 11. INTELLIGENT CONTEXTUAL FALLBACK (Non-generic, avoids repeating loops)
  // =========================================================================
  const eligibleCount = ctx.sp ? ctx.scholarships.filter(s => evaluateEligibility(s.eligibilityRules as unknown as DbEligibilityRule[], ctx.sp!).isEligible).length : 0
  const verifiedCount = ctx.docs.filter(d => d.status === 'VERIFIED').length

  return c.json({
    response: `I'm not quite sure how to answer: *"${rawMsg}"*. 

Here is what I know about your Vidyut profile:
• 👤 **Profile**: ${ctx.user?.fullName || 'Student'}, ${ctx.p?.category || 'General'} category, ${ctx.p?.domicileState || 'All-India'}, Income: ₹${ctx.fi?.annualFamilyIncome?.toLocaleString('en-IN') || 'N/A'}
• 🎯 **Eligible Matches**: **${eligibleCount}** scholarship(s) ready for 1-click submission
• 📁 **Document Vault**: **${ctx.docs.length}** document(s) uploaded (${verifiedCount} verified)
• 📝 **Active Applications**: **${ctx.apps.length}** in review pipeline

Try asking one of these questions instead:
• *"Explain my eligibility"*
• *"What can you do?"*
• *"Are my vault documents complete?"*
• *"Show my installment payouts"*
• *"What deadlines are coming up?"*`,
    context
  })
})

export default ai
