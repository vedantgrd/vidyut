import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { EligibilityEngine } from '../lib/EligibilityEngine.js';
import { ScholarshipStatus } from '@prisma/client';
const scholarships = new Hono();
// GET /scholarships
scholarships.get('/', optionalAuthMiddleware, async (c) => {
    const userId = c.get('userId');
    const query = c.req.query();
    const search = query.search || '';
    const category = query.category || '';
    const eligibleOnly = query.eligibleOnly === 'true' || (!query.search && !!userId); // default to eligible only if student is logged in and not searching
    const where = {
        status: ScholarshipStatus.ACTIVE
    };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { provider: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (category) {
        where.category = category;
    }
    const list = await prisma.scholarship.findMany({
        where,
        include: {
            requiredDocuments: true,
            eligibilityRules: true,
        },
        orderBy: { deadline: 'asc' }
    });
    // If user is logged in, calculate eligibility for each
    const results = [];
    for (const s of list) {
        let eligibility = { isEligible: true, rulesEvaluated: [], documentsEvaluated: [], hasAllVerifiedDocuments: false };
        if (userId) {
            try {
                const report = await EligibilityEngine.evaluate(userId, s.id);
                eligibility = report;
            }
            catch (err) {
                console.error(`Error calculating eligibility for scholarship ${s.id}:`, err);
            }
        }
        // Filter if eligibleOnly is selected
        if (eligibleOnly && userId && !eligibility.isEligible) {
            continue;
        }
        results.push({
            id: s.id,
            slug: s.slug,
            name: s.name,
            provider: s.provider,
            description: s.description,
            shortDescription: s.shortDescription,
            amount: s.amount,
            amountDescription: s.amountDescription,
            category: s.category,
            status: s.status,
            deadline: s.deadline,
            officialWebsite: s.officialWebsite,
            applicationUrl: s.applicationUrl,
            isFeatured: s.isFeatured,
            isNational: s.isNational,
            states: s.states,
            tags: s.tags,
            requiredDocuments: s.requiredDocuments,
            eligibility,
        });
    }
    return c.json({
        success: true,
        data: results
    });
});
// GET /scholarships/featured
scholarships.get('/featured', async (c) => {
    const results = await prisma.scholarship.findMany({
        where: { isFeatured: true, status: ScholarshipStatus.ACTIVE },
        include: {
            requiredDocuments: true,
        },
        orderBy: { deadline: 'asc' },
        take: 6,
    });
    return c.json({
        success: true,
        data: results
    });
});
// GET /scholarships/:id
scholarships.get('/:id', optionalAuthMiddleware, async (c) => {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const scholarship = await prisma.scholarship.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
            requiredDocuments: true,
            eligibilityRules: true,
        }
    });
    if (!scholarship) {
        return c.json({ success: false, error: { message: 'Scholarship not found' } }, 404);
    }
    let eligibility = null;
    let applicationStatus = null;
    if (userId) {
        try {
            eligibility = await EligibilityEngine.evaluate(userId, scholarship.id);
            const app = await prisma.application.findUnique({
                where: { userId_scholarshipId: { userId, scholarshipId: scholarship.id } },
                select: { id: true, status: true }
            });
            if (app) {
                applicationStatus = app.status;
            }
        }
        catch (err) {
            console.error('Error in details eligibility check:', err);
        }
    }
    return c.json({
        success: true,
        data: {
            scholarship,
            eligibility,
            applicationStatus
        }
    });
});
export default scholarships;
//# sourceMappingURL=scholarships.js.map