import { Hono } from 'hono';
declare const notifications: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default notifications;
//# sourceMappingURL=notifications.d.ts.map