import { CommentType } from '../enums';

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  type: CommentType;
  content: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
  };
}
