import { ApiClient } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'

export interface UserProfileData {
  id: string
  userId: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  nationality: string | null
  religion: string | null
  category: string | null
  isMinority: boolean | null
  hasDisability: boolean | null
  disabilityDetails: string | null
  domicileState: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  fatherName: string | null
  motherName: string | null
  annualFamilyIncome: number | null
  isBPL: boolean | null
  parentOccupation: string | null
  currentEducationLevel: string | null
  institutionName: string | null
  universityName: string | null
  courseName: string | null
  branch: string | null
  currentSemester: number | null
  admissionYear: number | null
  expectedGraduationYear: number | null
  rollNumber: string | null
  tenthPercentage: number | null
  tenthBoard: string | null
  tenthYear: number | null
  twelfthPercentage: number | null
  twelfthBoard: string | null
  twelfthYear: number | null
  twelfthStream: string | null
  diplomaPercentage: number | null
  diplomaField: string | null
  ugCGPA: number | null
  ugDegree: string | null
  ugUniversity: string | null
  pgCGPA: number | null
  pgDegree: string | null
  skills: string[]
  achievements: string[]
  extracurriculars: string[]
  languages: string[]
  careerGoals: string | null
  bio: string | null
  completionScore: number
  createdAt: string
  updatedAt: string
}

export const profileService = {
  async fetchProfile(): Promise<UserProfileData> {
    const res = await ApiClient.get<{ profile: UserProfileData }>(ENDPOINTS.PROFILE.ME)
    return res.profile
  },

  async updateProfile(data: Partial<UserProfileData>): Promise<UserProfileData> {
    const res = await ApiClient.patch<{ profile: UserProfileData }>(ENDPOINTS.PROFILE.UPDATE, data)
    return res.profile
  },

  async getCompletion(): Promise<{ score: number; missingFields: string[] }> {
    return ApiClient.get<{ score: number; missingFields: string[] }>(ENDPOINTS.PROFILE.COMPLETION)
  },
}
