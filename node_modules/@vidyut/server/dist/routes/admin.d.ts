import { Hono } from 'hono';
declare const admin: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default admin;
//# sourceMappingURL=admin.d.ts.map