import { verifyAccessToken } from '../lib/jwt.js';
export async function authMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorised', code: 'MISSING_TOKEN' }, 401);
    }
    const token = authHeader.slice(7);
    try {
        const payload = await verifyAccessToken(token);
        c.set('userId', payload.userId);
        c.set('role', payload.role);
        await next();
    }
    catch {
        return c.json({ error: 'Unauthorised', code: 'INVALID_TOKEN' }, 401);
    }
}
/** Optional auth — attaches userId if token is present, does not block if absent */
export async function optionalAuthMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const payload = await verifyAccessToken(token);
            c.set('userId', payload.userId);
            c.set('role', payload.role);
        }
        catch {
            // Token invalid — treat as unauthenticated
        }
    }
    await next();
}
//# sourceMappingURL=auth.js.map