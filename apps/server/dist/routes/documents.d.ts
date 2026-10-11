import { Hono } from 'hono';
declare const documents: Hono<{
    Variables: {
        userId: string;
        role: string;
    };
}, import("hono/types").BlankSchema, "/">;
export default documents;
//# sourceMappingURL=documents.d.ts.map