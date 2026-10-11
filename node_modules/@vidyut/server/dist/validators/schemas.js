import { z } from 'zod';
// ─── AUTH ─────────────────────────────────────────────────────────────────────
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[\W_]/, 'Must contain at least one special character');
export const signupSchema = z
    .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
})
    .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});
export const resetPasswordSchema = z
    .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
})
    .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
export const verifyEmailSchema = z.object({
    token: z.string().min(1),
});
// ─── PROFILE ──────────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
    nationality: z.string().optional().nullable(),
    religion: z.string().optional().nullable(),
    category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional().nullable(),
    isMinority: z.boolean().optional().nullable(),
    hasDisability: z.boolean().optional().nullable(),
    disabilityDetails: z.string().optional().nullable(),
    domicileState: z.string().optional().nullable(),
    addressLine1: z.string().optional().nullable(),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    fatherName: z.string().optional().nullable(),
    motherName: z.string().optional().nullable(),
    annualFamilyIncome: z.number().int().min(0).optional().nullable(),
    isBPL: z.boolean().optional().nullable(),
    parentOccupation: z.string().optional().nullable(),
    currentEducationLevel: z
        .enum(['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE', 'OTHER'])
        .optional()
        .nullable(),
    institutionName: z.string().optional().nullable(),
    universityName: z.string().optional().nullable(),
    courseName: z.string().optional().nullable(),
    branch: z.string().optional().nullable(),
    currentSemester: z.number().int().min(1).max(12).optional().nullable(),
    admissionYear: z.number().int().optional().nullable(),
    expectedGraduationYear: z.number().int().optional().nullable(),
    rollNumber: z.string().optional().nullable(),
    tenthPercentage: z.number().min(0).max(100).optional().nullable(),
    tenthBoard: z.string().optional().nullable(),
    tenthYear: z.number().int().optional().nullable(),
    twelfthPercentage: z.number().min(0).max(100).optional().nullable(),
    twelfthBoard: z.string().optional().nullable(),
    twelfthYear: z.number().int().optional().nullable(),
    twelfthStream: z.string().optional().nullable(),
    diplomaPercentage: z.number().min(0).max(100).optional().nullable(),
    diplomaField: z.string().optional().nullable(),
    ugCGPA: z.number().min(0).max(10).optional().nullable(),
    ugDegree: z.string().optional().nullable(),
    ugUniversity: z.string().optional().nullable(),
    pgCGPA: z.number().min(0).max(10).optional().nullable(),
    pgDegree: z.string().optional().nullable(),
    skills: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    extracurriculars: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    careerGoals: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
});
// ─── SCHOLARSHIP FILTERS ─────────────────────────────────────────────────────
export const scholarshipQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().optional(),
    category: z
        .enum(['GOVERNMENT', 'PRIVATE', 'NGO', 'INTERNATIONAL', 'MINORITY', 'MERIT', 'NEED_BASED', 'SPORTS', 'RESEARCH', 'STARTUP', 'STUDY_ABROAD'])
        .optional(),
    educationLevel: z
        .enum(['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE', 'OTHER'])
        .optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    state: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    sortBy: z.enum(['deadline', 'amount', 'matchScore', 'newest']).default('matchScore'),
    tags: z.string().optional(), // comma-separated
});
// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
export const createApplicationSchema = z.object({
    scholarshipId: z.string().min(1),
    notes: z.string().optional(),
});
export const updateApplicationStatusSchema = z.object({
    status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']),
    notes: z.string().optional(),
});
// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export const updateSettingsSchema = z.object({
    emailDeadlineReminders: z.boolean().optional(),
    emailApplicationUpdates: z.boolean().optional(),
    emailNewMatches: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    language: z.string().optional(),
});
// ─── AI ───────────────────────────────────────────────────────────────────────
export const sendMessageSchema = z.object({
    content: z.string().min(1).max(4000),
});
export const createConversationSchema = z.object({
    title: z.string().max(100).optional(),
});
//# sourceMappingURL=schemas.js.map