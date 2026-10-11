import { Hono } from 'hono';
declare const calendar: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default calendar;
//# sourceMappingURL=calendar.d.ts.map