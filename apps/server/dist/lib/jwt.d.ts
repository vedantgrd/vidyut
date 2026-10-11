export interface AccessTokenPayload {
    userId: string;
    role: string;
}
export declare function signAccessToken(payload: AccessTokenPayload): Promise<string>;
export declare function verifyAccessToken(token: string): Promise<AccessTokenPayload>;
export declare function signRefreshToken(userId: string): Promise<string>;
export declare function verifyRefreshToken(token: string): Promise<{
    userId: string;
}>;
//# sourceMappingURL=jwt.d.ts.map