import { prisma } from './prisma.js'
import { 
  StudentProfile, 
  AcademicRecord, 
  FamilyInfo, 
  EligibilityRule, 
  RuleType,
  DocumentStatus
} from '@prisma/client'

export interface RuleEvaluationResult {
  ruleId: string;
  ruleType: RuleType;
  passed: boolean;
  reason: string;
}

export interface DocumentEvaluationResult {
  requiredDocumentId: string;
  documentType: string;
  label: string;
  status: 'MISSING' | 'PENDING' | 'REJECTED' | 'VERIFIED';
  documentId?: string;
}

export interface EligibilityReport {
  isEligible: boolean;
  rulesEvaluated: RuleEvaluationResult[];
  documentsEvaluated: DocumentEvaluationResult[];
  hasAllVerifiedDocuments: boolean;
}

export class EligibilityEngine {
  /**
   * Evaluates if a student is eligible for a given scholarship.
   */
  static async evaluate(userId: string, scholarshipId: string): Promise<EligibilityReport> {
    // 1. Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        familyInfo: true,
        academicRecords: true,
        documents: true,
      }
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // 2. Fetch scholarship with rules & document requirements
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        eligibilityRules: true,
        requiredDocuments: true,
      }
    })

    if (!scholarship) {
      throw new Error(`Scholarship not found: ${scholarshipId}`)
    }

    const profile = user.studentProfile
    const family = user.familyInfo
    const academics = user.academicRecords
    const userDocs = user.documents

    const rulesEvaluated: RuleEvaluationResult[] = []

    // 3. Evaluate eligibility rules
    for (const rule of scholarship.eligibilityRules) {
      const evaluation = this.evaluateRule(rule, profile, family, academics)
      rulesEvaluated.push(evaluation)
    }

    // Determine eligibility based on mandatory rules
    const isEligible = rulesEvaluated.every(r => r.passed)

    // 4. Evaluate document requirements
    const documentsEvaluated: DocumentEvaluationResult[] = []

    for (const reqDoc of scholarship.requiredDocuments) {
      // Find user document matching this required type
      const matchingUserDoc = userDocs.find(d => d.type === reqDoc.documentType)

      let docStatus: DocumentEvaluationResult['status'] = 'MISSING'
      let docId: string | undefined

      if (matchingUserDoc) {
        docId = matchingUserDoc.id
        if (matchingUserDoc.status === DocumentStatus.VERIFIED) {
          docStatus = 'VERIFIED'
        } else if (matchingUserDoc.status === DocumentStatus.PENDING) {
          docStatus = 'PENDING'
        } else if (matchingUserDoc.status === DocumentStatus.REJECTED) {
          docStatus = 'REJECTED'
        } else if (matchingUserDoc.status === DocumentStatus.EXPIRED) {
          docStatus = 'REJECTED' // Treat expired as rejected/invalid
        }
      }

      documentsEvaluated.push({
        requiredDocumentId: reqDoc.id,
        documentType: reqDoc.documentType,
        label: reqDoc.label,
        status: docStatus,
        documentId: docId,
      })
    }

    const hasAllVerifiedDocuments = documentsEvaluated.every(d => d.status === 'VERIFIED')

    return {
      isEligible,
      rulesEvaluated,
      documentsEvaluated,
      hasAllVerifiedDocuments,
    }
  }

  private static evaluateRule(
    rule: EligibilityRule,
    profile: StudentProfile | null,
    family: FamilyInfo | null,
    academics: AcademicRecord[]
  ): RuleEvaluationResult {
    const result: RuleEvaluationResult = {
      ruleId: rule.id,
      ruleType: rule.ruleType,
      passed: false,
      reason: '',
    }

    if (!profile) {
      result.reason = 'Student profile is incomplete'
      return result
    }

    switch (rule.ruleType) {
      case RuleType.INCOME_MAX: {
        if (!family || family.annualFamilyIncome === null) {
          result.reason = 'Family income details are missing'
          return result
        }
        const val = rule.value as any
        const maxIncome = typeof val === 'object' && val !== null && 'value' in val ? val.value : (typeof val === 'object' && val !== null && 'max' in val ? val.max : Number(val))
        if (family.annualFamilyIncome <= maxIncome) {
          result.passed = true
          result.reason = `Annual income (₹${family.annualFamilyIncome}) is below or equal to ₹${maxIncome}`
        } else {
          result.reason = `Annual income (₹${family.annualFamilyIncome}) exceeds ₹${maxIncome}`
        }
        break
      }

      case RuleType.INCOME_MIN: {
        if (!family || family.annualFamilyIncome === null) {
          result.reason = 'Family income details are missing'
          return result
        }
        const val = rule.value as any
        const minIncome = typeof val === 'object' && val !== null && 'value' in val ? val.value : (typeof val === 'object' && val !== null && 'min' in val ? val.min : Number(val))
        if (family.annualFamilyIncome >= minIncome) {
          result.passed = true
          result.reason = `Annual income (₹${family.annualFamilyIncome}) meets or exceeds ₹${minIncome}`
        } else {
          result.reason = `Annual income (₹${family.annualFamilyIncome}) is below ₹${minIncome}`
        }
        break
      }

      case RuleType.CATEGORY: {
        const studentCategory = profile.category
        if (!studentCategory) {
          result.reason = 'Social category is missing'
          return result
        }
        const val = rule.value as any
        const categories = Array.isArray(val) ? val : (typeof val === 'object' && val !== null && 'values' in val ? val.values : [val])
        if (categories.includes(studentCategory)) {
          result.passed = true
          result.reason = `Student category (${studentCategory}) matches required: ${categories.join(', ')}`
        } else {
          result.reason = `Student category (${studentCategory}) does not match: ${categories.join(', ')}`
        }
        break
      }

      case RuleType.EDUCATION_LEVEL: {
        const currentAcademic = academics.find(a => a.isCurrentlyPursuing)
        if (!currentAcademic) {
          result.reason = 'Current education level details are missing'
          return result
        }
        const val = rule.value as any
        const levels = Array.isArray(val) ? val : (typeof val === 'object' && val !== null && 'values' in val ? val.values : [val])
        if (levels.includes(currentAcademic.level)) {
          result.passed = true
          result.reason = `Current education level (${currentAcademic.level}) matches required: ${levels.join(', ')}`
        } else {
          result.reason = `Current education level (${currentAcademic.level}) does not match: ${levels.join(', ')}`
        }
        break
      }

      case RuleType.MIN_PERCENTAGE: {
        const sortedAcademics = [...academics].sort((a, b) => {
          const order = ['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE']
          return order.indexOf(a.level) - order.indexOf(b.level)
        })
        const completedAcademics = sortedAcademics.filter(a => !a.isCurrentlyPursuing)
        const highestCompleted = completedAcademics[completedAcademics.length - 1]

        if (!highestCompleted || highestCompleted.percentage === null) {
          result.reason = 'No completed academic records found to verify marks'
          return result
        }

        const val = rule.value as any
        const minPercentage = typeof val === 'object' && val !== null && 'value' in val ? val.value : (typeof val === 'object' && val !== null && 'minPercentage' in val ? val.minPercentage : Number(val))

        if (highestCompleted.percentage >= minPercentage) {
          result.passed = true
          result.reason = `Latest completed percentage (${highestCompleted.percentage}%) meets minimum requirement of ${minPercentage}%`
        } else {
          result.reason = `Latest completed percentage (${highestCompleted.percentage}%) is below minimum requirement of ${minPercentage}%`
        }
        break
      }

      case RuleType.MIN_CGPA: {
        const sortedAcademics = [...academics].sort((a, b) => {
          const order = ['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE']
          return order.indexOf(a.level) - order.indexOf(b.level)
        })
        const completedAcademics = sortedAcademics.filter(a => !a.isCurrentlyPursuing)
        const highestCompleted = completedAcademics[completedAcademics.length - 1]

        if (!highestCompleted || highestCompleted.cgpa === null) {
          result.reason = 'No completed academic records found with CGPA to verify'
          return result
        }

        const val = rule.value as any
        const minCGPA = typeof val === 'object' && val !== null && 'value' in val ? val.value : (typeof val === 'object' && val !== null && 'minCGPA' in val ? val.minCGPA : Number(val))

        if (highestCompleted.cgpa >= minCGPA) {
          result.passed = true
          result.reason = `Latest completed CGPA (${highestCompleted.cgpa}) meets minimum requirement of ${minCGPA}`
        } else {
          result.reason = `Latest completed CGPA (${highestCompleted.cgpa}) is below minimum requirement of ${minCGPA}`
        }
        break
      }

      case RuleType.STATE: {
        const studentState = profile.domicileState
        if (!studentState) {
          result.reason = 'Domicile state is missing'
          return result
        }
        const val = rule.value as any
        const statesList: string[] = Array.isArray(val) ? val : [String(val)]
        if (statesList.map(s => String(s).toLowerCase()).includes(studentState.toLowerCase())) {
          result.passed = true
          result.reason = `Domicile state (${studentState}) matches required state(s)`
        } else {
          result.reason = `Domicile state (${studentState}) does not match: ${statesList.join(', ')}`
        }
        break
      }

      case RuleType.GENDER: {
        const studentGender = profile.gender
        if (!studentGender) {
          result.reason = 'Gender details are missing'
          return result
        }
        if (studentGender === rule.value) {
          result.passed = true
          result.reason = `Gender (${studentGender}) meets requirements`
        } else {
          result.reason = `Gender (${studentGender}) does not match required: ${rule.value}`
        }
        break
      }

      case RuleType.MINORITY: {
        const isMinority = profile.isMinority
        const religion = profile.religion
        
        if (rule.value === true) {
          if (isMinority) {
            result.passed = true
            result.reason = 'Student belongs to a minority community'
          } else {
            result.reason = 'Scholarship is reserved for minority communities'
          }
        } else if (typeof rule.value === 'string' && religion) {
          if (religion.toLowerCase() === rule.value.toLowerCase()) {
            result.passed = true
            result.reason = `Religion (${religion}) meets requirements`
          } else {
            result.reason = `Religion (${religion}) does not match: ${rule.value}`
          }
        } else {
          result.reason = 'Minority details on student profile do not match rules'
        }
        break
      }

      case RuleType.DISABILITY: {
        if (profile.hasDisability === true) {
          result.passed = true
          result.reason = 'Student belongs to PwD category (specially-abled)'
        } else {
          result.reason = 'Scholarship is reserved for specially-abled students'
        }
        break
      }

      default: {
        result.reason = `Unknown rule type: ${rule.ruleType}`
        break
      }
    }

    return result
  }
}
