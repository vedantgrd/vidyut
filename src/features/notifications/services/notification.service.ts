import type { NotificationPayload } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_NOTIFS: NotificationPayload[] = [
  {
    id: 'notif_1',
    type: 'application',
    title: 'Application Approved',
    message: 'Your application for the National Merit Scholarship has been approved.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
    link: '/workspace'
  },
  {
    id: 'notif_2',
    type: 'document',
    title: 'Income Certificate Verified',
    message: 'Your income certificate has been verified by the issuing authority.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    isRead: false,
    link: '/profile'
  },
  {
    id: 'notif_3',
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'You have 3 days left to submit the Minority Welfare Scholarship.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    isRead: true,
    link: '/workspace'
  }
];

export const notificationService = {
  async fetchNotifications(): Promise<NotificationPayload[]> {
    await delay(700);
    return MOCK_NOTIFS;
  },

  async markAsRead(_id: string): Promise<boolean> {
    await delay(300);
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    await delay(500);
    return true;
  }
};
