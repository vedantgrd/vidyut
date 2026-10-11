import { Hono } from 'hono';
declare const dashboard: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default dashboard;
//# sourceMappingURL=dashboard.d.ts.map