import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/bcrypt.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email.js';
import { authMiddleware } from '../middleware/auth.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, } from '../validators/schemas.js';
const auth = new Hono();
const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
};
function safeUser(user) {
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        onboardingComplete: user.onboardingComplete,
        createdAt: user.createdAt,
    };
}
// POST /auth/signup
auth.post('/signup', zValidator('json', signupSchema), async (c) => {
    const { fullName, email, password } = c.req.valid('json');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return c.json({ error: 'Email already in use', code: 'EMAIL_EXISTS' }, 409);
    }
    const passwordHash = await hashPassword(password);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const user = await prisma.user.create({
        data: {
            email,
            fullName,
            passwordHash,
            emailVerifyToken: verifyToken,
            emailVerifyExpiry: verifyExpiry,
            studentProfile: { create: {} },
            familyInfo: { create: {} },
            settings: { create: {} },
        },
    });
    await sendVerificationEmail(email, verifyToken);
    const accessToken = await signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = await signRefreshToken(user.id);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.session.create({
        data: {
            userId: user.id,
            refreshTokenHash,
            userAgent: c.req.header('user-agent'),
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    setCookie(c, REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    await prisma.auditLog.create({
        data: { userId: user.id, action: 'user.signup', ipAddress: c.req.header('x-forwarded-for') },
    });
    // Create welcome notification
    await prisma.notification.create({
        data: {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Welcome to Vidyut!',
            message: 'Start by completing your profile to get personalised scholarship recommendations.',
            link: '/profile',
        },
    });
    return c.json({ user: safeUser(user), accessToken }, 201);
});
// POST /auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401);
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
        return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401);
    }
    const accessToken = await signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = await signRefreshToken(user.id);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.session.create({
        data: {
            userId: user.id,
            refreshTokenHash,
            userAgent: c.req.header('user-agent'),
            ipAddress: c.req.header('x-forwarded-for') ?? 'unknown',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    // Removed lastLoginAt update as field is no longer in schema
    setCookie(c, REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    await prisma.auditLog.create({
        data: { userId: user.id, action: 'user.login', ipAddress: c.req.header('x-forwarded-for') },
    });
    return c.json({ user: safeUser(user), accessToken });
});
// POST /auth/logout
auth.post('/logout', async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    if (refreshToken) {
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.session.deleteMany({ where: { refreshTokenHash: hash } });
    }
    deleteCookie(c, REFRESH_COOKIE, { path: '/' });
    return c.json({ message: 'Logged out' });
});
// POST /auth/refresh
auth.post('/refresh', async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    if (!refreshToken) {
        return c.json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' }, 401);
    }
    let userId;
    try {
        const payload = await verifyRefreshToken(refreshToken);
        userId = payload.userId;
    }
    catch {
        deleteCookie(c, REFRESH_COOKIE, { path: '/' });
        return c.json({ error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' }, 401);
    }
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    if (!session || session.expiresAt < new Date()) {
        deleteCookie(c, REFRESH_COOKIE, { path: '/' });
        return c.json({ error: 'Session expired', code: 'SESSION_EXPIRED' }, 401);
    }
    // Rotate refresh token
    await prisma.session.delete({ where: { refreshTokenHash: hash } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 401);
    }
    const newAccessToken = await signAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = await signRefreshToken(user.id);
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma.session.create({
        data: {
            userId: user.id,
            refreshTokenHash: newHash,
            userAgent: session.userAgent,
            ipAddress: session.ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    setCookie(c, REFRESH_COOKIE, newRefreshToken, COOKIE_OPTS);
    return c.json({ user: safeUser(user), accessToken: newAccessToken });
});
// GET /auth/me
auth.get('/me', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        return c.json({ error: 'User not found' }, 404);
    return c.json({ user: safeUser(user) });
});
// POST /auth/verify-email
auth.post('/verify-email', zValidator('json', verifyEmailSchema), async (c) => {
    const { token } = c.req.valid('json');
    const user = await prisma.user.findFirst({
        where: { emailVerifyToken: token },
    });
    if (!user || !user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
        return c.json({ error: 'Invalid or expired verification token', code: 'INVALID_TOKEN' }, 400);
    }
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerifyToken: null,
            emailVerifyExpiry: null,
        },
    });
    return c.json({ message: 'Email verified successfully' });
});
// POST /auth/forgot-password
auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
    const { email } = c.req.valid('json');
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user)
        return c.json({ message: 'If that email exists, a reset link has been sent.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: resetExpiry },
    });
    await sendPasswordResetEmail(email, resetToken);
    return c.json({ message: 'If that email exists, a reset link has been sent.' });
});
// POST /auth/reset-password
auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
    const { token, password } = c.req.valid('json');
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return c.json({ error: 'Invalid or expired reset token', code: 'INVALID_TOKEN' }, 400);
    }
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
    // Revoke all sessions
    await prisma.session.deleteMany({ where: { userId: user.id } });
    return c.json({ message: 'Password reset successfully. Please log in again.' });
});
export default auth;
//# sourceMappingURL=auth.js.map