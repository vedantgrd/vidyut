import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { updateSettingsSchema } from '../validators/schemas.js';
const settings = new Hono();
settings.use('*', authMiddleware);
// GET /settings
settings.get('/', async (c) => {
    const userId = c.get('userId');
    let data = await prisma.userSettings.findUnique({ where: { userId } });
    if (!data) {
        data = await prisma.userSettings.create({ data: { userId } });
    }
    return c.json({ settings: data });
});
// PATCH /settings
settings.patch('/', zValidator('json', updateSettingsSchema), async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const updated = await prisma.userSettings.upsert({
        where: { userId },
        update: body,
        create: { userId, ...body },
    });
    return c.json({ settings: updated });
});
export default settings;
//# sourceMappingURL=settings.js.map