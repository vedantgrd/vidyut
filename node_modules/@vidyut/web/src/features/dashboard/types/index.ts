export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
}

export interface ActivityItem {
  id: string;
  type: 'application_update' | 'document_verified' | 'deadline_reminder' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export interface ScholarshipPreview {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  matchScore: number; // 0-100
  tags: string[];
}

export interface DashboardData {
  greeting: string;
  stats: DashboardStat[];
  recentActivity: ActivityItem[];
  recommendedScholarships: ScholarshipPreview[];
  upcomingDeadlines: ScholarshipPreview[];
}
