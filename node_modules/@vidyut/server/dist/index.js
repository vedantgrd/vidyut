import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import authRoutes from './routes/auth.js';
import scholarshipRoutes from './routes/scholarships.js';
import applicationRoutes from './routes/applications.js';
import profileRoutes from './routes/profile.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import calendarRoutes from './routes/calendar.js';
import settingsRoutes from './routes/settings.js';
import onboardingRoutes from './routes/onboarding.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import documentRoutes from './routes/documents.js';
// Validate required env vars at startup
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        console.error('   Copy .env.example to .env and fill in the values.');
        process.exit(1);
    }
}
const app = new Hono();
// ── Global Middleware ────────────────────────────────────────────────────────
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV ?? 'development',
    });
});
// ── API Routes ───────────────────────────────────────────────────────────────
const api = new Hono();
api.route('/auth', authRoutes);
api.route('/scholarships', scholarshipRoutes);
api.route('/applications', applicationRoutes);
api.route('/profile', profileRoutes);
api.route('/dashboard', dashboardRoutes);
api.route('/notifications', notificationRoutes);
api.route('/calendar', calendarRoutes);
api.route('/settings', settingsRoutes);
api.route('/onboarding', onboardingRoutes);
api.route('/admin', adminRoutes);
api.route('/ai', aiRoutes);
api.route('/documents', documentRoutes);
app.route('/api/v1', api);
// ── 404 Handler ──────────────────────────────────────────────────────────────
app.notFound((c) => {
    return c.json({ error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});
// ── Error Handler ────────────────────────────────────────────────────────────
app.onError((err, c) => {
    console.error('[Server Error]', err);
    return c.json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined }, 500);
});
// ── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3001');
serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`\n🚀 Vidyut API running at http://localhost:${info.port}`);
    console.log(`   Health: http://localhost:${info.port}/health`);
    console.log(`   Env:    ${process.env.NODE_ENV ?? 'development'}\n`);
});
export default app;
//# sourceMappingURL=index.js.map