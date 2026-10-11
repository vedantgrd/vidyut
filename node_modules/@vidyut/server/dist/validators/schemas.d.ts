import { z } from 'zod';
export declare const signupSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>, {
    password: string;
    confirmPassword: string;
    token: string;
}, {
    password: string;
    confirmPassword: string;
    token: string;
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dateOfBirth: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    gender: z.ZodNullable<z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]>>>;
    nationality: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    religion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodNullable<z.ZodOptional<z.ZodEnum<["GENERAL", "OBC", "SC", "ST", "EWS", "OTHER"]>>>;
    isMinority: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    hasDisability: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    disabilityDetails: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    domicileState: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    addressLine2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    state: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pincode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fatherName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    motherName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    annualFamilyIncome: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    isBPL: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    parentOccupation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currentEducationLevel: z.ZodNullable<z.ZodOptional<z.ZodEnum<["CLASS_10", "CLASS_12", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE", "DOCTORATE", "OTHER"]>>>;
    institutionName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    universityName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    courseName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    branch: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currentSemester: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    admissionYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    expectedGraduationYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    rollNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tenthPercentage: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    tenthBoard: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tenthYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    twelfthPercentage: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    twelfthBoard: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    twelfthYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    twelfthStream: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    diplomaPercentage: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    diplomaField: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ugCGPA: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    ugDegree: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ugUniversity: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pgCGPA: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    pgDegree: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    achievements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    extracurriculars: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    careerGoals: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    phone?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null | undefined;
    nationality?: string | null | undefined;
    religion?: string | null | undefined;
    category?: "OTHER" | "GENERAL" | "OBC" | "SC" | "ST" | "EWS" | null | undefined;
    isMinority?: boolean | null | undefined;
    hasDisability?: boolean | null | undefined;
    disabilityDetails?: string | null | undefined;
    domicileState?: string | null | undefined;
    addressLine1?: string | null | undefined;
    addressLine2?: string | null | undefined;
    city?: string | null | undefined;
    state?: string | null | undefined;
    pincode?: string | null | undefined;
    fatherName?: string | null | undefined;
    motherName?: string | null | undefined;
    annualFamilyIncome?: number | null | undefined;
    isBPL?: boolean | null | undefined;
    parentOccupation?: string | null | undefined;
    currentEducationLevel?: "OTHER" | "CLASS_10" | "CLASS_12" | "DIPLOMA" | "UNDERGRADUATE" | "POSTGRADUATE" | "DOCTORATE" | null | undefined;
    institutionName?: string | null | undefined;
    universityName?: string | null | undefined;
    courseName?: string | null | undefined;
    branch?: string | null | undefined;
    currentSemester?: number | null | undefined;
    admissionYear?: number | null | undefined;
    expectedGraduationYear?: number | null | undefined;
    rollNumber?: string | null | undefined;
    tenthPercentage?: number | null | undefined;
    tenthBoard?: string | null | undefined;
    tenthYear?: number | null | undefined;
    twelfthPercentage?: number | null | undefined;
    twelfthBoard?: string | null | undefined;
    twelfthYear?: number | null | undefined;
    twelfthStream?: string | null | undefined;
    diplomaPercentage?: number | null | undefined;
    diplomaField?: string | null | undefined;
    ugCGPA?: number | null | undefined;
    ugDegree?: string | null | undefined;
    ugUniversity?: string | null | undefined;
    pgCGPA?: number | null | undefined;
    pgDegree?: string | null | undefined;
    skills?: string[] | undefined;
    achievements?: string[] | undefined;
    extracurriculars?: string[] | undefined;
    languages?: string[] | undefined;
    careerGoals?: string | null | undefined;
    bio?: string | null | undefined;
}, {
    phone?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null | undefined;
    nationality?: string | null | undefined;
    religion?: string | null | undefined;
    category?: "OTHER" | "GENERAL" | "OBC" | "SC" | "ST" | "EWS" | null | undefined;
    isMinority?: boolean | null | undefined;
    hasDisability?: boolean | null | undefined;
    disabilityDetails?: string | null | undefined;
    domicileState?: string | null | undefined;
    addressLine1?: string | null | undefined;
    addressLine2?: string | null | undefined;
    city?: string | null | undefined;
    state?: string | null | undefined;
    pincode?: string | null | undefined;
    fatherName?: string | null | undefined;
    motherName?: string | null | undefined;
    annualFamilyIncome?: number | null | undefined;
    isBPL?: boolean | null | undefined;
    parentOccupation?: string | null | undefined;
    currentEducationLevel?: "OTHER" | "CLASS_10" | "CLASS_12" | "DIPLOMA" | "UNDERGRADUATE" | "POSTGRADUATE" | "DOCTORATE" | null | undefined;
    institutionName?: string | null | undefined;
    universityName?: string | null | undefined;
    courseName?: string | null | undefined;
    branch?: string | null | undefined;
    currentSemester?: number | null | undefined;
    admissionYear?: number | null | undefined;
    expectedGraduationYear?: number | null | undefined;
    rollNumber?: string | null | undefined;
    tenthPercentage?: number | null | undefined;
    tenthBoard?: string | null | undefined;
    tenthYear?: number | null | undefined;
    twelfthPercentage?: number | null | undefined;
    twelfthBoard?: string | null | undefined;
    twelfthYear?: number | null | undefined;
    twelfthStream?: string | null | undefined;
    diplomaPercentage?: number | null | undefined;
    diplomaField?: string | null | undefined;
    ugCGPA?: number | null | undefined;
    ugDegree?: string | null | undefined;
    ugUniversity?: string | null | undefined;
    pgCGPA?: number | null | undefined;
    pgDegree?: string | null | undefined;
    skills?: string[] | undefined;
    achievements?: string[] | undefined;
    extracurriculars?: string[] | undefined;
    languages?: string[] | undefined;
    careerGoals?: string | null | undefined;
    bio?: string | null | undefined;
}>;
export declare const scholarshipQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["GOVERNMENT", "PRIVATE", "NGO", "INTERNATIONAL", "MINORITY", "MERIT", "NEED_BASED", "SPORTS", "RESEARCH", "STARTUP", "STUDY_ABROAD"]>>;
    educationLevel: z.ZodOptional<z.ZodEnum<["CLASS_10", "CLASS_12", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE", "DOCTORATE", "OTHER"]>>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    state: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodDefault<z.ZodEnum<["deadline", "amount", "matchScore", "newest"]>>;
    tags: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "deadline" | "amount" | "matchScore" | "newest";
    search?: string | undefined;
    category?: "GOVERNMENT" | "PRIVATE" | "NGO" | "INTERNATIONAL" | "MINORITY" | "MERIT" | "NEED_BASED" | "SPORTS" | "RESEARCH" | "STARTUP" | "STUDY_ABROAD" | undefined;
    state?: string | undefined;
    educationLevel?: "OTHER" | "CLASS_10" | "CLASS_12" | "DIPLOMA" | "UNDERGRADUATE" | "POSTGRADUATE" | "DOCTORATE" | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    featured?: boolean | undefined;
    tags?: string | undefined;
}, {
    search?: string | undefined;
    category?: "GOVERNMENT" | "PRIVATE" | "NGO" | "INTERNATIONAL" | "MINORITY" | "MERIT" | "NEED_BASED" | "SPORTS" | "RESEARCH" | "STARTUP" | "STUDY_ABROAD" | undefined;
    state?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    educationLevel?: "OTHER" | "CLASS_10" | "CLASS_12" | "DIPLOMA" | "UNDERGRADUATE" | "POSTGRADUATE" | "DOCTORATE" | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    featured?: boolean | undefined;
    sortBy?: "deadline" | "amount" | "matchScore" | "newest" | undefined;
    tags?: string | undefined;
}>;
export declare const createApplicationSchema: z.ZodObject<{
    scholarshipId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    scholarshipId: string;
    notes?: string | undefined;
}, {
    scholarshipId: string;
    notes?: string | undefined;
}>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    notes?: string | undefined;
}, {
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    notes?: string | undefined;
}>;
export declare const updateSettingsSchema: z.ZodObject<{
    emailDeadlineReminders: z.ZodOptional<z.ZodBoolean>;
    emailApplicationUpdates: z.ZodOptional<z.ZodBoolean>;
    emailNewMatches: z.ZodOptional<z.ZodBoolean>;
    pushNotifications: z.ZodOptional<z.ZodBoolean>;
    language: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    emailDeadlineReminders?: boolean | undefined;
    emailApplicationUpdates?: boolean | undefined;
    emailNewMatches?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    language?: string | undefined;
}, {
    emailDeadlineReminders?: boolean | undefined;
    emailApplicationUpdates?: boolean | undefined;
    emailNewMatches?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    language?: string | undefined;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const createConversationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
}, {
    title?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map