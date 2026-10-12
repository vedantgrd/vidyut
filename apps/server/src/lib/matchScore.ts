import type { DbScholarship, DbProfile } from '../types/index.js'

export interface LegacyScholarshipMatchCriteria {
  educationLevels?: string[]
  categories?: string[]
  maxIncome?: number | null
  minIncome?: number | null
  states?: string[]
  genderEligibility?: string | null
  minAge?: number | null
  maxAge?: number | null
  minCGPA?: number | null
  minPercentage?: number | null
}

export function computeMatchScore(
  scholarship: DbScholarship & LegacyScholarshipMatchCriteria,
  profile: DbProfile | null
): number {
  if (!profile) return 0

  let score = 0

  const eduLevels = scholarship.educationLevels ?? []
  if (
    eduLevels.length === 0 ||
    (profile.currentEducationLevel &&
      eduLevels.includes(profile.currentEducationLevel))
  ) score += 25

  const categories = scholarship.categories ?? []
  if (
    categories.length === 0 ||
    (profile.category && categories.includes(profile.category))
  ) score += 20

  const income = profile.annualFamilyIncome
  const maxInc = scholarship.maxIncome ?? null
  const minInc = scholarship.minIncome ?? null
  const noIncomeReq = maxInc === null && minInc === null
  const incomeOk =
    income !== null &&
    income !== undefined &&
    (maxInc === null || income <= maxInc) &&
    (minInc === null || income >= minInc)
  if (noIncomeReq || incomeOk) score += 15

  const states = scholarship.states ?? []
  if (
    states.length === 0 ||
    (profile.domicileState && states.includes(profile.domicileState))
  ) score += 15

  const genderReq = scholarship.genderEligibility ?? null
  if (
    genderReq === null ||
    (profile.gender && genderReq === profile.gender)
  ) score += 10

  const minAge = scholarship.minAge ?? null
  const maxAge = scholarship.maxAge ?? null
  if (profile.dateOfBirth) {
    const age = Math.floor((Date.now() - profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const ageOk =
      (minAge === null || age >= minAge) &&
      (maxAge === null || age <= maxAge)
    if (ageOk) score += 10
  } else {
    if (minAge === null && maxAge === null) score += 10
  }

  const cgpa = profile.ugCGPA
  const pct = profile.twelfthPercentage
  const minCGPA = scholarship.minCGPA ?? null
  const minPct = scholarship.minPercentage ?? null
  const academicOk =
    (minCGPA === null || (cgpa !== null && cgpa !== undefined && cgpa >= minCGPA)) &&
    (minPct === null || (pct !== null && pct !== undefined && pct >= minPct))
  if (academicOk) score += 5

  return Math.min(100, score)
}
