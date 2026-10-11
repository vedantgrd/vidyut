import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const notifications = new Hono();
notifications.use('*', authMiddleware);
// GET /notifications - List user's notifications
notifications.get('/', async (c) => {
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') ?? '1');
    const limit = parseInt(c.req.query('limit') ?? '20');
    const [total, items] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);
    return c.json({
        success: true,
        data: items,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});
// GET /notifications/unread-count - Count of unread notifications
notifications.get('/unread-count', async (c) => {
    const userId = c.get('userId');
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return c.json({
        success: true,
        data: { count }
    });
});
// POST /notifications/:id/read - Mark single notification as read
notifications.post('/:id/read', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
        return c.json({ success: false, error: { message: 'Notification not found' } }, 404);
    }
    if (notification.userId !== userId) {
        return c.json({ success: false, error: { message: 'Forbidden' } }, 403);
    }
    await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
    return c.json({
        success: true,
        message: 'Notification marked as read'
    });
});
// POST /notifications/read-all - Mark all notifications as read
notifications.post('/read-all', async (c) => {
    const userId = c.get('userId');
    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
    return c.json({
        success: true,
        message: 'All notifications marked as read'
    });
});
export default notifications;
//# sourceMappingURL=notifications.js.map