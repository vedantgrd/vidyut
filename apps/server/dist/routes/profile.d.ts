import { Hono } from 'hono';
declare const profile: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default profile;
//# sourceMappingURL=profile.d.ts.map