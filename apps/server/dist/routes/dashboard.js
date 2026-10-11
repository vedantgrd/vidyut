import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { EligibilityEngine } from '../lib/EligibilityEngine.js';
import { ApplicationStatus, ScholarshipStatus } from '@prisma/client';
const dashboard = new Hono();
dashboard.use('*', authMiddleware);
// GET /dashboard/home - Dynamic dashboard content for students
dashboard.get('/home', async (c) => {
    const userId = c.get('userId');
    const [user, studentProfile, familyInfo, academicRecords, applications, unreadCount] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, onboardingComplete: true } }),
        prisma.studentProfile.findUnique({ where: { userId } }),
        prisma.familyInfo.findUnique({ where: { userId } }),
        prisma.academicRecord.findMany({ where: { userId } }), // Wait, our model relation was `academicRecords` on user. Let's make sure it is user.academicRecords or prisma.academicRecord
        prisma.application.findMany({
            where: { userId },
            include: { scholarship: { select: { name: true, deadline: true } } },
            orderBy: { updatedAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    // Get first 20 active scholarships to filter eligibility on the fly
    const activeScholarships = await prisma.scholarship.findMany({
        where: { status: ScholarshipStatus.ACTIVE },
        orderBy: { deadline: 'asc' },
        take: 20
    });
    const eligibleScholarships = [];
    for (const s of activeScholarships) {
        try {
            const report = await EligibilityEngine.evaluate(userId, s.id);
            if (report.isEligible) {
                eligibleScholarships.push({
                    id: s.id,
                    slug: s.slug,
                    name: s.name,
                    provider: s.provider,
                    amount: s.amount,
                    amountDescription: s.amountDescription,
                    deadline: s.deadline
                });
            }
        }
        catch (err) {
            console.error(`Error calculating eligibility:`, err);
        }
    }
    const activeApps = applications.filter(a => ![ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN].includes(a.status));
    const stats = [
        { label: 'Profile Score', value: `${studentProfile?.profileCompletionScore ?? 0}%`, icon: 'UserCheck' },
        { label: 'Total Applications', value: applications.length, icon: 'FileText' },
        { label: 'Active Applications', value: activeApps.length, icon: 'Clock' },
        { label: 'Notifications', value: unreadCount, icon: 'Bell' },
    ];
    const recentActivity = applications.slice(0, 5).map(a => ({
        id: a.id,
        type: 'application',
        title: `Application ${a.status.toLowerCase().replace('_', ' ')}`,
        description: a.scholarship.name,
        date: a.updatedAt,
        status: a.status,
    }));
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return c.json({
        success: true,
        data: {
            greeting: `${greeting}, ${user?.fullName?.split(' ')[0] ?? 'there'}`,
            onboardingComplete: user?.onboardingComplete ?? false,
            stats,
            recentActivity,
            eligibleScholarships: eligibleScholarships.slice(0, 6),
            upcomingDeadlines: activeApps.map(a => ({
                id: a.id,
                name: a.scholarship.name,
                deadline: a.scholarship.deadline,
            })),
            profileCompletion: studentProfile?.profileCompletionScore ?? 0,
        }
    });
});
export default dashboard;
//# sourceMappingURL=dashboard.js.map