import type { DashboardData } from '../types';

/**
 * Dashboard Service
 * Provides mocked data with realistic latency for the dashboard UI.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDashboardData: DashboardData = {
  greeting: 'Welcome back, Vidyut Student',
  stats: [
    {
      id: 'stat_1',
      label: 'Active Applications',
      value: 3,
      trend: { value: 1, isPositive: true },
    },
    {
      id: 'stat_2',
      label: 'Total Disbursed',
      value: '₹1,50,000',
    },
    {
      id: 'stat_3',
      label: 'Documents Verified',
      value: '100%',
      trend: { value: 20, isPositive: true },
    }
  ],
  recentActivity: [
    {
      id: 'act_1',
      type: 'application_update',
      title: 'Application Approved',
      description: 'Your application for the National Merit Scholarship has been approved.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
    },
    {
      id: 'act_2',
      type: 'document_verified',
      title: 'Income Certificate Verified',
      description: 'Your income certificate has been verified by the issuing authority.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
    }
  ],
  recommendedScholarships: [
    {
      id: 'sch_1',
      title: 'State Excellence Award',
      provider: 'Ministry of Education',
      amount: 50000,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days
      matchScore: 98,
      tags: ['Merit-based', 'State'],
    },
    {
      id: 'sch_2',
      title: 'Women in STEM Initiative',
      provider: 'AICTE',
      amount: 75000,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
      matchScore: 95,
      tags: ['STEM', 'Women'],
    }
  ],
  upcomingDeadlines: [
    {
      id: 'sch_3',
      title: 'Minority Welfare Scholarship',
      provider: 'Ministry of Minority Affairs',
      amount: 30000,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days
      matchScore: 85,
      tags: ['Minority', 'Need-based'],
    }
  ]
};

export const dashboardService = {
  async fetchDashboardData(): Promise<DashboardData> {
    await delay(1200); // Simulate network latency
    // Simulate rare random error for robustness testing (1 in 20 chance)
    if (Math.random() > 0.95) {
      throw new Error('Failed to fetch dashboard data. Please try again.');
    }
    return mockDashboardData;
  }
};
