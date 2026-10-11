import { RuleType } from '@prisma/client';
export interface RuleEvaluationResult {
    ruleId: string;
    ruleType: RuleType;
    passed: boolean;
    reason: string;
}
export interface DocumentEvaluationResult {
    requiredDocumentId: string;
    documentType: string;
    label: string;
    status: 'MISSING' | 'PENDING' | 'REJECTED' | 'VERIFIED';
    documentId?: string;
}
export interface EligibilityReport {
    isEligible: boolean;
    rulesEvaluated: RuleEvaluationResult[];
    documentsEvaluated: DocumentEvaluationResult[];
    hasAllVerifiedDocuments: boolean;
}
export declare class EligibilityEngine {
    /**
     * Evaluates if a student is eligible for a given scholarship.
     */
    static evaluate(userId: string, scholarshipId: string): Promise<EligibilityReport>;
    private static evaluateRule;
}
//# sourceMappingURL=EligibilityEngine.d.ts.map