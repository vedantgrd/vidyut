import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { EligibilityEngine } from '../lib/EligibilityEngine.js';
import { ApplicationPrefiller } from '../lib/ApplicationPrefiller.js';
import { ApplicationStatus, NotificationType } from '@prisma/client';
const applications = new Hono();
// All application routes require authentication
applications.use('*', authMiddleware);
// GET /applications - List student applications
applications.get('/', async (c) => {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const where = { userId };
    if (status) {
        where.status = status;
    }
    const list = await prisma.application.findMany({
        where,
        include: {
            scholarship: {
                select: {
                    id: true,
                    name: true,
                    provider: true,
                    amount: true,
                    deadline: true,
                    category: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return c.json({
        success: true,
        data: list
    });
});
// GET /applications/:id - Detailed tracking with snapshot, form data, history
applications.get('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const app = await prisma.application.findUnique({
        where: { id },
        include: {
            scholarship: {
                include: {
                    requiredDocuments: true
                }
            },
            formData: true,
            documents: {
                include: {
                    document: true,
                    requiredDocument: true
                }
            },
            statusHistory: {
                orderBy: { changedAt: 'desc' }
            }
        }
    });
    if (!app) {
        return c.json({ success: false, error: { message: 'Application not found' } }, 404);
    }
    // Ensure student owns the application (unless they are admin/reviewer)
    const role = c.get('role');
    if (app.userId !== userId && role === 'STUDENT') {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 403);
    }
    // Generate prefilled base data if it's a draft
    let prefilled = {};
    if (app.status === ApplicationStatus.DRAFT) {
        try {
            prefilled = await ApplicationPrefiller.getPrefilledData(app.userId);
        }
        catch (err) {
            console.error('Error prefilling data:', err);
        }
    }
    return c.json({
        success: true,
        data: {
            application: app,
            prefilled,
        }
    });
});
// POST /applications - Initialize a new application (DRAFT)
applications.post('/', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { scholarshipId } = body;
    if (!scholarshipId) {
        return c.json({ success: false, error: { message: 'scholarshipId is required' } }, 400);
    }
    // Check if scholarship exists
    const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId }
    });
    if (!scholarship) {
        return c.json({ success: false, error: { message: 'Scholarship not found' } }, 404);
    }
    // Check if student has completed onboarding
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user?.onboardingComplete) {
        return c.json({
            success: false,
            error: { message: 'Please complete onboarding before applying for scholarships' }
        }, 400);
    }
    // Check existing application
    const existing = await prisma.application.findUnique({
        where: { userId_scholarshipId: { userId, scholarshipId } }
    });
    if (existing) {
        return c.json({
            success: true,
            message: 'Application already exists',
            data: existing
        });
    }
    const app = await prisma.application.create({
        data: {
            userId,
            scholarshipId,
            status: ApplicationStatus.DRAFT,
        }
    });
    // Log status history
    await prisma.applicationStatusHistory.create({
        data: {
            applicationId: app.id,
            fromStatus: ApplicationStatus.DRAFT,
            toStatus: ApplicationStatus.DRAFT,
            changedByUserId: userId,
            note: 'Application draft created',
        }
    });
    // Log in Audit Log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'application.draft_created',
            entity: 'Application',
            entityId: app.id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Application draft initialized',
        data: app
    }, 201);
});
// PATCH /applications/:id/draft - Autosave draft details
applications.patch('/:id/draft', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();
    const { formData, documents } = body; // formData is record of fieldName -> fieldValue. documents is list of { documentId, requiredDocumentId }
    const app = await prisma.application.findUnique({
        where: { id }
    });
    if (!app) {
        return c.json({ success: false, error: { message: 'Application not found' } }, 404);
    }
    if (app.userId !== userId) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 403);
    }
    if (app.status !== ApplicationStatus.DRAFT) {
        return c.json({ success: false, error: { message: 'Only draft applications can be updated' } }, 400);
    }
    // Update form fields
    if (formData && typeof formData === 'object') {
        for (const [key, val] of Object.entries(formData)) {
            await prisma.applicationFormData.upsert({
                where: {
                    applicationId_fieldName: {
                        applicationId: id,
                        fieldName: key,
                    }
                },
                update: { fieldValue: String(val) },
                create: {
                    applicationId: id,
                    fieldName: key,
                    fieldValue: String(val),
                }
            });
        }
    }
    // Map user documents to required scholarship documents
    if (Array.isArray(documents)) {
        for (const mapping of documents) {
            const { documentId, requiredDocumentId } = mapping;
            // Verify document belongs to user
            const userDoc = await prisma.document.findFirst({
                where: { id: documentId, userId }
            });
            if (!userDoc)
                continue;
            await prisma.applicationDocument.deleteMany({
                where: {
                    applicationId: id,
                    requiredDocumentId,
                }
            });
            await prisma.applicationDocument.create({
                data: {
                    applicationId: id,
                    documentId,
                    requiredDocumentId,
                }
            });
        }
    }
    return c.json({
        success: true,
        message: 'Application progress autosaved successfully'
    });
});
// POST /applications/:id/submit - Submit application with validation and snapshots
applications.post('/:id/submit', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const app = await prisma.application.findUnique({
        where: { id },
        include: {
            user: true,
            scholarship: {
                include: {
                    eligibilityRules: true,
                    requiredDocuments: true,
                }
            },
            documents: {
                include: {
                    document: true
                }
            }
        }
    });
    if (!app) {
        return c.json({ success: false, error: { message: 'Application not found' } }, 404);
    }
    if (app.userId !== userId) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 403);
    }
    if (app.status !== ApplicationStatus.DRAFT) {
        return c.json({ success: false, error: { message: 'Application is already submitted' } }, 400);
    }
    // 1. Run eligibility engine validation
    const report = await EligibilityEngine.evaluate(userId, app.scholarshipId);
    if (!report.isEligible) {
        return c.json({
            success: false,
            error: {
                code: 'ELIGIBILITY_FAILED',
                message: 'You do not meet all the eligibility criteria for this scholarship.',
                details: report.rulesEvaluated.filter(r => !r.passed)
            }
        }, 400);
    }
    // 2. Validate that all required documents are attached and verified
    const missingOrUnverifiedDocs = report.documentsEvaluated.filter(d => d.status !== 'VERIFIED');
    if (missingOrUnverifiedDocs.length > 0) {
        return c.json({
            success: false,
            error: {
                code: 'DOCUMENTS_UNVERIFIED',
                message: 'All required documents must be uploaded and verified before submission.',
                details: missingOrUnverifiedDocs
            }
        }, 400);
    }
    // 3. Create frozen scholarship snapshot
    const snapshot = {
        id: app.scholarship.id,
        name: app.scholarship.name,
        provider: app.scholarship.provider,
        amount: app.scholarship.amount,
        amountDescription: app.scholarship.amountDescription,
        category: app.scholarship.category,
        deadline: app.scholarship.deadline.toISOString(),
    };
    // 4. Perform submit updates
    const updatedApp = await prisma.application.update({
        where: { id },
        data: {
            status: ApplicationStatus.SUBMITTED,
            submittedAt: new Date(),
            scholarshipSnapshot: snapshot,
        }
    });
    // Write history log
    await prisma.applicationStatusHistory.create({
        data: {
            applicationId: id,
            fromStatus: ApplicationStatus.DRAFT,
            toStatus: ApplicationStatus.SUBMITTED,
            changedByUserId: userId,
            note: 'Application submitted by student',
        }
    });
    // Create notifications
    // Student
    await prisma.notification.create({
        data: {
            userId,
            type: NotificationType.APPLICATION,
            title: 'Application Submitted Successfully',
            message: `Your application for ${app.scholarship.name} has been submitted and is pending document verification.`,
            link: `/applications/${id}`
        }
    });
    // Admins
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    });
    for (const admin of admins) {
        await prisma.notification.create({
            data: {
                userId: admin.id,
                type: NotificationType.APPLICATION,
                title: 'New Scholarship Application',
                message: `${app.user.fullName} submitted an application for ${app.scholarship.name}.`,
                link: `/admin/applications/${id}`
            }
        }).catch(() => { });
    }
    // Log in Audit Log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'application.submit',
            entity: 'Application',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Application submitted successfully',
        data: updatedApp
    });
});
// POST /applications/:id/withdraw - Withdraw application
applications.post('/:id/withdraw', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const app = await prisma.application.findUnique({
        where: { id }
    });
    if (!app) {
        return c.json({ success: false, error: { message: 'Application not found' } }, 404);
    }
    if (app.userId !== userId) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 403);
    }
    if (app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.REJECTED || app.status === ApplicationStatus.WITHDRAWN) {
        return c.json({ success: false, error: { message: 'Application cannot be withdrawn in its current state' } }, 400);
    }
    const oldStatus = app.status;
    const updatedApp = await prisma.application.update({
        where: { id },
        data: {
            status: ApplicationStatus.WITHDRAWN
        }
    });
    // Write history log
    await prisma.applicationStatusHistory.create({
        data: {
            applicationId: id,
            fromStatus: oldStatus,
            toStatus: ApplicationStatus.WITHDRAWN,
            changedByUserId: userId,
            note: 'Application withdrawn by student',
        }
    });
    // Notify student
    await prisma.notification.create({
        data: {
            userId,
            type: NotificationType.APPLICATION,
            title: 'Application Withdrawn',
            message: `You have withdrawn your application for this scholarship.`,
            link: `/applications/${id}`
        }
    });
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'application.withdraw',
            entity: 'Application',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Application withdrawn successfully',
        data: updatedApp
    });
});
export default applications;
//# sourceMappingURL=applications.js.map