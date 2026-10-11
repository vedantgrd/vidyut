import { prisma } from './prisma.js';
export class ApplicationPrefiller {
    /**
     * Compiles student's profile and academic record details into a flat key-value dictionary
     * for pre-filling application form answers.
     */
    static async getPrefilledData(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                familyInfo: true,
                academicRecords: true,
            }
        });
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        const profile = user.studentProfile;
        const family = user.familyInfo;
        const academics = user.academicRecords;
        const prefilled = {
            fullName: user.fullName,
            email: user.email,
        };
        if (profile) {
            if (profile.phone)
                prefilled.phone = profile.phone;
            if (profile.gender)
                prefilled.gender = profile.gender;
            if (profile.dateOfBirth) {
                prefilled.dateOfBirth = profile.dateOfBirth.toISOString().split('T')[0];
            }
            if (profile.religion)
                prefilled.religion = profile.religion;
            if (profile.category)
                prefilled.category = profile.category;
            if (profile.domicileState)
                prefilled.domicileState = profile.domicileState;
            prefilled.isMinority = String(profile.isMinority);
            prefilled.hasDisability = String(profile.hasDisability);
            if (profile.addressLine1)
                prefilled.addressLine1 = profile.addressLine1;
            if (profile.addressLine2)
                prefilled.addressLine2 = profile.addressLine2;
            if (profile.city)
                prefilled.city = profile.city;
            if (profile.state)
                prefilled.state = profile.state;
            if (profile.pincode)
                prefilled.pincode = profile.pincode;
        }
        if (family) {
            if (family.fatherName)
                prefilled.fatherName = family.fatherName;
            if (family.fatherOccupation)
                prefilled.fatherOccupation = family.fatherOccupation;
            if (family.fatherIncome !== null)
                prefilled.fatherIncome = String(family.fatherIncome);
            if (family.motherName)
                prefilled.motherName = family.motherName;
            if (family.motherOccupation)
                prefilled.motherOccupation = family.motherOccupation;
            if (family.motherIncome !== null)
                prefilled.motherIncome = String(family.motherIncome);
            if (family.annualFamilyIncome !== null)
                prefilled.annualFamilyIncome = String(family.annualFamilyIncome);
            prefilled.isBPL = String(family.isBPL);
            prefilled.numberOfDependents = String(family.numberOfDependents);
            if (family.guardianName)
                prefilled.guardianName = family.guardianName;
        }
        // Populate academic records
        for (const record of academics) {
            const prefix = record.level.toLowerCase(); // class_10, class_12, undergraduate, etc.
            prefilled[`${prefix}_institutionName`] = record.institutionName;
            prefilled[`${prefix}_boardOrUniversity`] = record.boardOrUniversity;
            if (record.courseName)
                prefilled[`${prefix}_courseName`] = record.courseName;
            if (record.branch)
                prefilled[`${prefix}_branch`] = record.branch;
            prefilled[`${prefix}_percentage`] = String(record.percentage);
            if (record.cgpa !== null)
                prefilled[`${prefix}_cgpa`] = String(record.cgpa);
            prefilled[`${prefix}_passingYear`] = String(record.passingYear);
            if (record.admissionYear !== null)
                prefilled[`${prefix}_admissionYear`] = String(record.admissionYear);
            if (record.currentSemester !== null)
                prefilled[`${prefix}_currentSemester`] = String(record.currentSemester);
            prefilled[`${prefix}_isCurrentlyPursuing`] = String(record.isCurrentlyPursuing);
        }
        return prefilled;
    }
}
//# sourceMappingURL=ApplicationPrefiller.js.map