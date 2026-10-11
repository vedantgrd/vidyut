import { SignJWT, jwtVerify } from 'jose';
const getAccessSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret)
        throw new Error('JWT_ACCESS_SECRET is not set');
    return new TextEncoder().encode(secret);
};
const getRefreshSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret)
        throw new Error('JWT_REFRESH_SECRET is not set');
    return new TextEncoder().encode(secret);
};
export async function signAccessToken(payload) {
    const expiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(getAccessSecret());
}
export async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload;
}
export async function signRefreshToken(userId) {
    const expiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    return new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(getRefreshSecret());
}
export async function verifyRefreshToken(token) {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload;
}
//# sourceMappingURL=jwt.js.map