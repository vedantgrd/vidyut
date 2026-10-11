export interface ScholarshipDetail {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  matchScore: number;
  tags: string[];
  description: string;
  eligibility: string[];
  isSaved?: boolean;
}

export interface FilterCriteria {
  searchQuery: string;
  minAmount: number;
  maxAmount: number;
  tags: string[];
  sortBy: 'matchScore' | 'deadline' | 'amount';
}
