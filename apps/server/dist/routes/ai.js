import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
const ai = new Hono();
ai.use('*', authMiddleware);
// POST /ai/ask - Stateless AI helper endpoint
ai.post('/ask', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => ({}));
    const { question, scholarshipId } = body;
    if (!question) {
        return c.json({ success: false, error: { message: 'Question is required' } }, 400);
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            studentProfile: true,
            familyInfo: true,
            academicRecords: true
        }
    });
    let scholarshipInfo = '';
    if (scholarshipId) {
        const scholarship = await prisma.scholarship.findUnique({
            where: { id: scholarshipId },
            include: {
                eligibilityRules: true,
                requiredDocuments: true
            }
        });
        if (scholarship) {
            scholarshipInfo = `for "${scholarship.name}" (provided by ${scholarship.provider}, amount: ${scholarship.amountDescription ?? `₹${scholarship.amount}`})`;
        }
    }
    // Stateless mock answer explaining eligibility
    const answer = `Based on your profile, I can help clarify requirements ${scholarshipInfo}. You are welcome to upload documents under the Document Vault and track your submissions. Currently, I am operating in stateless mode to support form filling.`;
    return c.json({
        success: true,
        data: {
            answer
        }
    });
});
export default ai;
//# sourceMappingURL=ai.js.map