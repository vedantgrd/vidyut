import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import crypto from 'node:crypto';
import { DocumentType, DocumentStatus } from '@prisma/client';
const documents = new Hono();
documents.use('*', authMiddleware);
const STORAGE_PATH = process.env.STORAGE_PATH ?? './uploads';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// GET /documents - List user's documents
documents.get('/', async (c) => {
    const userId = c.get('userId');
    const docs = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    return c.json({
        success: true,
        data: docs
    });
});
// POST /documents/upload - Upload file to document vault
documents.post('/upload', async (c) => {
    const userId = c.get('userId');
    let formData;
    try {
        formData = await c.req.formData();
    }
    catch {
        return c.json({ success: false, error: { message: 'Invalid form data' } }, 400);
    }
    const file = formData.get('file');
    const docType = formData.get('type');
    const label = formData.get('label');
    if (!file || !docType || !label) {
        return c.json({ success: false, error: { message: 'file, type, and label are required' } }, 400);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return c.json({ success: false, error: { message: 'Only JPEG, PNG, WebP, and PDF files are allowed' } }, 400);
    }
    if (file.size > MAX_FILE_SIZE) {
        return c.json({ success: false, error: { message: 'File size must be under 5MB' } }, 400);
    }
    const validTypes = Object.values(DocumentType);
    if (!validTypes.includes(docType)) {
        return c.json({ success: false, error: { message: 'Invalid document type' } }, 400);
    }
    // Save file to local storage
    const ext = extname(file.name) || '.pdf';
    const filename = `${userId}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const userDir = join(STORAGE_PATH, userId);
    const filePath = join(userDir, filename);
    try {
        await mkdir(userDir, { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
    }
    catch (err) {
        console.error('File write error:', err);
        return c.json({ success: false, error: { message: 'Failed to save file' } }, 500);
    }
    const document = await prisma.document.create({
        data: {
            userId,
            type: docType,
            label,
            fileName: file.name,
            filePath: `/${userId}/${filename}`,
            fileSize: file.size,
            mimeType: file.type,
            status: DocumentStatus.PENDING,
        },
    });
    return c.json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
    }, 201);
});
// DELETE /documents/:id - Delete file
documents.delete('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
        return c.json({ success: false, error: { message: 'Document not found' } }, 404);
    }
    if (doc.userId !== userId) {
        return c.json({ success: false, error: { message: 'Forbidden' } }, 403);
    }
    await prisma.document.delete({ where: { id } });
    return c.json({
        success: true,
        message: 'Document deleted successfully'
    });
});
export default documents;
//# sourceMappingURL=documents.js.map