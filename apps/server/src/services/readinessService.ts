import { prisma } from '../lib/prisma.js'
import { EligibilityEngine } from '../lib/EligibilityEngine.js'

export interface BlockingError {
  code: string
  message: string
  action: string
  link: string
}

export interface Warning {
  code: string
  message: string
  action?: string
  link?: string
}

export interface RequirementItem {
  id: string
  label: string
  category: 'PROFILE' | 'DOCUMENT' | 'FORM_FIELD' | 'DECLARATION'
  isMandatory: boolean
  isSatisfied: boolean
  statusText: string
  actionUrl?: string
  documentType?: string
  documentId?: string
}

export interface ReadinessResult {
  scholarshipId: string
  scholarshipName: string
  applicationId: string | null
  applicationStatus: string | null
  readinessPercentage: number
  canSubmit: boolean
  isEligible: boolean
  eligibilityScore: number
  eligibilitySummary: string
  isDeadlinePassed: boolean
  deadlineFormatted: string
  blockingErrors: BlockingError[]
  warnings: Warning[]
  completedRequirements: RequirementItem[]
  missingRequirements: RequirementItem[]
  recommendedNextAction: {
    title: string
    description: string
    actionText: string
    link: string
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  } | null
}

export class ReadinessService {
  /**
   * Authoritative calculation of application readiness and pre-submission validation.
   * Separates eligibility criteria from application completeness.
   */
  static async evaluateReadiness(userId: string, scholarshipId: string, applicationId?: string): Promise<ReadinessResult> {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        requiredDocuments: true
      }
    })

    if (!scholarship) {
      throw new Error('Scholarship not found')
    }

    // 1. Fetch user profile, family info, academic records, and documents
    const [profile, familyInfo, academicRecords, userDocs] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.familyInfo.findUnique({ where: { userId } }),
      prisma.academicRecord.findMany({ where: { userId } }),
      prisma.document.findMany({ where: { userId } })
    ])

    // 2. Fetch application if exists
    let application = null
    if (applicationId) {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          documents: { include: { document: true } },
          formData: true
        }
      })
    } else {
      application = await prisma.application.findUnique({
        where: { userId_scholarshipId: { userId, scholarshipId } },
        include: {
          documents: { include: { document: true } },
          formData: true
        }
      })
    }

    // 3. Evaluate eligibility via canonical EligibilityEngine
    let isEligible = true
    let eligibilityScore = 100
    let eligibilitySummary = 'Eligible based on scheme rules'

    try {
      const eligibilityReport = await EligibilityEngine.evaluate(userId, scholarshipId)
      isEligible = eligibilityReport.isEligible
      const failed = eligibilityReport.rulesEvaluated.filter(r => !r.passed)
      eligibilityScore = eligibilityReport.rulesEvaluated.length > 0
        ? Math.round(((eligibilityReport.rulesEvaluated.length - failed.length) / eligibilityReport.rulesEvaluated.length) * 100)
        : 100
      eligibilitySummary = isEligible
        ? 'You satisfy the basic scheme eligibility criteria.'
        : `Eligibility criteria not met (${failed.length} conditions unmet).`
    } catch (err) {
      console.error('Eligibility evaluation fallback:', err)
    }

    const blockingErrors: BlockingError[] = []
    const warnings: Warning[] = []
    const allRequirements: RequirementItem[] = []

    // 4. Check Deadline
    const now = new Date()
    const deadline = new Date(scholarship.deadline)
    const isDeadlinePassed = now.getTime() > deadline.getTime()
    const deadlineFormatted = scholarship.deadline.toISOString().slice(0, 10)

    if (isDeadlinePassed) {
      blockingErrors.push({
        code: 'DEADLINE_PASSED',
        message: `The application deadline (${deadlineFormatted}) has expired.`,
        action: 'View other scholarships',
        link: '/scholarships'
      })
    }

    // 5. Evaluate Profile & Family Information
    const hasContact = Boolean(profile?.phone && profile?.domicileState && profile?.category)
    allRequirements.push({
      id: 'req-profile-contact',
      label: 'Personal & Domicile Details',
      category: 'PROFILE',
      isMandatory: true,
      isSatisfied: hasContact,
      statusText: hasContact ? 'Complete' : 'Incomplete personal details',
      actionUrl: '/profile'
    })
    if (!hasContact) {
      blockingErrors.push({
        code: 'INCOMPLETE_PERSONAL_INFO',
        message: 'Personal contact, category, and domicile state must be filled in your profile.',
        action: 'Complete Profile',
        link: '/profile'
      })
    }

    const hasFamily = Boolean(familyInfo?.annualFamilyIncome !== undefined && familyInfo?.annualFamilyIncome !== null)
    allRequirements.push({
      id: 'req-family-income',
      label: 'Annual Family Income',
      category: 'PROFILE',
      isMandatory: true,
      isSatisfied: hasFamily,
      statusText: hasFamily ? `₹${(familyInfo?.annualFamilyIncome || 0).toLocaleString('en-IN')}` : 'Missing annual income',
      actionUrl: '/profile'
    })
    if (!hasFamily) {
      blockingErrors.push({
        code: 'MISSING_FAMILY_INCOME',
        message: 'Annual family income declaration is required.',
        action: 'Update Family Info',
        link: '/profile'
      })
    }

    const hasAcademics = academicRecords.length > 0
    allRequirements.push({
      id: 'req-academics',
      label: 'Academic Performance History',
      category: 'PROFILE',
      isMandatory: true,
      isSatisfied: hasAcademics,
      statusText: hasAcademics ? `${academicRecords.length} record(s) on file` : 'No academic records added',
      actionUrl: '/profile'
    })
    if (!hasAcademics) {
      blockingErrors.push({
        code: 'MISSING_ACADEMICS',
        message: 'At least one academic marksheet or degree record is required.',
        action: 'Add Academic Record',
        link: '/profile'
      })
    }

    // 6. Evaluate Required Documents
    const reqDocs = scholarship.requiredDocuments
    for (const rd of reqDocs) {
      // Find attached document in application, or existing document in vault
      const attachedDoc = application?.documents?.find((d: any) => d.requiredDocumentId === rd.id)?.document
      const vaultMatch = userDocs.find(d => d.type === rd.documentType)
      const doc = attachedDoc || vaultMatch

      const isUploaded = Boolean(doc)
      const isExpired = doc?.status === 'EXPIRED' || (doc?.expiryDate && new Date(doc.expiryDate).getTime() < now.getTime())
      
      let isExpiringSoon = false
      if (doc?.expiryDate && !isExpired) {
        const diffDays = Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 30 && diffDays > 0) {
          isExpiringSoon = true
        }
      }

      const isRejected = doc?.status === 'REJECTED'
      const isSatisfied = isUploaded && !isExpired && !isRejected

      let statusText = 'Missing'
      if (isSatisfied) {
        statusText = doc?.status === 'VERIFIED' ? 'Verified' : 'Attached'
        if (isExpiringSoon) statusText += ' (Expiring soon)'
      } else if (isExpired) {
        statusText = 'Expired'
      } else if (isRejected) {
        statusText = 'Rejected'
      }

      allRequirements.push({
        id: `req-doc-${rd.id}`,
        label: rd.label,
        category: 'DOCUMENT',
        isMandatory: !rd.isOptional,
        isSatisfied,
        statusText,
        actionUrl: '/documents',
        documentType: rd.documentType,
        documentId: doc?.id
      })

      if (!rd.isOptional) {
        if (!isUploaded) {
          blockingErrors.push({
            code: `MISSING_DOC_${rd.documentType}`,
            message: `Mandatory document "${rd.label}" is missing from vault.`,
            action: `Upload ${rd.label}`,
            link: '/documents'
          })
        } else if (isExpired) {
          blockingErrors.push({
            code: `EXPIRED_DOC_${rd.documentType}`,
            message: `Your "${rd.label}" has expired and must be renewed before submission.`,
            action: `Replace ${rd.label}`,
            link: '/documents'
          })
        } else if (isRejected) {
          blockingErrors.push({
            code: `REJECTED_DOC_${rd.documentType}`,
            message: `Your "${rd.label}" was rejected: ${doc.rejectionReason || 'Requirements not met'}.`,
            action: `Re-upload ${rd.label}`,
            link: '/documents'
          })
        }
      }

      if (isExpiringSoon) {
        warnings.push({
          code: `DOC_EXPIRING_SOON_${rd.documentType}`,
          message: `Your "${rd.label}" expires on ${new Date(doc!.expiryDate!).toISOString().slice(0, 10)}. Please ensure renewal.`,
          action: 'View Document',
          link: '/documents'
        })
      }

      if (rd.isOptional && !isUploaded) {
        warnings.push({
          code: `OPTIONAL_DOC_NOT_PROVIDED_${rd.documentType}`,
          message: `Optional document "${rd.label}" has not been provided. Adding it may strengthen your application.`
        })
      }
    }

    // 7. Calculate Deterministic Readiness Score
    const mandatoryReqs = allRequirements.filter(r => r.isMandatory)
    const satisfiedMandatoryCount = mandatoryReqs.filter(r => r.isSatisfied).length
    const optionalReqs = allRequirements.filter(r => !r.isMandatory)
    const satisfiedOptionalCount = optionalReqs.filter(r => r.isSatisfied).length

    // Weighted scoring: 85% for mandatory completeness, 15% bonus for optional documents/polish
    let readinessScore = 0
    if (mandatoryReqs.length > 0) {
      const mandatoryPercent = (satisfiedMandatoryCount / mandatoryReqs.length) * 85
      const optionalPercent = optionalReqs.length > 0 ? (satisfiedOptionalCount / optionalReqs.length) * 15 : 15
      readinessScore = Math.round(mandatoryPercent + optionalPercent)
    } else {
      readinessScore = 100
    }

    if (readinessScore > 100) readinessScore = 100

    const canSubmit = blockingErrors.length === 0 && !isDeadlinePassed && (!application || application.status === 'DRAFT')

    // 8. Determine Recommended Next Action
    let recommendedNextAction = null
    const missingMandatory = mandatoryReqs.filter(r => !r.isSatisfied)

    if (isDeadlinePassed) {
      recommendedNextAction = {
        title: 'Deadline Expired',
        description: 'This scheme has closed for submissions. Explore active scholarships matching your profile.',
        actionText: 'Browse Active Schemes',
        link: '/scholarships',
        priority: 'LOW' as const
      }
    } else if (missingMandatory.length > 0) {
      const topMissing = missingMandatory[0]
      const isUrgent = scholarship.deadline && Math.ceil((new Date(scholarship.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 5
      recommendedNextAction = {
        title: topMissing.category === 'DOCUMENT' ? `Upload ${topMissing.label}` : `Complete ${topMissing.label}`,
        description: `Your application is ${readinessScore}% ready. Fulfilling this requirement directly unblocks submission.`,
        actionText: topMissing.category === 'DOCUMENT' ? 'Open Vault' : 'Complete Information',
        link: topMissing.actionUrl || '/documents',
        priority: isUrgent ? ('URGENT' as const) : ('HIGH' as const)
      }
    } else if (canSubmit) {
      recommendedNextAction = {
        title: 'Ready for Final Submission',
        description: 'All mandatory requirements and documents are verified and attached. Review declarations and submit.',
        actionText: 'Review & Submit',
        link: application ? `/applications/${application.id}` : `/scholarships/${scholarship.id}`,
        priority: 'HIGH' as const
      }
    }

    return {
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      applicationId: application?.id ?? null,
      applicationStatus: application?.status ?? null,
      readinessPercentage: readinessScore,
      canSubmit,
      isEligible,
      eligibilityScore,
      eligibilitySummary,
      isDeadlinePassed,
      deadlineFormatted,
      blockingErrors,
      warnings,
      completedRequirements: allRequirements.filter(r => r.isSatisfied),
      missingRequirements: allRequirements.filter(r => !r.isSatisfied),
      recommendedNextAction
    }
  }
}
