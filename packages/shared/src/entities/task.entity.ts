import { TaskStatus, TaskType } from '../enums';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  parentId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  estimatedHours: number | null;
  claimDeadline: Date | null;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TaskWithRelations extends Task {
  assignee?: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
  };
  team?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    title: string;
  };
  children?: Task[];
}
