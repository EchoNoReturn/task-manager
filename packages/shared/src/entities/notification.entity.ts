import { NotificationType } from '../enums';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedTaskId: string | null;
  relatedUserId: string | null;
  isRead: boolean;
  createdAt: Date;
}
