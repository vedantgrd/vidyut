export type ApplicationStage = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface ApplicationRecord {
  id: string;
  scholarshipId: string;
  title: string;
  provider: string;
  amount: number;
  stage: ApplicationStage;
  deadline: string;
  lastUpdated: string;
  completionPercentage: number;
}
