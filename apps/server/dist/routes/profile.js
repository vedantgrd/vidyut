import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const profile = new Hono();
profile.use('*', authMiddleware);
// GET /profile
profile.get('/', async (c) => {
    const userId = c.get('userId');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            familyInfo: true,
            academicRecords: true,
        }
    });
    if (!user) {
        return c.json({ success: false, error: { message: 'User not found' } }, 404);
    }
    return c.json({
        success: true,
        data: {
            profile: user.studentProfile,
            family: user.familyInfo,
            academics: user.academicRecords,
            onboardingComplete: user.onboardingComplete
        }
    });
});
// PUT /profile
profile.put('/', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { studentProfile, familyInfo, academicRecords } = body;
    // Update profile
    if (studentProfile) {
        const { dateOfBirth, gender, phone, religion, category, isMinority, hasDisability, domicileState, addressLine1, addressLine2, city, state, pincode } = studentProfile;
        await prisma.studentProfile.upsert({
            where: { userId },
            update: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender: gender,
                phone,
                religion,
                category: category,
                isMinority: !!isMinority,
                hasDisability: !!hasDisability,
                domicileState,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
            },
            create: {
                userId,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender: gender,
                phone,
                religion,
                category: category,
                isMinority: !!isMinority,
                hasDisability: !!hasDisability,
                domicileState,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
            }
        });
    }
    // Update family info
    if (familyInfo) {
        const { fatherName, fatherOccupation, fatherIncome, motherName, motherOccupation, motherIncome, annualFamilyIncome, isBPL, numberOfDependents, guardianName } = familyInfo;
        await prisma.familyInfo.upsert({
            where: { userId },
            update: {
                fatherName,
                fatherOccupation,
                fatherIncome: fatherIncome ? Number(fatherIncome) : null,
                motherName,
                motherOccupation,
                motherIncome: motherIncome ? Number(motherIncome) : null,
                annualFamilyIncome: annualFamilyIncome ? Number(annualFamilyIncome) : null,
                isBPL: !!isBPL,
                numberOfDependents: numberOfDependents ? Number(numberOfDependents) : 0,
                guardianName,
            },
            create: {
                userId,
                fatherName,
                fatherOccupation,
                fatherIncome: fatherIncome ? Number(fatherIncome) : null,
                motherName,
                motherOccupation,
                motherIncome: motherIncome ? Number(motherIncome) : null,
                annualFamilyIncome: annualFamilyIncome ? Number(annualFamilyIncome) : null,
                isBPL: !!isBPL,
                numberOfDependents: numberOfDependents ? Number(numberOfDependents) : 0,
                guardianName,
            }
        });
    }
    // Update academic records (completely overwrite them if provided)
    if (Array.isArray(academicRecords)) {
        await prisma.academicRecord.deleteMany({
            where: { userId }
        });
        for (const record of academicRecords) {
            const { level, institutionName, boardOrUniversity, courseName, branch, percentage, cgpa, passingYear, admissionYear, currentSemester, isCurrentlyPursuing } = record;
            await prisma.academicRecord.create({
                data: {
                    userId,
                    level: level,
                    institutionName,
                    boardOrUniversity,
                    courseName,
                    branch,
                    percentage: Number(percentage),
                    cgpa: cgpa ? Number(cgpa) : null,
                    passingYear: Number(passingYear),
                    admissionYear: admissionYear ? Number(admissionYear) : null,
                    currentSemester: currentSemester ? Number(currentSemester) : null,
                    isCurrentlyPursuing: !!isCurrentlyPursuing,
                }
            });
        }
    }
    // Re-fetch complete info to return
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            familyInfo: true,
            academicRecords: true,
        }
    });
    // Calculate completion score
    let completedFields = 0;
    let totalFields = 10;
    if (user?.studentProfile?.phone)
        completedFields++;
    if (user?.studentProfile?.gender)
        completedFields++;
    if (user?.studentProfile?.domicileState)
        completedFields++;
    if (user?.studentProfile?.category)
        completedFields++;
    if (user?.familyInfo?.annualFamilyIncome !== null)
        completedFields++;
    if (user?.familyInfo?.fatherName)
        completedFields++;
    if (user?.academicRecords && user.academicRecords.length > 0)
        completedFields += 4;
    const score = Math.round((completedFields / totalFields) * 100);
    if (user?.studentProfile) {
        await prisma.studentProfile.update({
            where: { userId },
            data: { profileCompletionScore: score }
        });
    }
    // Log in Audit Log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'profile.update',
            entity: 'StudentProfile',
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            profile: user?.studentProfile,
            family: user?.familyInfo,
            academics: user?.academicRecords,
            completionScore: score,
        }
    });
});
export default profile;
//# sourceMappingURL=profile.js.map