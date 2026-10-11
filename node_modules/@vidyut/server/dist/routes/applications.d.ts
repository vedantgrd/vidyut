import { Hono } from 'hono';
declare const applications: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default applications;
//# sourceMappingURL=applications.d.ts.map