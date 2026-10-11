import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
const onboarding = new Hono();
onboarding.use('*', authMiddleware);
// GET /onboarding/status
onboarding.get('/status', async (c) => {
    const userId = c.get('userId');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            familyInfo: true,
            academicRecords: true,
            documents: true,
        }
    });
    if (!user) {
        return c.json({ success: false, error: { message: 'User not found' } }, 404);
    }
    const steps = {
        personal: !!user.studentProfile?.phone && !!user.studentProfile?.gender && !!user.studentProfile?.domicileState,
        academic: user.academicRecords.length > 0,
        family: !!user.familyInfo?.annualFamilyIncome && !!user.familyInfo?.fatherName,
        documents: user.documents.length > 0,
        complete: user.onboardingComplete,
    };
    return c.json({
        success: true,
        data: {
            steps,
            onboardingComplete: user.onboardingComplete
        }
    });
});
// POST /onboarding/personal
onboarding.post('/personal', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { dateOfBirth, gender, phone, religion, category, isMinority, hasDisability, domicileState, addressLine1, addressLine2, city, state, pincode, } = body;
    // Quick validation
    if (!gender || !phone || !domicileState || !category) {
        return c.json({
            success: false,
            error: { message: 'Missing mandatory fields: gender, phone, domicileState, category' }
        }, 400);
    }
    const updatedProfile = await prisma.studentProfile.upsert({
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
            profileCompletionScore: 25,
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
            profileCompletionScore: 25,
        }
    });
    return c.json({
        success: true,
        message: 'Personal details saved successfully',
        data: updatedProfile
    });
});
// POST /onboarding/academic
onboarding.post('/academic', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json(); // Array of academic records
    const records = body.records;
    if (!Array.isArray(records) || records.length === 0) {
        return c.json({
            success: false,
            error: { message: 'Invalid records format, expected non-empty array' }
        }, 400);
    }
    // Delete existing records first to overwrite
    await prisma.academicRecord.deleteMany({
        where: { userId }
    });
    const createdRecords = [];
    for (const record of records) {
        const { level, institutionName, boardOrUniversity, courseName, branch, percentage, cgpa, passingYear, admissionYear, currentSemester, isCurrentlyPursuing, } = record;
        if (!level || !institutionName || !boardOrUniversity || percentage === undefined || !passingYear) {
            return c.json({
                success: false,
                error: { message: 'Missing mandatory academic fields for one or more records' }
            }, 400);
        }
        const created = await prisma.academicRecord.create({
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
        createdRecords.push(created);
    }
    // Update profile score
    await prisma.studentProfile.update({
        where: { userId },
        data: { profileCompletionScore: 50 }
    });
    return c.json({
        success: true,
        message: 'Academic records saved successfully',
        data: createdRecords
    });
});
// POST /onboarding/family
onboarding.post('/family', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { fatherName, fatherOccupation, fatherIncome, motherName, motherOccupation, motherIncome, annualFamilyIncome, isBPL, numberOfDependents, guardianName, } = body;
    if (annualFamilyIncome === undefined || !fatherName) {
        return c.json({
            success: false,
            error: { message: 'Missing mandatory fields: annualFamilyIncome, fatherName' }
        }, 400);
    }
    const updatedFamily = await prisma.familyInfo.upsert({
        where: { userId },
        update: {
            fatherName,
            fatherOccupation,
            fatherIncome: fatherIncome ? Number(fatherIncome) : null,
            motherName,
            motherOccupation,
            motherIncome: motherIncome ? Number(motherIncome) : null,
            annualFamilyIncome: Number(annualFamilyIncome),
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
            annualFamilyIncome: Number(annualFamilyIncome),
            isBPL: !!isBPL,
            numberOfDependents: numberOfDependents ? Number(numberOfDependents) : 0,
            guardianName,
        }
    });
    // Update profile score
    await prisma.studentProfile.update({
        where: { userId },
        data: { profileCompletionScore: 75 }
    });
    return c.json({
        success: true,
        message: 'Family details saved successfully',
        data: updatedFamily
    });
});
// POST /onboarding/complete
onboarding.post('/complete', async (c) => {
    const userId = c.get('userId');
    // Verify that profile, family, and academics exist
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            familyInfo: true,
            academicRecords: true,
        }
    });
    if (!user || !user.studentProfile || !user.familyInfo || user.academicRecords.length === 0) {
        return c.json({
            success: false,
            error: { message: 'Cannot complete onboarding: profile information is incomplete' }
        }, 400);
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            onboardingComplete: true,
        }
    });
    // Set profile score to 100
    await prisma.studentProfile.update({
        where: { userId },
        data: { profileCompletionScore: 100 }
    });
    // Log in Audit Logs
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'onboarding.complete',
            entity: 'User',
            entityId: userId,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Onboarding completed successfully',
        data: {
            onboardingComplete: true
        }
    });
});
export default onboarding;
//# sourceMappingURL=onboarding.js.map