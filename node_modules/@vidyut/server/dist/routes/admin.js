import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApplicationStatus, DocumentStatus, DisbursementStatus, NotificationType } from '@prisma/client';
import slugify from 'slugify';
const admin = new Hono();
// Enforce admin/reviewer authentication middleware
admin.use('*', authMiddleware);
admin.use('*', async (c, next) => {
    const role = c.get('role');
    if (role !== 'ADMIN' && role !== 'REVIEWER') {
        return c.json({ success: false, error: { message: 'Forbidden: Admin access required' } }, 403);
    }
    await next();
});
// GET /admin/analytics - Flexible, non-hardcoded dashboard KPIs and distributions
admin.get('/analytics', async (c) => {
    const totalUsers = await prisma.user.count();
    const studentsOnboarded = await prisma.user.count({ where: { role: 'STUDENT', onboardingComplete: true } });
    const studentsIncomplete = await prisma.user.count({ where: { role: 'STUDENT', onboardingComplete: false } });
    const appsSubmitted = await prisma.application.count({ where: { status: ApplicationStatus.SUBMITTED } });
    const appsApproved = await prisma.application.count({ where: { status: ApplicationStatus.APPROVED } });
    const appsRejected = await prisma.application.count({ where: { status: ApplicationStatus.REJECTED } });
    const appsPendingReview = await prisma.application.count({ where: { status: ApplicationStatus.UNDER_REVIEW } });
    const pendingDocVerifications = await prisma.document.count({ where: { status: DocumentStatus.PENDING } });
    // Processing KPI: Average review time in days
    const closedApps = await prisma.application.findMany({
        where: {
            status: { in: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] },
            submittedAt: { not: null },
            decidedAt: { not: null }
        },
        select: { submittedAt: true, decidedAt: true }
    });
    let avgReviewDays = 0;
    if (closedApps.length > 0) {
        const totalMs = closedApps.reduce((acc, app) => {
            const sub = app.submittedAt?.getTime() ?? 0;
            const dec = app.decidedAt?.getTime() ?? 0;
            return acc + (dec - sub);
        }, 0);
        avgReviewDays = Number(((totalMs / closedApps.length) / (1000 * 60 * 60 * 24)).toFixed(1));
    }
    // Distributions
    const scholarshipsByCategory = await prisma.scholarship.groupBy({
        by: ['category'],
        _count: { id: true }
    });
    const applicationsByStatus = await prisma.application.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    // Format into display segments
    const sections = [
        {
            id: 'users',
            title: 'User Statistics',
            metrics: [
                { key: 'total_users', label: 'Total Accounts', value: totalUsers, type: 'number' },
                { key: 'students_onboarded', label: 'Onboarded Students', value: studentsOnboarded, type: 'number' },
                { key: 'students_incomplete', label: 'Incomplete Onboardings', value: studentsIncomplete, type: 'number' }
            ]
        },
        {
            id: 'applications',
            title: 'Application Pipeline',
            metrics: [
                { key: 'submitted', label: 'Submitted', value: appsSubmitted, type: 'number' },
                { key: 'approved', label: 'Approved', value: appsApproved, type: 'number' },
                { key: 'rejected', label: 'Rejected', value: appsRejected, type: 'number' },
                { key: 'under_review', label: 'Under Review', value: appsPendingReview, type: 'number' },
                { key: 'avg_review_time', label: 'Avg Review Time (Days)', value: avgReviewDays, type: 'days' }
            ]
        },
        {
            id: 'documents',
            title: 'Verification Tasks',
            metrics: [
                { key: 'pending_docs', label: 'Pending Document Verifications', value: pendingDocVerifications, type: 'number' }
            ]
        }
    ];
    const categoryDistribution = scholarshipsByCategory.map(s => ({
        group: s.category,
        count: s._count.id
    }));
    const statusDistribution = applicationsByStatus.map(a => ({
        group: a.status,
        count: a._count.id
    }));
    return c.json({
        success: true,
        data: {
            sections,
            distributions: {
                categoryDistribution,
                statusDistribution
            }
        }
    });
});
// GET /admin/applications - List review pipeline
admin.get('/applications', async (c) => {
    const status = c.req.query('status');
    const where = {};
    if (status) {
        where.status = status;
    }
    else {
        // Default to submitted or under review
        where.status = { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.DOCUMENTS_VERIFIED] };
    }
    const list = await prisma.application.findMany({
        where,
        include: {
            user: {
                select: { fullName: true, email: true }
            },
            scholarship: {
                select: { name: true, amount: true, provider: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return c.json({
        success: true,
        data: list
    });
});
// GET /admin/applications/:id - Side-by-side review payload
admin.get('/applications/:id', async (c) => {
    const id = c.req.param('id');
    const app = await prisma.application.findUnique({
        where: { id },
        include: {
            user: {
                include: {
                    studentProfile: true,
                    familyInfo: true,
                    academicRecords: true,
                }
            },
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
    return c.json({
        success: true,
        data: app
    });
});
// PATCH /admin/applications/:id/review - Review status update (Approve/Reject/Query)
admin.post('/applications/:id/review', async (c) => {
    const id = c.req.param('id');
    const reviewerId = c.get('userId');
    const body = await c.req.json();
    const { status, notes, disbursementStatus } = body; // status can be APPROVED, REJECTED, UNDER_REVIEW, DOCUMENTS_VERIFIED
    const app = await prisma.application.findUnique({
        where: { id },
        include: { scholarship: true }
    });
    if (!app) {
        return c.json({ success: false, error: { message: 'Application not found' } }, 404);
    }
    const oldStatus = app.status;
    const updateData = {
        status: status,
        reviewerNotes: notes,
        reviewedAt: new Date()
    };
    if (status === ApplicationStatus.APPROVED) {
        updateData.decidedAt = new Date();
        updateData.disbursementStatus = DisbursementStatus.PENDING;
    }
    else if (status === ApplicationStatus.REJECTED) {
        updateData.decidedAt = new Date();
        updateData.rejectionReason = notes;
    }
    if (disbursementStatus) {
        updateData.disbursementStatus = disbursementStatus;
        if (disbursementStatus === DisbursementStatus.DISBURSED) {
            updateData.disbursementDate = new Date();
        }
    }
    const updatedApp = await prisma.application.update({
        where: { id },
        data: updateData
    });
    // Write history log
    await prisma.applicationStatusHistory.create({
        data: {
            applicationId: id,
            fromStatus: oldStatus,
            toStatus: status,
            changedByUserId: reviewerId,
            note: notes || `Application moved to ${status}`,
        }
    });
    // Notify student
    await prisma.notification.create({
        data: {
            userId: app.userId,
            type: NotificationType.REVIEW,
            title: `Application Status Updated: ${status}`,
            message: notes || `Your application for ${app.scholarship.name} is now ${status}.`,
            link: `/applications/${id}`
        }
    });
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: reviewerId,
            action: `application.reviewed_${status.toLowerCase()}`,
            entity: 'Application',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Application reviewed successfully',
        data: updatedApp
    });
});
// GET /admin/documents - Document verification queue
admin.get('/documents', async (c) => {
    const queue = await prisma.document.findMany({
        where: { status: DocumentStatus.PENDING },
        include: {
            user: {
                select: { fullName: true, email: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });
    return c.json({
        success: true,
        data: queue
    });
});
// PATCH /admin/documents/:id/verify - Approve or reject user documents
admin.post('/documents/:id/verify', async (c) => {
    const id = c.req.param('id');
    const reviewerId = c.get('userId');
    const body = await c.req.json();
    const { status, reason } = body; // status is VERIFIED or REJECTED
    const doc = await prisma.document.findUnique({
        where: { id }
    });
    if (!doc) {
        return c.json({ success: false, error: { message: 'Document not found' } }, 404);
    }
    const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
            status: status,
            rejectionReason: reason || null,
            verifiedByUserId: reviewerId,
            verifiedAt: new Date()
        }
    });
    // Notify student
    await prisma.notification.create({
        data: {
            userId: doc.userId,
            type: NotificationType.DOCUMENT,
            title: status === 'VERIFIED' ? 'Document Verified' : 'Document Rejected',
            message: status === 'VERIFIED'
                ? `Your uploaded document "${doc.label}" has been verified.`
                : `Your uploaded document "${doc.label}" was rejected. Reason: ${reason || 'N/A'}. Please re-upload.`,
            link: '/documents'
        }
    });
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: reviewerId,
            action: `document.verify_${status.toLowerCase()}`,
            entity: 'Document',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: `Document status set to ${status}`,
        data: updatedDoc
    });
});
// POST /admin/scholarships - Create Scholarship with rules & document criteria
admin.post('/scholarships', async (c) => {
    const adminId = c.get('userId');
    const body = await c.req.json();
    const { name, provider, description, shortDescription, amount, amountDescription, category, deadline, officialWebsite, applicationUrl, isFeatured, isNational, states, tags, eligibilityRules, requiredDocuments } = body;
    if (!name || !provider || !description || !amount || !category || !deadline) {
        return c.json({ success: false, error: { message: 'Missing mandatory fields' } }, 400);
    }
    const slug = slugify.default(name, { lower: true, strict: true });
    // Insert master scholarship
    const scholarship = await prisma.scholarship.create({
        data: {
            slug,
            name,
            provider,
            description,
            shortDescription,
            amount: Number(amount),
            amountDescription,
            category: category,
            deadline: new Date(deadline),
            officialWebsite,
            applicationUrl,
            isFeatured: !!isFeatured,
            isNational: !!isNational,
            states: states || [],
            tags: tags || [],
            createdById: adminId,
            updatedById: adminId
        }
    });
    // Insert rules
    if (Array.isArray(eligibilityRules)) {
        for (const rule of eligibilityRules) {
            await prisma.eligibilityRule.create({
                data: {
                    scholarshipId: scholarship.id,
                    ruleType: rule.ruleType,
                    operator: rule.operator,
                    value: rule.value,
                    isRequired: rule.isRequired !== false
                }
            });
        }
    }
    // Insert required documents
    if (Array.isArray(requiredDocuments)) {
        for (const doc of requiredDocuments) {
            await prisma.requiredDocument.create({
                data: {
                    scholarshipId: scholarship.id,
                    documentType: doc.documentType,
                    label: doc.label,
                    description: doc.description,
                    isOptional: !!doc.isOptional
                }
            });
        }
    }
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: adminId,
            action: 'scholarship.create',
            entity: 'Scholarship',
            entityId: scholarship.id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Scholarship created successfully',
        data: scholarship
    }, 201);
});
// PUT /admin/scholarships/:id - Update master scholarship
admin.put('/scholarships/:id', async (c) => {
    const adminId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, provider, description, shortDescription, amount, amountDescription, category, deadline, officialWebsite, applicationUrl, isFeatured, isNational, states, tags, eligibilityRules, requiredDocuments } = body;
    const scholarship = await prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) {
        return c.json({ success: false, error: { message: 'Scholarship not found' } }, 404);
    }
    const updated = await prisma.scholarship.update({
        where: { id },
        data: {
            name,
            provider,
            description,
            shortDescription,
            amount: amount ? Number(amount) : undefined,
            amountDescription,
            category: category ? category : undefined,
            deadline: deadline ? new Date(deadline) : undefined,
            officialWebsite,
            applicationUrl,
            isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
            isNational: isNational !== undefined ? !!isNational : undefined,
            states,
            tags,
            updatedById: adminId
        }
    });
    // Overwrite rules if provided
    if (Array.isArray(eligibilityRules)) {
        await prisma.eligibilityRule.deleteMany({ where: { scholarshipId: id } });
        for (const rule of eligibilityRules) {
            await prisma.eligibilityRule.create({
                data: {
                    scholarshipId: id,
                    ruleType: rule.ruleType,
                    operator: rule.operator,
                    value: rule.value,
                    isRequired: rule.isRequired !== false
                }
            });
        }
    }
    // Overwrite documents if provided
    if (Array.isArray(requiredDocuments)) {
        await prisma.requiredDocument.deleteMany({ where: { scholarshipId: id } });
        for (const doc of requiredDocuments) {
            await prisma.requiredDocument.create({
                data: {
                    scholarshipId: id,
                    documentType: doc.documentType,
                    label: doc.label,
                    description: doc.description,
                    isOptional: !!doc.isOptional
                }
            });
        }
    }
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: adminId,
            action: 'scholarship.update',
            entity: 'Scholarship',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Scholarship updated successfully',
        data: updated
    });
});
// DELETE /admin/scholarships/:id - Delete scholarship
admin.delete('/scholarships/:id', async (c) => {
    const adminId = c.get('userId');
    const id = c.req.param('id');
    const scholarship = await prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) {
        return c.json({ success: false, error: { message: 'Scholarship not found' } }, 404);
    }
    await prisma.scholarship.delete({ where: { id } });
    // Audit Log
    await prisma.auditLog.create({
        data: {
            userId: adminId,
            action: 'scholarship.delete',
            entity: 'Scholarship',
            entityId: id,
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
        }
    });
    return c.json({
        success: true,
        message: 'Scholarship deleted successfully'
    });
});
export default admin;
//# sourceMappingURL=admin.js.map