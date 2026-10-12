import { prisma } from './prisma.js'

export class ApplicationPrefiller {
  /**
   * Compiles student's profile and academic record details into a flat key-value dictionary
   * for pre-filling application form answers.
   */
  static async getPrefilledData(userId: string): Promise<Record<string, string>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        familyInfo: true,
        academicRecords: true,
      }
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    const profile = user.studentProfile
    const family = user.familyInfo
    const academics = user.academicRecords

    const prefilled: Record<string, string> = {
      fullName: user.fullName,
      email: user.email,
    }

    if (profile) {
      if (profile.phone) prefilled.phone = profile.phone
      if (profile.gender) prefilled.gender = profile.gender
      if (profile.dateOfBirth) {
        prefilled.dateOfBirth = profile.dateOfBirth.toISOString().split('T')[0]
      }
      if (profile.religion) prefilled.religion = profile.religion
      if (profile.category) prefilled.category = profile.category
      if (profile.domicileState) prefilled.domicileState = profile.domicileState
      if (profile.isMinority !== null && profile.isMinority !== undefined) prefilled.isMinority = String(profile.isMinority)
      if (profile.hasDisability !== null && profile.hasDisability !== undefined) prefilled.hasDisability = String(profile.hasDisability)

      if (profile.addressLine1) prefilled.addressLine1 = profile.addressLine1
      if (profile.addressLine2) prefilled.addressLine2 = profile.addressLine2
      if (profile.city) prefilled.city = profile.city
      if (profile.state) prefilled.state = profile.state
      if (profile.pincode) prefilled.pincode = profile.pincode
    }

    if (family) {
      if (family.fatherName) prefilled.fatherName = family.fatherName
      if (family.fatherOccupation) prefilled.fatherOccupation = family.fatherOccupation
      if (family.fatherIncome !== null && family.fatherIncome !== undefined) prefilled.fatherIncome = String(family.fatherIncome)
      if (family.motherName) prefilled.motherName = family.motherName
      if (family.motherOccupation) prefilled.motherOccupation = family.motherOccupation
      if (family.motherIncome !== null && family.motherIncome !== undefined) prefilled.motherIncome = String(family.motherIncome)
      if (family.annualFamilyIncome !== null && family.annualFamilyIncome !== undefined) prefilled.annualFamilyIncome = String(family.annualFamilyIncome)
      if (family.isBPL !== null && family.isBPL !== undefined) prefilled.isBPL = String(family.isBPL)
      if (family.numberOfDependents !== null && family.numberOfDependents !== undefined) prefilled.numberOfDependents = String(family.numberOfDependents)
      if (family.guardianName) prefilled.guardianName = family.guardianName
    }

    // Populate academic records
    for (const record of academics) {
      const prefix = record.level.toLowerCase() // class_10, class_12, undergraduate, etc.
      if (record.institutionName) prefilled[`${prefix}_institutionName`] = record.institutionName
      if (record.boardOrUniversity) prefilled[`${prefix}_boardOrUniversity`] = record.boardOrUniversity
      if (record.courseName) prefilled[`${prefix}_courseName`] = record.courseName
      if (record.branch) prefilled[`${prefix}_branch`] = record.branch
      if (record.percentage !== null && record.percentage !== undefined) prefilled[`${prefix}_percentage`] = String(record.percentage)
      if (record.cgpa !== null && record.cgpa !== undefined) prefilled[`${prefix}_cgpa`] = String(record.cgpa)
      if (record.passingYear !== null && record.passingYear !== undefined) prefilled[`${prefix}_passingYear`] = String(record.passingYear)
      if (record.admissionYear !== null && record.admissionYear !== undefined) prefilled[`${prefix}_admissionYear`] = String(record.admissionYear)
      if (record.currentSemester !== null && record.currentSemester !== undefined) prefilled[`${prefix}_currentSemester`] = String(record.currentSemester)
      prefilled[`${prefix}_isCurrentlyPursuing`] = String(record.isCurrentlyPursuing)
    }

    return prefilled
  }
}
