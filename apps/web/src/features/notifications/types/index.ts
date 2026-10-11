export type NotificationType = 'system' | 'application' | 'deadline' | 'document';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}
