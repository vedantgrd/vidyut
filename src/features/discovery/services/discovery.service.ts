import type { ScholarshipDetail, FilterCriteria } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_DATA: ScholarshipDetail[] = [
  {
    id: '1',
    title: 'Global Tech Innovators Scholarship',
    provider: 'Tech Foundation',
    amount: 150000,
    deadline: new Date(Date.now() + 86400000 * 45).toISOString(),
    matchScore: 99,
    tags: ['Tech', 'Merit'],
    description: 'Awarded to outstanding students pursuing degrees in Computer Science.',
    eligibility: ['GPA > 3.8', 'Computer Science Major']
  },
  {
    id: '2',
    title: 'Women in Engineering Grant',
    provider: 'Engineering Council',
    amount: 75000,
    deadline: new Date(Date.now() + 86400000 * 20).toISOString(),
    matchScore: 95,
    tags: ['Engineering', 'Women'],
    description: 'Empowering the next generation of female engineers.',
    eligibility: ['Female identifying', 'Engineering Major']
  },
  {
    id: '3',
    title: 'State Excellence Award',
    provider: 'Ministry of Education',
    amount: 50000,
    deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
    matchScore: 88,
    tags: ['State', 'Merit'],
    description: 'State-sponsored award for academic excellence.',
    eligibility: ['Resident of State', 'Top 10% class rank']
  },
  {
    id: '4',
    title: 'First-Generation College Student Fund',
    provider: 'EduCare Trust',
    amount: 100000,
    deadline: new Date(Date.now() + 86400000 * 60).toISOString(),
    matchScore: 82,
    tags: ['Need-based', 'First-Gen'],
    description: 'Supporting students who are the first in their family to attend college.',
    eligibility: ['First-generation college student', 'Demonstrated financial need']
  }
];

export const discoveryService = {
  async searchScholarships(filters: FilterCriteria): Promise<ScholarshipDetail[]> {
    await delay(800); // Network latency
    
    let results = [...MOCK_DATA];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(s => s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q));
    }

    if (filters.minAmount > 0) {
      results = results.filter(s => s.amount >= filters.minAmount);
    }
    
    if (filters.maxAmount > 0 && filters.maxAmount < 500000) {
      results = results.filter(s => s.amount <= filters.maxAmount);
    }

    if (filters.tags.length > 0) {
      results = results.filter(s => s.tags.some(t => filters.tags.includes(t)));
    }

    results.sort((a, b) => {
      if (filters.sortBy === 'amount') return b.amount - a.amount;
      if (filters.sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return b.matchScore - a.matchScore; // Default matchScore
    });

    return results;
  },

  async getScholarshipDetails(_id: string): Promise<ScholarshipDetail | null> {
    await delay(300);
    return MOCK_DATA[0] || null;
  },

  async toggleSave(_id: string): Promise<boolean> {
    await delay(300);
    return true;
  }
};
