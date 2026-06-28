import type { ApplicationRecord, ApplicationStage } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app_1',
    scholarshipId: 'sch_1',
    title: 'State Excellence Award',
    provider: 'Ministry of Education',
    amount: 50000,
    stage: 'draft',
    deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
    completionPercentage: 65,
  },
  {
    id: 'app_2',
    scholarshipId: 'sch_3',
    title: 'Minority Welfare Scholarship',
    provider: 'Ministry of Minority Affairs',
    amount: 30000,
    stage: 'submitted',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
    completionPercentage: 100,
  },
  {
    id: 'app_3',
    scholarshipId: 'sch_2',
    title: 'Women in STEM Initiative',
    provider: 'AICTE',
    amount: 75000,
    stage: 'under_review',
    deadline: new Date(Date.now() - 86400000 * 5).toISOString(), // Past deadline
    lastUpdated: new Date(Date.now() - 86400000 * 10).toISOString(),
    completionPercentage: 100,
  },
  {
    id: 'app_4',
    scholarshipId: 'sch_4',
    title: 'National Merit Scholarship',
    provider: 'Central Board',
    amount: 100000,
    stage: 'approved',
    deadline: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000 * 5).toISOString(),
    completionPercentage: 100,
  }
];

export const trackerService = {
  async fetchApplications(): Promise<ApplicationRecord[]> {
    await delay(1000);
    return MOCK_APPLICATIONS;
  },

  async updateApplicationStage(_id: string, _stage: ApplicationStage): Promise<boolean> {
    await delay(500);
    return true;
  }
};
