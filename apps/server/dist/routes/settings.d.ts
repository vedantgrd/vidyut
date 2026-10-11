import { Hono } from 'hono';
declare const settings: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default settings;
//# sourceMappingURL=settings.d.ts.map