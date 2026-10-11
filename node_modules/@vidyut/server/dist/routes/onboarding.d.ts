import { Hono } from 'hono';
declare const onboarding: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default onboarding;
//# sourceMappingURL=onboarding.d.ts.map