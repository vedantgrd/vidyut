import type { Context, Next } from 'hono';
export declare function authMiddleware(c: Context, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
    code: string;
}, 401, "json">) | undefined>;
/** Optional auth — attaches userId if token is present, does not block if absent */
export declare function optionalAuthMiddleware(c: Context, next: Next): Promise<void>;
//# sourceMappingURL=auth.d.ts.map